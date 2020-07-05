// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { Cookies } from "./cookies.ts";
import { acceptable, acceptWebSocket, } from "./deps.ts";
import { createHttpError } from "./httpError.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";
import { send } from "./send.ts";
import { ServerSentEventTarget, } from "./server_sent_event.ts";
/** Provides context about the current request and response to middleware
 * functions. */
export class Context {
    constructor(app, serverRequest, secure = false) {
        this.app = app;
        this.state = app.state;
        this.request = new Request(serverRequest, app.proxy, secure);
        this.respond = true;
        this.response = new Response(this.request);
        this.cookies = new Cookies(this.request, this.response, {
            keys: this.app.keys,
            secure: this.request.secure,
        });
    }
    #socket;
    #sse;
    /** Is `true` if the current connection is upgradeable to a web socket.
     * Otherwise the value is `false`.  Use `.upgrade()` to upgrade the connection
     * and return the web socket. */
    get isUpgradable() {
        return acceptable(this.request);
    }
    /** If the the current context has been upgraded, then this will be set to
     * with the web socket, otherwise it is `undefined`. */
    get socket() {
        return this.#socket;
    }
    /** Asserts the condition and if the condition fails, creates an HTTP error
     * with the provided status (which defaults to `500`).  The error status by
     * default will be set on the `.response.status`.
     */
    assert(condition, errorStatus = 500, message, props) {
        if (condition) {
            return;
        }
        const err = createHttpError(errorStatus, message);
        if (props) {
            Object.assign(err, props);
        }
        throw err;
    }
    /** Asynchronously fulfill a response with a file from the local file
     * system.
     *
     * If the `options.path` is not supplied, the file to be sent will default
     * to this `.request.url.pathname`.
     *
     * Requires Deno read permission. */
    send(options) {
        const { path = this.request.url.pathname, ...sendOptions } = options;
        return send(this, path, sendOptions);
    }
    /** Convert the connection to stream events, returning an event target for
     * sending server sent events.  Events dispatched on the returned target will
     * be sent to the client and be available in the client's `EventSource` that
     * initiated the connection.
     *
     * This will set `.respond` to `false`. */
    sendEvents(options) {
        if (this.#sse) {
            return this.#sse;
        }
        this.respond = false;
        return this.#sse = new ServerSentEventTarget(this.app, this.request.serverRequest, options);
    }
    /** Create and throw an HTTP Error, which can be used to pass status
     * information which can be caught by other middleware to send more
     * meaningful error messages back to the client.  The passed error status will
     * be set on the `.response.status` by default as well.
     */
    throw(errorStatus, message, props) {
        const err = createHttpError(errorStatus, message);
        if (props) {
            Object.assign(err, props);
        }
        throw err;
    }
    /** Take the current request and upgrade it to a web socket, resolving with
     * the web socket object. This will set `.respond` to `false`. */
    async upgrade() {
        if (this.#socket) {
            return this.#socket;
        }
        const { conn, r: bufReader, w: bufWriter, headers } = this.request.serverRequest;
        this.#socket = await acceptWebSocket({ conn, bufReader, bufWriter, headers });
        this.respond = false;
        return this.#socket;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBR3pFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUNMLFVBQVUsRUFDVixlQUFlLEdBRWhCLE1BQU0sV0FBVyxDQUFDO0FBQ25CLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLElBQUksRUFBZSxNQUFNLFdBQVcsQ0FBQztBQUM5QyxPQUFPLEVBQ0wscUJBQXFCLEdBRXRCLE1BQU0sd0JBQXdCLENBQUM7QUFVaEM7Z0JBQ2dCO0FBQ2hCLE1BQU0sT0FBTyxPQUFPO0lBeURsQixZQUNFLEdBQW1CLEVBQ25CLGFBQTRCLEVBQzVCLE1BQU0sR0FBRyxLQUFLO1FBRWQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0RCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUE0QjtZQUMzQyxNQUFN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