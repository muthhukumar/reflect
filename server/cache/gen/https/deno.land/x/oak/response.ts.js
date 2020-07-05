// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { contentType, Status } from "./deps.ts";
import { isHtml, isRedirectStatus, encodeUrl } from "./util.ts";
/** A symbol that indicates to `response.redirect()` to attempt to redirect
 * back to the request referrer.  For example:
 *
 * ```ts
 * import { Application, REDIRECT_BACK } from "https://deno.land/x/oak/mod.ts";
 *
 * const app = new Application();
 *
 * app.use((ctx) => {
 *   if (ctx.request.url.pathName === "/back") {
 *     ctx.response.redirect(REDIRECT_BACK, "/");
 *   }
 * });
 *
 * await app.listen({ port: 80 });
 * ```
 */
export const REDIRECT_BACK = Symbol("redirect backwards");
const BODY_TYPES = ["string", "number", "bigint", "boolean", "symbol"];
const encoder = new TextEncoder();
/** Guard for `Deno.Reader`. */
function isReader(value) {
    return value && typeof value === "object" && "read" in value &&
        typeof value.read === "function";
}
async function convertBody(body, type) {
    let result;
    if (BODY_TYPES.includes(typeof body)) {
        const bodyText = String(body);
        result = encoder.encode(bodyText);
        type = type ?? (isHtml(bodyText) ? "html" : "text/plain");
    }
    else if (body instanceof Uint8Array || isReader(body)) {
        result = body;
    }
    else if (body && typeof body === "object") {
        result = encoder.encode(JSON.stringify(body));
        type = type ?? "json";
    }
    else if (typeof body === "function") {
        const result = body.call(null);
        return convertBody(await result, type);
    }
    else if (body) {
        throw new TypeError("Response body was set but could not convert.");
    }
    return [result, type];
}
/** An interface to control what response will be sent when the middleware
 * finishes processing the request. */
export class Response {
    constructor(request) {
        this.#headers = new Headers();
        this.#resources = [];
        this.#writable = true;
        this.#getBody = async () => {
            const [body, type] = await convertBody(this.body, this.type);
            this.type = type;
            return body;
        };
        this.#setContentType = () => {
            if (this.type) {
                const contentTypeString = contentType(this.type);
                if (contentTypeString && !this.headers.has("Content-Type")) {
                    this.headers.append("Content-Type", contentTypeString);
                }
            }
        };
        this.#request = request;
    }
    #body;
    #headers;
    #request;
    #resources;
    #serverResponse;
    #status;
    #type;
    #writable;
    #getBody;
    #setContentType;
    /** The body of the response.  The body will be automatically processed when
     * the response is being sent and converted to a `Uint8Array` or a
     * `Deno.Reader`. */
    get body() {
        return this.#body;
    }
    /** The body of the response.  The body will be automatically processed when
     * the response is being sent and converted to a `Uint8Array` or a
     * `Deno.Reader`. */
    set body(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#body = value;
    }
    /** Headers that will be returned in the response. */
    get headers() {
        return this.#headers;
    }
    /** Headers that will be returned in the response. */
    set headers(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#headers = value;
    }
    /** The HTTP status of the response.  If this has not been explicitly set,
     * reading the value will return what would be the value of status if the
     * response were sent at this point in processing the middleware.  If the body
     * has been set, the status will be `200 OK`.  If a value for the body has
     * not been set yet, the status will be `404 Not Found`. */
    get status() {
        if (this.#status) {
            return this.#status;
        }
        const typeofbody = typeof this.body;
        return this.body &&
            (BODY_TYPES.includes(typeofbody) || typeofbody === "object")
            ? Status.OK
            : Status.NotFound;
    }
    /** The HTTP status of the response.  If this has not been explicitly set,
     * reading the value will return what would be the value of status if the
     * response were sent at this point in processing the middleware.  If the body
     * has been set, the status will be `200 OK`.  If a value for the body has
     * not been set yet, the status will be `404 Not Found`. */
    set status(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#status = value;
    }
    /** The media type, or extension of the response.  Setting this value will
     * ensure an appropriate `Content-Type` header is added to the response. */
    get type() {
        return this.#type;
    }
    /** The media type, or extension of the response.  Setting this value will
     * ensure an appropriate `Content-Type` header is added to the response. */
    set type(value) {
        if (!this.#writable) {
            throw new Error("The response is not writable.");
        }
        this.#type = value;
    }
    /** A read-only property which determines if the response is writable or not.
     * Once the response has been processed, this value is set to `false`. */
    get writable() {
        return this.#writable;
    }
    /** Add a resource to the list of resources that will be closed when the
     * request is destroyed. */
    addResource(rid) {
        this.#resources.push(rid);
    }
    /** Release any resources that are being tracked by the response. */
    destroy() {
        this.#writable = false;
        this.#body = undefined;
        this.#serverResponse = undefined;
        for (const rid of this.#resources) {
            Deno.close(rid);
        }
    }
    redirect(url, alt = "/") {
        if (url === REDIRECT_BACK) {
            url = this.#request.headers.get("Referrer") ?? String(alt);
        }
        else if (typeof url === "object") {
            url = String(url);
        }
        this.headers.set("Location", encodeUrl(url));
        if (!this.status || !isRedirectStatus(this.status)) {
            this.status = Status.Found;
        }
        if (this.#request.accepts("html")) {
            url = encodeURI(url);
            this.type = "text/html; charset=utf-8";
            this.body = `Redirecting to <a href="${url}">${url}</a>.`;
            return;
        }
        this.type = "text/plain; charset=utf-8";
        this.body = `Redirecting to ${url}.`;
    }
    /** Take this response and convert it to the response used by the Deno net
     * server.  Calling this will set the response to not be writable.
     *
     * Most users will have no need to call this method. */
    async toServerResponse() {
        if (this.#serverResponse) {
            return this.#serverResponse;
        }
        // Process the body
        const body = await this.#getBody();
        // If there is a response type, set the content type header
        this.#setContentType();
        const { headers } = this;
        // If there is no body and no content type and no set length, then set the
        // content length to 0
        if (!(body ||
            headers.has("Content-Type") ||
            headers.has("Content-Length"))) {
            headers.append("Content-Length", "0");
        }
        this.#writable = false;
        return this.#serverResponse = {
            status: this.#status ?? (body ? Status.OK : Status.NotFound),
            body,
            headers,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFFekUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHaEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFhaEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFMUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFdkUsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUVsQywrQkFBK0I7QUFDL0IsU0FBUyxRQUFRLENBQUMsS0FBVTtJQUMxQixPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksTUFBTSxJQUFJLEtBQUs7UUFDMUQsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsSUFBeUIsRUFDekIsSUFBYTtJQUViLElBQUksTUFBNEMsQ0FBQztJQUNqRCxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRTtRQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMz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