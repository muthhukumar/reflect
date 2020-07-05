import { BufWriter } from "../io/bufio.ts";
import { TextProtoReader } from "../textproto/mod.ts";
import { assert } from "../_util/assert.ts";
import { encoder } from "../encoding/utf8.ts";
import { ServerRequest } from "./server.ts";
import { STATUS_TEXT } from "./http_status.ts";
export function emptyReader() {
    return {
        read(_) {
            return Promise.resolve(null);
        },
    };
}
export function bodyReader(contentLength, r) {
    let totalRead = 0;
    let finished = false;
    async function read(buf) {
        if (finished)
            return null;
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
            result = await r.read(buf);
        }
        else {
            const readBuf = buf.subarray(0, remaining);
            result = await r.read(readBuf);
        }
        if (result !== null) {
            totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
    }
    return { read };
}
export function chunkedBodyReader(h, r) {
    // Based on https://tools.ietf.org/html/rfc2616#section-19.4.6
    const tp = new TextProtoReader(r);
    let finished = false;
    const chunks = [];
    async function read(buf) {
        if (finished)
            return null;
        const [chunk] = chunks;
        if (chunk) {
            const chunkRemaining = chunk.data.byteLength - chunk.offset;
            const readLength = Math.min(chunkRemaining, buf.byteLength);
            for (let i = 0; i < readLength; i++) {
                buf[i] = chunk.data[chunk.offset + i];
            }
            chunk.offset += readLength;
            if (chunk.offset === chunk.data.byteLength) {
                chunks.shift();
                // Consume \r\n;
                if ((await tp.readLine()) === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
            }
            return readLength;
        }
        const line = await tp.readLine();
        if (line === null)
            throw new Deno.errors.UnexpectedEof();
        // TODO: handle chunk extension
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
            throw new Error("Invalid chunk size");
        }
        if (chunkSize > 0) {
            if (chunkSize > buf.byteLength) {
                let eof = await r.readFull(buf);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                eof = await r.readFull(restChunk);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                else {
                    chunks.push({
                        offset: 0,
                        data: restChunk,
                    });
                }
                return buf.byteLength;
            }
            else {
                const bufToFill = buf.subarray(0, chunkSize);
                const eof = await r.readFull(bufToFill);
                if (eof === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                // Consume \r\n
                if ((await tp.readLine()) === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                return chunkSize;
            }
        }
        else {
            assert(chunkSize === 0);
            // Consume \r\n
            if ((await r.readLine()) === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            await readTrailers(h, r);
            finished = true;
            return null;
        }
    }
    return { read };
}
function isProhibidedForTrailer(key) {
    const s = new Set(["transfer-encoding", "content-length", "trailer"]);
    return s.has(key.toLowerCase());
}
/** Read trailer headers from reader and append values to headers. "trailer"
 * field will be deleted. */
export async function readTrailers(headers, r) {
    const trailers = parseTrailer(headers.get("trailer"));
    if (trailers == null)
        return;
    const trailerNames = [...trailers.keys()];
    const tp = new TextProtoReader(r);
    const result = await tp.readMIMEHeader();
    if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
    }
    const undeclared = [...result.keys()].filter((k) => !trailerNames.includes(k));
    if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [k, v] of result) {
        headers.append(k, v);
    }
    const missingTrailers = trailerNames.filter((k) => !result.has(k));
    if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
    }
    headers.delete("trailer");
}
function parseTrailer(field) {
    if (field == null) {
        return undefined;
    }
    const trailerNames = field.split(",").map((v) => v.trim().toLowerCase());
    if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
    }
    const prohibited = trailerNames.filter((k) => isProhibidedForTrailer(k));
    if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
    }
    return new Headers(trailerNames.map((key) => [key, ""]));
}
export async function writeChunkedBody(w, r) {
    const writer = BufWriter.create(w);
    for await (const chunk of Deno.iter(r)) {
        if (chunk.byteLength <= 0)
            continue;
        const start = encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
        const end = encoder.encode("\r\n");
        await writer.write(start);
        await writer.write(chunk);
        await writer.write(end);
    }
    const endChunk = encoder.encode("0\r\n\r\n");
    await writer.write(endChunk);
}
/** Write trailer headers to writer. It should mostly should be called after
 * `writeResponse()`. */
