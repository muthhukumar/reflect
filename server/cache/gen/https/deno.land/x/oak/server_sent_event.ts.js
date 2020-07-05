// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { assert } from "./deps.ts";
const encoder = new TextEncoder();
class CloseEvent extends Event {
    constructor(eventInit) {
        super("close", eventInit);
    }
}
/** An event which contains information which will be sent to the remote
 * connection and be made available in an `EventSource` as an event. */
export class ServerSentEvent extends Event {
    constructor(type, data, { replacer, space, ...eventInit } = {}) {
        super(type, eventInit);
        this.#type = type;
        try {
            this.#data = typeof data === "string"
                ? data
                : JSON.stringify(data, replacer, space);
        }
        catch (e) {
            assert(e instanceof Error);
            throw new TypeError(`data could not be coerced into a serialized string.\n  ${e.message}`);
        }
        const { id } = eventInit;
        this.#id = id;
    }
    #data;
    #id;
    #type;
    /** The data associated with the event, which will be sent to the client and
     * be made available in the `EventSource`. */
    get data() {
        return this.#data;
    }
    /** The optional ID associated with the event that will be sent to the client
     * and be made available in the `EventSource`. */
    get id() {
        return this.#id;
    }
    toString() {
        const data = `data: ${this.#data.split("\n").join("\ndata: ")}\n`;
        return `${this.#type === "__message" ? "" : `event: ${this.#type}\n`}${this.#id ? `id: ${String(this.#id)}\n` : ""}${data}\n`;
    }
}
const response = `HTTP/1.1 200 OK\n`;
const responseHeaders = new Headers([
    ["Connection", "Keep-Alive"],
    ["Content-Type", "text/event-stream"],
    ["Cache-Control", "no-cache"],
    ["Keep-Alive", `timeout=${Number.MAX_SAFE_INTEGER}`],
]);
export class ServerSentEventTarget extends EventTarget {
    constructor(app, serverRequest, { headers } = {}) {
        super();
        this.#closed = false;
        this.#prev = Promise.resolve();
        this.#send = async (payload, prev) => {
            if (this.#closed) {
                return;
            }
            if (this.#ready !== true) {
                await this.#ready;
                this.#ready = true;
            }
            try {
                await prev;
                await this.#writer.write(encoder.encode(payload));
                await this.#writer.flush();
            }
            catch (error) {
                this.dispatchEvent(new CloseEvent({ cancelable: false }));
                const errorEvent = new ErrorEvent("error", { error });
                this.dispatchEvent(errorEvent);
                this.#app.dispatchEvent(errorEvent);
            }
        };
        this.#setup = async (overrideHeaders) => {
            const headers = new Headers(responseHeaders);
            if (overrideHeaders) {
                for (const [key, value] of overrideHeaders) {
                    headers.set(key, value);
                }
            }
            let payload = response;
            for (const [key, value] of headers) {
                payload += `${key}: ${value}\n`;
            }
            payload += `\n`;
            try {
                await this.#writer.write(encoder.encode(payload));
                await this.#writer.flush();
            }
            catch (error) {
                this.dispatchEvent(new CloseEvent({ cancelable: false }));
                const errorEvent = new ErrorEvent("error", { error });
                this.dispatchEvent(errorEvent);
                this.#app.dispatchEvent(errorEvent);
                throw error;
            }
        };
        this.#app = app;
        this.#serverRequest = serverRequest;
        this.#writer = this.#serverRequest.w;
        this.addEventListener("close", () => {
            this.#closed = true;
            try {
                this.#serverRequest.conn.close();
            }
            catch (error) {
                if (!(error instanceof Deno.errors.BadResource)) {
                    const errorEvent = new ErrorEvent("error", { error });
                    this.dispatchEvent(errorEvent);
                    this.#app.dispatchEvent(errorEvent);
                }
            }
        });
        this.#ready = this.#setup(headers);
    }
    #app;
    #closed;
    #prev;
    #ready;
    #serverRequest;
    #writer;
    #send;
    #setup;
    /** Is set to `true` if events cannot be sent to the remote connection.
     * Otherwise it is set to `false`.
     *
     * *Note*: This flag is lazily set, and might not reflect a closed state until
     * another event, comment or message is attempted to be processed. */
    get closed() {
        return this.#closed;
    }
    /** Stop sending events to the remote connection and close the connection. */
    async close() {
        if (this.#ready !== true) {
            await this.#ready;
        }
        await this.#prev;
        this.dispatchEvent(new CloseEvent({ cancelable: false }));
    }
    /** Send a comment to the remote connection.  Comments are not exposed to the
     * client `EventSource` but are used for diagnostics and helping ensure a
     * connection is kept alive.
     *
     * ```ts
     * import { Application } from "https://deno.land/x/oak/mod.ts";
     *
     * const app = new Application();
     *
     * app.use((ctx) => {
     *    const sse = ctx.getSSETarget();
     *    sse.dispatchComment("this is a comment");
     * });
     *
     * await app.listen();
     * ```
     */
    dispatchComment(comment) {
        this.#prev = this.#send(`: ${comment.split("\n").join("\n: ")}\n\n`, this.#prev);
        return true;
    }
    /** Dispatch a message to the client.  This message will contain `data: ` only
     * and be available on the client `EventSource` on the `onmessage` or an event
     * listener of type `"message"`. */
    dispatchMessage(data) {
        const event = new ServerSentEvent("__message", data);
        return this.dispatchEvent(event);
    }
    dispatchEvent(event) {
        let dispatched = super.dispatchEvent(event);
        if (dispatched && event instanceof ServerSentEvent) {
            this.#prev = this.#send(String(event), this.#prev);
        }
        return dispatched;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyX3NlbnRfZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXJ2ZXJfc2VudF9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFHekUsT0FBTyxFQUFFLE1BQU0sRUFBYSxNQUFNLFdBQVcsQ0FBQztBQUc5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBd0JsQyxNQUFNLFVBQVcsU0FBUSxLQUFLO0lBQzVCLFlBQVksU0FBb0I7UUFDOUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQ0Y7QUFFRDt1RUFDdUU7QUFDdkUsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBSztJQUt4QyxZQUNFLElBQVksRUFDWixJQUFTLEVBQ1QsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBRTNELEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSTtZQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxJQUFJLEtBQUssUUFBUTtnQkFDbkMsQ0FBQyxDQUFDLElBQUk7Z0JBQ04sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUM7WUFDM0IsTUFBTSxJQUFJLFNBQVMsQ0FDakIsMERBQTBELENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FDdEUsQ0FBQztTQUNIO1FBQ0QsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBdkJELEtBQUssQ0FBUztJ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