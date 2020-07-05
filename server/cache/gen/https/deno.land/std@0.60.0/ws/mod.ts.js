// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { decode, encode } from "../encoding/utf8.ts";
import { hasOwnProperty } from "../_util/has_own_property.ts";
import { BufReader, BufWriter } from "../io/bufio.ts";
import { readLong, readShort, sliceLongToBytes } from "../io/ioutil.ts";
import { Sha1 } from "../hash/sha1.ts";
import { writeResponse } from "../http/_io.ts";
import { TextProtoReader } from "../textproto/mod.ts";
import { deferred } from "../async/deferred.ts";
import { assert } from "../_util/assert.ts";
import { concat } from "../bytes/mod.ts";
export var OpCode;
(function (OpCode) {
    OpCode[OpCode["Continue"] = 0] = "Continue";
    OpCode[OpCode["TextFrame"] = 1] = "TextFrame";
    OpCode[OpCode["BinaryFrame"] = 2] = "BinaryFrame";
    OpCode[OpCode["Close"] = 8] = "Close";
    OpCode[OpCode["Ping"] = 9] = "Ping";
    OpCode[OpCode["Pong"] = 10] = "Pong";
})(OpCode || (OpCode = {}));
export function isWebSocketCloseEvent(a) {
    return hasOwnProperty(a, "code");
}
export function isWebSocketPingEvent(a) {
    return Array.isArray(a) && a[0] === "ping" && a[1] instanceof Uint8Array;
}
export function isWebSocketPongEvent(a) {
    return Array.isArray(a) && a[0] === "pong" && a[1] instanceof Uint8Array;
}
/** Unmask masked websocket payload */
export function unmask(payload, mask) {
    if (mask) {
        for (let i = 0, len = payload.length; i < len; i++) {
            payload[i] ^= mask[i & 3];
        }
    }
}
/** Write websocket frame to given writer */
export async function writeFrame(frame, writer) {
    const payloadLength = frame.payload.byteLength;
    let header;
    const hasMask = frame.mask ? 0x80 : 0;
    if (frame.mask && frame.mask.byteLength !== 4) {
        throw new Error("invalid mask. mask must be 4 bytes: length=" + frame.mask.byteLength);
    }
    if (payloadLength < 126) {
        header = new Uint8Array([0x80 | frame.opcode, hasMask | payloadLength]);
    }
    else if (payloadLength < 0xffff) {
        header = new Uint8Array([
            0x80 | frame.opcode,
            hasMask | 0b01111110,
            payloadLength >>> 8,
            payloadLength & 0x00ff,
        ]);
    }
    else {
        header = new Uint8Array([
            0x80 | frame.opcode,
            hasMask | 0b01111111,
            ...sliceLongToBytes(payloadLength),
        ]);
    }
    if (frame.mask) {
        header = concat(header, frame.mask);
    }
    unmask(frame.payload, frame.mask);
    header = concat(header, frame.payload);
    const w = BufWriter.create(writer);
    await w.write(header);
    await w.flush();
}
/** Read websocket frame from given BufReader
 * @throws `Deno.errors.UnexpectedEof` When peer closed connection without close frame
 * @throws `Error` Frame is invalid
 */
