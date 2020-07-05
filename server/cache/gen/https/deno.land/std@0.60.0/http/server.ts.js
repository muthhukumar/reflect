// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { encode } from "../encoding/utf8.ts";
import { BufReader, BufWriter } from "../io/bufio.ts";
import { assert } from "../_util/assert.ts";
import { deferred, MuxAsyncIterator } from "../async/mod.ts";
import { bodyReader, chunkedBodyReader, emptyReader, writeResponse, readRequest, } from "./_io.ts";
export class ServerRequest {
    constructor() {
        this.done = deferred();
        this._contentLength = undefined;
        this._body = null;
        this.finalized = false;
    }
    /**
     * Value of Content-Length header.
     * If null, then content length is invalid or not given (e.g. chunked encoding).
     */
    get contentLength() {
        // undefined means not cached.
        // null means invalid or not provided.
        if (this._contentLength === undefined) {
            const cl = this.headers.get("content-length");
            if (cl) {
                this._contentLength = parseInt(cl);
                // Convert NaN to null (as NaN harder to test)
                if (Number.isNaN(this._contentLength)) {
                    this._contentLength = null;
                }
            }
            else {
                this._contentLength = null;
            }
        }
        return this._contentLength;
    }
    /**
     * Body of the request.  The easiest way to consume the body is:
     *
     *     const buf: Uint8Array = await Deno.readAll(req.body);
     */
    get body() {
        if (!this._body) {
            if (this.contentLength != null) {
                this._body = bodyReader(this.contentLength, this.r);
            }
            else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                    const parts = transferEncoding
                        .split(",")
                        .map((e) => e.trim().toLowerCase());
                    assert(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                    this._body = chunkedBodyReader(this.headers, this.r);
                }
                else {
                    // Neither content-length nor transfer-encoding: chunked
                    this._body = emptyReader();
                }
            }
        }
        return this._body;
    }
    async respond(r) {
        let err;
        try {
            // Write our response!
            await writeResponse(this.w, r);
        }
        catch (e) {
            try {
                // Eagerly close on error.
                this.conn.close();
            }
            catch {
                // Pass
            }
            err = e;
        }
        // Signal that this request has been processed and the next pipelined
        // request on the same connection can be accepted.
        this.done.resolve(err);
        if (err) {
            // Error during responding, rethrow.
            throw err;
        }
    }
    async finalize() {
        if (this.finalized)
            return;
        // Consume unread body
        const body = this.body;
        const buf = new Uint8Array(1024);
        while ((await body.read(buf)) !== null) {
            // Pass
        }
        this.finalized = true;
    }
}
export class Server {
    constructor(listener) {
        this.listener = listener;
        this.closing = false;
        this.connections = [];
    }
    close() {
        this.closing = true;
        this.listener.close();
        for (const conn of this.connections) {
            try {
                conn.close();
            }
            catch (e) {
                // Connection might have been already closed
                if (!(e instanceof Deno.errors.BadResource)) {
                    throw e;
                }
            }
        }
    }
    // Yields all HTTP requests on a single TCP connection.
    async *iterateHttpRequests(conn) {
        const reader = new BufReader(conn);
        const writer = new BufWriter(conn);
        while (!this.closing) {
            let request;
            try {
                request = await readRequest(conn, reader);
            }
            catch (error) {
                if (error instanceof Deno.errors.InvalidData ||
                    error instanceof Deno.errors.UnexpectedEof) {
                    // An error was thrown while parsing request headers.
                    await writeResponse(writer, {
                        status: 400,
                        body: encode(`${error.message}\r\n\r\n`),
                    });
                }
                break;
            }
            if (request === null) {
                break;
            }
            request.w = writer;
            yield request;
            // Wait for the request to be processed before we accept a new request on
            // this connection.
            const responseError = await request.done;
            if (responseError) {
                // Something bad happened during response.
                // (likely other side closed during pipelined req)
                // req.done implies this connection already closed, so we can just return.
                this.untrackConnection(request.conn);
                return;
            }
            // Consume unread body and trailers if receiver didn't consume those data
            await request.finalize();
        }
        this.untrackConnection(conn);
        try {
            conn.close();
        }
        catch (e) {
            // might have been already closed
        }
    }
    trackConnection(conn) {
        this.connections.push(conn);
    }
    untrackConnection(conn) {
        const index = this.connections.indexOf(conn);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
    }
    // Accepts a new TCP connection and yields all HTTP requests that arrive on
    // it. When a connection is accepted, it also creates a new iterator of the
    // same kind and adds it to the request multiplexer so that another TCP
    // connection can be accepted.
    async *acceptConnAndIterateHttpRequests(mux) {
        if (this.closing)
            return;
        // Wait for a new connection.
        let conn;
        try {
            conn = await this.listener.accept();
        }
        catch (error) {
            if (error instanceof Deno.errors.BadResource ||
                error instanceof Deno.errors.InvalidData ||
                error instanceof Deno.errors.UnexpectedEof) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
            }
            throw error;
        }
        this.trackConnection(conn);
        // Try to accept another connection and add it to the multiplexer.
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        // Yield the requests that arrive on the just-accepted connection.
        yield* this.iterateHttpRequests(conn);
    }
    [Symbol.asyncIterator]() {
        const mux = new MuxAsyncIterator();
        mux.add(this.acceptConnAndIterateHttpRequests(mux));
        return mux.iterate();
    }
}
/**
 * Parse addr from string
 *
 *     const addr = "::1:8000";
 *     parseAddrFromString(addr);
 *
 * @param addr Address string
 */