export async function writeTrailers(w, headers, trailers) {
    const trailer = headers.get("trailer");
    if (trailer === null) {
        throw new TypeError("Missing trailer header.");
    }
    const transferEncoding = headers.get("transfer-encoding");
    if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
    }
    const writer = BufWriter.create(w);
    const trailerNames = trailer.split(",").map((s) => s.trim().toLowerCase());
    const prohibitedTrailers = trailerNames.filter((k) => isProhibidedForTrailer(k));
    if (prohibitedTrailers.length > 0) {
        throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
    }
    const undeclared = [...trailers.keys()].filter((k) => !trailerNames.includes(k));
    if (undeclared.length > 0) {
        throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
    }
    for (const [key, value] of trailers) {
        await writer.write(encoder.encode(`${key}: ${value}\r\n`));
    }
    await writer.write(encoder.encode("\r\n"));
    await writer.flush();
}
export async function writeResponse(w, r) {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r.status || 200;
    const statusText = STATUS_TEXT.get(statusCode);
    const writer = BufWriter.create(w);
    if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
    }
    if (!r.body) {
        r.body = new Uint8Array();
    }
    if (typeof r.body === "string") {
        r.body = encoder.encode(r.body);
    }
    let out = `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;
    const headers = r.headers ?? new Headers();
    if (r.body && !headers.get("content-length")) {
        if (r.body instanceof Uint8Array) {
            out += `content-length: ${r.body.byteLength}\r\n`;
        }
        else if (!headers.get("transfer-encoding")) {
            out += "transfer-encoding: chunked\r\n";
        }
    }
    for (const [key, value] of headers) {
        out += `${key}: ${value}\r\n`;
    }
    out += `\r\n`;
    const header = encoder.encode(out);
    const n = await writer.write(header);
    assert(n === header.byteLength);
    if (r.body instanceof Uint8Array) {
        const n = await writer.write(r.body);
        assert(n === r.body.byteLength);
    }
    else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n = await Deno.copy(r.body, writer);
        assert(n === bodyLength);
    }
    else {
        await writeChunkedBody(writer, r.body);
    }
    if (r.trailers) {
        const t = await r.trailers();
        await writeTrailers(writer, headers, t);
    }
    await writer.flush();
}
/**
 * ParseHTTPVersion parses a HTTP version string.
 * "HTTP/1.0" returns (1, 0).
 * Ported from https://github.com/golang/go/blob/f5c43b9/src/net/http/request.go#L766-L792
 */
export function parseHTTPVersion(vers) {
    switch (vers) {
        case "HTTP/1.1":
            return [1, 1];
        case "HTTP/1.0":
            return [1, 0];
        default: {
            const Big = 1000000; // arbitrary upper bound
            if (!vers.startsWith("HTTP/")) {
                break;
            }
            const dot = vers.indexOf(".");
            if (dot < 0) {
                break;
            }
            const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
            const major = Number(majorStr);
            if (!Number.isInteger(major) || major < 0 || major > Big) {
                break;
            }
            const minorStr = vers.substring(dot + 1);
            const minor = Number(minorStr);
            if (!Number.isInteger(minor) || minor < 0 || minor > Big) {
                break;
            }
            return [major, minor];
        }
    }
    throw new Error(`malformed HTTP version ${vers}`);
}
export async function readRequest(conn, bufr) {
    const tp = new TextProtoReader(bufr);
    const firstLine = await tp.readLine(); // e.g. GET /index.html HTTP/1.0
    if (firstLine === null)
        return null;
    const headers = await tp.readMIMEHeader();
    if (headers === null)
        throw new Deno.errors.UnexpectedEof();
    const req = new ServerRequest();
    req.conn = conn;
    req.r = bufr;
    [req.method, req.url, req.proto] = firstLine.split(" ", 3);
    [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
    req.headers = headers;
    fixLength(req);
    return req;
}
function fixLength(req) {
    const contentLength = req.headers.get("Content-Length");
    if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
            const distinct = [...new Set(arrClen.map((e) => e.trim()))];
            if (distinct.length > 1) {
                throw Error("cannot contain multiple Content-Length headers");
            }
            else {
                req.headers.set("Content-Length", distinct[0]);
            }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
            throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
            // A sender MUST NOT send a Content-Length header field in any message
            // that contains a Transfer-Encoding header field.
            // rfc: https://tools.ietf.org/html/rfc7230#section-3.3.2
            throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2lvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2lvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsYUFBYSxFQUFZLE1BQU0sYUFBYSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUUvQyxNQUFNLFVBQVUsV0FBVztJQUN6QixPQUFPO1FBQ0wsSUFBSSxDQUFDLENBQWE7WUFDaEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsYUFBcUIsRUFBRSxDQUFZO0lBQzVELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDckIsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFlO1FBQ2pDLElBQUksUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQzFCLElBQUksTUFBcUIsQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBQzVDLElBQUksU0FBUyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUU7WUFDL0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjthQUFNO1lBQ0wsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDM0MsTUFBTSxHQUFHLE1BQU0s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