export async function readFrame(buf) {
    let b = await buf.readByte();
    assert(b !== null);
    let isLastFrame = false;
    switch (b >>> 4) {
        case 0b1000:
            isLastFrame = true;
            break;
        case 0b0000:
            isLastFrame = false;
            break;
        default:
            throw new Error("invalid signature");
    }
    const opcode = b & 0x0f;
    // has_mask & payload
    b = await buf.readByte();
    assert(b !== null);
    const hasMask = b >>> 7;
    let payloadLength = b & 0b01111111;
    if (payloadLength === 126) {
        const l = await readShort(buf);
        assert(l !== null);
        payloadLength = l;
    }
    else if (payloadLength === 127) {
        const l = await readLong(buf);
        assert(l !== null);
        payloadLength = Number(l);
    }
    // mask
    let mask;
    if (hasMask) {
        mask = new Uint8Array(4);
        assert((await buf.readFull(mask)) !== null);
    }
    // payload
    const payload = new Uint8Array(payloadLength);
    assert((await buf.readFull(payload)) !== null);
    return {
        isLastFrame,
        opcode,
        mask,
        payload,
    };
}
// Create client-to-server mask, random 32bit number
function createMask() {
    return crypto.getRandomValues(new Uint8Array(4));
}
class WebSocketImpl {
    constructor({ conn, bufReader, bufWriter, mask, }) {
        this.sendQueue = [];
        this._isClosed = false;
        this.conn = conn;
        this.mask = mask;
        this.bufReader = bufReader || new BufReader(conn);
        this.bufWriter = bufWriter || new BufWriter(conn);
    }
    async *[Symbol.asyncIterator]() {
        let frames = [];
        let payloadsLength = 0;
        while (!this._isClosed) {
            let frame;
            try {
                frame = await readFrame(this.bufReader);
            }
            catch (e) {
                this.ensureSocketClosed();
                break;
            }
            unmask(frame.payload, frame.mask);
            switch (frame.opcode) {
                case OpCode.TextFrame:
                case OpCode.BinaryFrame:
                case OpCode.Continue:
                    frames.push(frame);
                    payloadsLength += frame.payload.length;
                    if (frame.isLastFrame) {
                        const concat = new Uint8Array(payloadsLength);
                        let offs = 0;
                        for (const frame of frames) {
                            concat.set(frame.payload, offs);
                            offs += frame.payload.length;
                        }
                        if (frames[0].opcode === OpCode.TextFrame) {
                            // text
                            yield decode(concat);
                        }
                        else {
                            // binary
                            yield concat;
                        }
                        frames = [];
                        payloadsLength = 0;
                    }
                    break;
                case OpCode.Close: {
                    // [0x12, 0x34] -> 0x1234
                    const code = (frame.payload[0] << 8) | frame.payload[1];
                    const reason = decode(frame.payload.subarray(2, frame.payload.length));
                    await this.close(code, reason);
                    yield { code, reason };
                    return;
                }
                case OpCode.Ping:
                    await this.enqueue({
                        opcode: OpCode.Pong,
                        payload: frame.payload,
                        isLastFrame: true,
                    });
                    yield ["ping", frame.payload];
                    break;
                case OpCode.Pong:
                    yield ["pong", frame.payload];
                    break;
                default:
            }
        }
    }
    dequeue() {
        const [entry] = this.sendQueue;
        if (!entry)
            return;
        if (this._isClosed)
            return;
        const { d, frame } = entry;
        writeFrame(frame, this.bufWriter)
            .then(() => d.resolve())
            .catch((e) => d.reject(e))
            .finally(() => {
            this.sendQueue.shift();
            this.dequeue();
        });
    }
    enqueue(frame) {
        if (this._isClosed) {
            throw new Deno.errors.ConnectionReset("Socket has already been closed");
        }
        const d = deferred();
        this.sendQueue.push({ d, frame });
        if (this.sendQueue.length === 1) {
            this.dequeue();
        }
        return d;
    }
    send(data) {
        const opcode = typeof data === "string" ? OpCode.TextFrame : OpCode.BinaryFrame;
        const payload = typeof data === "string" ? encode(data) : data;
        const isLastFrame = true;
        const frame = {
            isLastFrame,
            opcode,
            payload,
            mask: this.mask,
        };
        return this.enqueue(frame);
    }
    ping(data = "") {
        const payload = typeof data === "string" ? encode(data) : data;
        const frame = {
            isLastFrame: true,
            opcode: OpCode.Ping,
            mask: this.mask,
            payload,
        };
        return this.enqueue(frame);
    }
    get isClosed() {
        return this._isClosed;
    }
    async close(code = 1000, reason) {
        try {
            const header = [code >>> 8, code & 0x00ff];
            let payload;
            if (reason) {
                const reasonBytes = encode(reason);
                payload = new Uint8Array(2 + reasonBytes.byteLength);
                payload.set(header);
                payload.set(reasonBytes, 2);
            }
            else {
                payload = new Uint8Array(header);
            }
            await this.enqueue({
                isLastFrame: true,
                opcode: OpCode.Close,
                mask: this.mask,
                payload,
            });
        }
        catch (e) {
            throw e;
        }
        finally {
            this.ensureSocketClosed();
        }
    }
    closeForce() {
        this.ensureSocketClosed();
    }
    ensureSocketClosed() {
        if (this.isClosed)
            return;
        try {
            this.conn.close();
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this._isClosed = true;
            const rest = this.sendQueue;
            this.sendQueue = [];
            rest.forEach((e) => e.d.reject(new Deno.errors.ConnectionReset("Socket has already been closed")));
        }
    }
}
/** Return whether given headers is acceptable for websocket  */
export function acceptable(req) {
    const upgrade = req.headers.get("upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
        return false;
    }
    const secKey = req.headers.get("sec-websocket-key");
    return (req.headers.has("sec-websocket-key") &&
        typeof secKey === "string" &&
        secKey.length > 0);
}
const kGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
/** Create sec-websocket-accept header value with given nonce */
export function createSecAccept(nonce) {
    const sha1 = new Sha1();
    sha1.update(nonce + kGUID);
    const bytes = sha1.digest();
    return btoa(String.fromCharCode(...bytes));
}
/** Upgrade given TCP connection into websocket connection */
export async function acceptWebSocket(req) {
    const { conn, headers, bufReader, bufWriter } = req;
    if (acceptable(req)) {
        const sock = new WebSocketImpl({ conn, bufReader, bufWriter });
        const secKey = headers.get("sec-websocket-key");
        if (typeof secKey !== "string") {
            throw new Error("sec-websocket-key is not provided");
        }
        const secAccept = createSecAccept(secKey);
        await writeResponse(bufWriter, {
            status: 101,
            headers: new Headers({
                Upgrade: "websocket",
                Connection: "Upgrade",
                "Sec-WebSocket-Accept": secAccept,
            }),
        });
        return sock;
    }
    throw new Error("request is not acceptable");
}
const kSecChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.~_";
/** Create WebSocket-Sec-Key. Base64 encoded 16 bytes string */
export function createSecKey() {
    let key = "";
    for (let i = 0; i < 16; i++) {
        const j = Math.floor(Math.random() * kSecChars.length);
        key += kSecChars[j];
    }
    return btoa(key);
}
export async function handshake(url, headers, bufReader, bufWriter) {
    const { hostname, pathname, search } = url;
    const key = createSecKey();
    if (!headers.has("host")) {
        headers.set("host", hostname);
    }
    headers.set("upgrade", "websocket");
    headers.set("connection", "upgrade");
    headers.set("sec-websocket-key", key);
    headers.set("sec-websocket-version", "13");
    let headerStr = `GET ${pathname}${search} HTTP/1.1\r\n`;
    for (const [key, value] of headers) {
        headerStr += `${key}: ${value}\r\n`;
    }
    headerStr += "\r\n";
    await bufWriter.write(encode(headerStr));
    await bufWriter.flush();
    const tpReader = new TextProtoReader(bufReader);
    const statusLine = await tpReader.readLine();
    if (statusLine === null) {
        throw new Deno.errors.UnexpectedEof();
    }
    const m = statusLine.match(/^(?<version>\S+) (?<statusCode>\S+) /);
    if (!m) {
        throw new Error("ws: invalid status line: " + statusLine);
    }
    assert(m.groups);
    const { version, statusCode } = m.groups;
    if (version !== "HTTP/1.1" || statusCode !== "101") {
        throw new Error(`ws: server didn't accept handshake: ` +
            `version=${version}, statusCode=${statusCode}`);
    }
    const responseHeaders = await tpReader.readMIMEHeader();
    if (responseHeaders === null) {
        throw new Deno.errors.UnexpectedEof();
    }
    const expectedSecAccept = createSecAccept(key);
    const secAccept = responseHeaders.get("sec-websocket-accept");
    if (secAccept !== expectedSecAccept) {
        throw new Error(`ws: unexpected sec-websocket-accept header: ` +
            `expected=${expectedSecAccept}, actual=${secAccept}`);
    }
}
/**
 * Connect to given websocket endpoint url.
 * Endpoint must be acceptable for URL.
 */
