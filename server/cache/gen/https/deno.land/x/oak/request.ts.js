// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { httpErrors } from "./httpError.ts";
import { isMediaType } from "./isMediaType.ts";
import { FormDataReader } from "./multipart.ts";
import { preferredCharsets } from "./negotiation/charset.ts";
import { preferredEncodings } from "./negotiation/encoding.ts";
import { preferredLanguages } from "./negotiation/language.ts";
import { preferredMediaTypes } from "./negotiation/mediaType.ts";
const decoder = new TextDecoder();
const defaultBodyContentTypes = {
    json: ["json", "application/*+json", "application/csp-report"],
    form: ["urlencoded"],
    formData: ["multipart"],
    text: ["text"],
};
/** An interface which provides information about the current request. */
export class Request {
    constructor(serverRequest, proxy = false, secure = false) {
        this.#proxy = proxy;
        this.#secure = secure;
        this.#serverRequest = serverRequest;
    }
    #body;
    #proxy;
    #rawBodyPromise;
    #secure;
    #serverRequest;
    #url;
    /** Is `true` if the request has a body, otherwise `false`. */
    get hasBody() {
        return (this.headers.get("transfer-encoding") !== null ||
            !!parseInt(this.headers.get("content-length") ?? ""));
    }
    /** The `Headers` supplied in the request. */
    get headers() {
        return this.#serverRequest.headers;
    }
    /** Request remote address. When the application's `.proxy` is true, the
     * `X-Forwarded-For` will be used to determine the requesting remote address.
     */
    get ip() {
        return this.#proxy
            ? this.ips[0]
            : this.#serverRequest.conn.remoteAddr.hostname;
    }
    /** When the application's `.proxy` is `true`, this will be set to an array of
     * IPs, ordered from upstream to downstream, based on the value of the header
     * `X-Forwarded-For`.  When `false` an empty array is returned. */
    get ips() {
        return this.#proxy
            ? (this.#serverRequest.headers.get("x-forwarded-for") ??
                this.#serverRequest.conn.remoteAddr.hostname).split(/\s*,\s*/)
            : [];
    }
    /** The HTTP Method used by the request. */
    get method() {
        return this.#serverRequest.method;
    }
    /** Shortcut to `request.url.protocol === "https:"`. */
    get secure() {
        return this.#secure;
    }
    /** Set to the value of the _original_ Deno server request. */
    get serverRequest() {
        return this.#serverRequest;
    }
    /** A parsed URL for the request which complies with the browser standards.
     * When the application's `.proxy` is `true`, this value will be based off of
     * the `X-Forwarded-Proto` and `X-Forwarded-Host` header values if present in
     * the request. */
    get url() {
        if (!this.#url) {
            const serverRequest = this.#serverRequest;
            let proto;
            let host;
            if (this.#proxy) {
                proto = serverRequest
                    .headers.get("x-forwarded-proto")?.split(/\s*,\s*/, 1)[0] ??
                    "http";
                host = serverRequest.headers.get("x-forwarded-host") ??
                    serverRequest.headers.get("host") ?? "";
            }
            else {
                proto = this.#secure ? "https" : "http";
                host = serverRequest.headers.get("host") ?? "";
            }
            this.#url = new URL(`${proto}://${host}${serverRequest.url}`);
        }
        return this.#url;
    }
    accepts(...types) {
        const acceptValue = this.#serverRequest.headers.get("Accept");
        if (!acceptValue) {
            return;
        }
        if (types.length) {
            return preferredMediaTypes(acceptValue, types)[0];
        }
        return preferredMediaTypes(acceptValue);
    }
    acceptsCharsets(...charsets) {
        const acceptCharsetValue = this.#serverRequest.headers.get("Accept-Charset");
        if (!acceptCharsetValue) {
            return;
        }
        if (charsets.length) {
            return preferredCharsets(acceptCharsetValue, charsets)[0];
        }
        return preferredCharsets(acceptCharsetValue);
    }
    acceptsEncodings(...encodings) {
        const acceptEncodingValue = this.#serverRequest.headers.get("Accept-Encoding");
        if (!acceptEncodingValue) {
            return;
        }
        if (encodings.length) {
            return preferredEncodings(acceptEncodingValue, encodings)[0];
        }
        return preferredEncodings(acceptEncodingValue);
    }
    acceptsLanguages(...langs) {
        const acceptLanguageValue = this.#serverRequest.headers.get("Accept-Language");
        if (!acceptLanguageValue) {
            return;
        }
        if (langs.length) {
            return preferredLanguages(acceptLanguageValue, langs)[0];
        }
        return preferredLanguages(acceptLanguageValue);
    }
    async body({ asReader, contentTypes = {} } = {}) {
        if (this.#body) {
            if (asReader && this.#body.type !== "reader") {
                return Promise.reject(new TypeError(`Body already consumed as type: "${this.#body.type}".`));
            }
            else if (this.#body.type === "reader") {
                return Promise.reject(new TypeError(`Body already consumed as type: "reader".`));
            }
            return this.#body;
        }
        const encoding = this.headers.get("content-encoding") || "identity";
        if (encoding !== "identity") {
            throw new httpErrors.UnsupportedMediaType(`Unsupported content-encoding: ${encoding}`);
        }
        if (!this.hasBody) {
            return (this.#body = { type: "undefined", value: undefined });
        }
        const contentType = this.headers.get("content-type");
        if (contentType) {
            if (asReader) {
                return (this.#body = {
                    type: "reader",
                    value: this.#serverRequest.body,
                });
            }
            const contentTypesFormData = [
                ...defaultBodyContentTypes.formData,
                ...(contentTypes.formData ?? []),
            ];
            if (isMediaType(contentType, contentTypesFormData)) {
                return (this.#body = {
                    type: "form-data",
                    value: new FormDataReader(contentType, this.#serverRequest.body),
                });
            }
            const rawBody = await (this.#rawBodyPromise ??
                (this.#rawBodyPromise = Deno.readAll(this.#serverRequest.body)));
            const value = decoder.decode(rawBody);
            const contentTypesRaw = contentTypes.raw;
            const contentTypesJson = [
                ...defaultBodyContentTypes.json,
                ...(contentTypes.json ?? []),
            ];
            const contentTypesForm = [
                ...defaultBodyContentTypes.form,
                ...(contentTypes.form ?? []),
            ];
            const contentTypesText = [
                ...defaultBodyContentTypes.text,
                ...(contentTypes.text ?? []),
            ];
            if (contentTypesRaw && isMediaType(contentType, contentTypesRaw)) {
                return (this.#body = { type: "raw", value: rawBody });
            }
            else if (isMediaType(contentType, contentTypesJson)) {
                return (this.#body = { type: "json", value: JSON.parse(value) });
            }
            else if (isMediaType(contentType, contentTypesForm)) {
                return (this.#body = {
                    type: "form",
                    value: new URLSearchParams(value.replace(/\+/g, " ")),
                });
            }
            else if (isMediaType(contentType, contentTypesText)) {
                return (this.#body = { type: "text", value });
            }
            else {
                return (this.#body = { type: "raw", value: rawBody });
            }
        }
        throw new httpErrors.UnsupportedMediaType(contentType
            ? `Unsupported content-type: ${contentType}`
            : "Missing content-type");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBRXpFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWhELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBc0RqRSxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBUWxDLE1BQU0sdUJBQXVCLEdBQUc7SUFDOUIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLG9CQUFvQixFQUFFLHdCQUF3QixDQUFDO0lBQzlELElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQztJQUNwQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFDdkIsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ2YsQ0FBQztBQUVGLHlFQUF5RTtBQUN6RSxNQUFNLE9BQU8sT0FBTztJQWlGbEIsWUFBWSxhQUE0QixFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFDckUsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7SUFDdEMsQ0FBQztJQXBGRCxLQUFLLENBQXFCO0lBQzFCLE1BQU0sQ0FBVTtJQUNoQixlQUFlLENBQXVC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