export function _parseAddrFromStr(addr) {
    let url;
    try {
        url = new URL(`http://${addr}`);
    }
    catch {
        throw new TypeError("Invalid address.");
    }
    if (url.username ||
        url.password ||
        url.pathname != "/" ||
        url.search ||
        url.hash) {
        throw new TypeError("Invalid address.");
    }
    return { hostname: url.hostname, port: Number(url.port) };
}
/**
 * Create a HTTP server
 *
 *     import { serve } from "https://deno.land/std/http/server.ts";
 *     const body = "Hello World\n";
 *     const server = serve({ port: 8000 });
 *     for await (const req of server) {
 *       req.respond({ body });
 *     }
 */
export function serve(addr) {
    if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
    }
    const listener = Deno.listen(addr);
    return new Server(listener);
}
/**
 * Start an HTTP server with given options and request handler
 *
 *     const body = "Hello World\n";
 *     const options = { port: 8000 };
 *     listenAndServe(options, (req) => {
 *       req.respond({ body });
 *     });
 *
 * @param options Server configuration
 * @param handler Request handler
 */
export async function listenAndServe(addr, handler) {
    const server = serve(addr);
    for await (const request of server) {
        handler(request);
    }
}
/**
 * Create an HTTPS server with given options
 *
 *     const body = "Hello HTTPS";
 *     const options = {
 *       hostname: "localhost",
 *       port: 443,
 *       certFile: "./path/to/localhost.crt",
 *       keyFile: "./path/to/localhost.key",
 *     };
 *     for await (const req of serveTLS(options)) {
 *       req.respond({ body });
 *     }
 *
 * @param options Server configuration
 * @return Async iterable server instance for incoming requests
 */
export function serveTLS(options) {
    const tlsOptions = {
        ...options,
        transport: "tcp",
    };
    const listener = Deno.listenTls(tlsOptions);
    return new Server(listener);
}
/**
 * Start an HTTPS server with given options and request handler
 *
 *     const body = "Hello HTTPS";
 *     const options = {
 *       hostname: "localhost",
 *       port: 443,
 *       certFile: "./path/to/localhost.crt",
 *       keyFile: "./path/to/localhost.key",
 *     };
 *     listenAndServeTLS(options, (req) => {
 *       req.respond({ body });
 *     });
 *
 * @param options Server configuration
 * @param handler Request handler
 */
export async function listenAndServeTLS(options, handler) {
    const server = serveTLS(options);
    for await (const request of server) {
        handler(request);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBWSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZFLE9BQU8sRUFDTCxVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLFdBQVcsRUFDWCxhQUFhLEVBQ2IsV0FBVyxHQUNaLE1BQU0sVUFBVSxDQUFDO0FBRWxCLE1BQU0sT0FBTyxhQUFhO0lBQTFCO1FBVUUsU0FBSSxHQUFnQyxRQUFRLEVBQUUsQ0FBQztRQUV2QyxtQkFBYyxHQUE4QixTQUFTLENBQUM7UUF1QnRELFVBQUssR0FBdUIsSUFBSSxDQUFDO1FBc0RqQyxjQUFTLEdBQUcsS0FBSyxDQUFDO0lBVzVCLENBQUM7SUF2RkM7OztPQUdHO0lBQ0gsSUFBSSxhQUFhO1FBQ2YsOEJBQThCO1FBQzlCLHNDQUFzQztRQUN0QyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQ3JDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ04sSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLDhDQUE4QztnQkFDOUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDckMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7aUJBQzVCO2FBQ0Y7aUJBQU07Z0JB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