export async function connectWebSocket(endpoint, headers = new Headers()) {
    const url = new URL(endpoint);
    const { hostname } = url;
    let conn;
    if (url.protocol === "http:" || url.protocol === "ws:") {
        const port = parseInt(url.port || "80");
        conn = await Deno.connect({ hostname, port });
    }
    else if (url.protocol === "https:" || url.protocol === "wss:") {
        const port = parseInt(url.port || "443");
        conn = await Deno.connectTls({ hostname, port });
    }
    else {
        throw new Error("ws: unsupported protocol: " + url.protocol);
    }
    const bufWriter = new BufWriter(conn);
    const bufReader = new BufReader(conn);
    try {
        await handshake(url, headers, bufReader, bufWriter);
    }
    catch (err) {
        conn.close();
        throw err;
    }
    return new WebSocketImpl({
        conn,
        bufWriter,
        bufReader,
        mask: createMask(),
    });
}
export function createWebSocket(params) {
    return new WebSocketImpl(params);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDeEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFZLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekMsTUFBTSxDQUFOLElBQVksTUFPWDtBQVBELFdBQVksTUFBTTtJQUNoQiwyQ0FBYyxDQUFBO0lBQ2QsNkNBQWUsQ0FBQTtJQUNmLGlEQUFpQixDQUFBO0lBQ2pCLHFDQUFXLENBQUE7SUFDWCxtQ0FBVSxDQUFBO0lBQ1Ysb0NBQVUsQ0FBQTtBQUNaLENBQUMsRUFQVyxNQUFNLEtBQU4sTUFBTSxRQU9qQjtBQWNELE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsQ0FBaUI7SUFFakIsT0FBTyxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFJRCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLENBQWlCO0lBRWpCLE9BQU8sS0FBSyxDQUFDLE9BQU8s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