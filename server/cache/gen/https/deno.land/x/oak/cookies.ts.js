// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
const matchCache = {};
const FIELD_CONTENT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
const KEY_REGEXP = /(?:^|;) *([^=]*)=[^;]*/g;
const SAME_SITE_REGEXP = /^(?:lax|none|strict)$/i;
function getPattern(name) {
    if (name in matchCache) {
        return matchCache[name];
    }
    return matchCache[name] = new RegExp(`(?:^|;) *${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`);
}
function pushCookie(headers, cookie) {
    if (cookie.overwrite) {
        for (let i = headers.length - 1; i >= 0; i--) {
            if (headers[i].indexOf(`${cookie.name}=`) === 0) {
                headers.splice(i, 1);
            }
        }
    }
    headers.push(cookie.toHeader());
}
function validateCookieProperty(key, value) {
    if (value && !FIELD_CONTENT_REGEXP.test(value)) {
        throw new TypeError(`The ${key} of the cookie (${value}) is invalid.`);
    }
}
class Cookie {
    /** A logical representation of a cookie, used to internally manage the
     * cookie instances. */
    constructor(name, value, attributes) {
        this.httpOnly = true;
        this.overwrite = false;
        this.path = "/";
        this.sameSite = false;
        this.secure = false;
        validateCookieProperty("name", name);
        validateCookieProperty("value", value);
        this.name = name;
        this.value = value ?? "";
        Object.assign(this, attributes);
        if (!this.value) {
            this.expires = new Date(0);
            this.maxAge = undefined;
        }
        validateCookieProperty("path", this.path);
        validateCookieProperty("domain", this.domain);
        if (this.sameSite && typeof this.sameSite === "string" &&
            !SAME_SITE_REGEXP.test(this.sameSite)) {
            throw new TypeError(`The sameSite of the cookie ("${this.sameSite}") is invalid.`);
        }
    }
    toHeader() {
        let header = this.toString();
        if (this.maxAge) {
            this.expires = new Date(Date.now() + this.maxAge);
        }
        if (this.path) {
            header += `; path=${this.path}`;
        }
        if (this.expires) {
            header += `; expires=${this.expires.toUTCString()}`;
        }
        if (this.domain) {
            header += `; domain=${this.domain}`;
        }
        if (this.sameSite) {
            header += `; samesite=${this.sameSite === true ? "strict" : this.sameSite.toLowerCase()}`;
        }
        if (this.secure) {
            header += "; secure";
        }
        if (this.httpOnly) {
            header += "; httponly";
        }
        return header;
    }
    toString() {
        return `${this.name}=${this.value}`;
    }
}
/** An interface which allows setting and accessing cookies related to both the
 * current request and response. */
export class Cookies {
    constructor(request, response, options = {}) {
        this.#requestKeys = () => {
            if (this.#cookieKeys) {
                return this.#cookieKeys;
            }
            const result = this.#cookieKeys = [];
            const header = this.#request.headers.get("cookie");
            if (!header) {
                return result;
            }
            let matches;
            while ((matches = KEY_REGEXP.exec(header))) {
                const [, key] = matches;
                result.push(key);
            }
            return result;
        };
        const { keys, secure } = options;
        this.#keys = keys;
        this.#request = request;
        this.#response = response;
        this.#secure = secure;
    }
    #cookieKeys;
    #keys;
    #request;
    #response;
    #secure;
    #requestKeys;
    /** Set a cookie to be deleted in the response.  This is a "shortcut" to
     * `.set(name, null, options?)`. */
    delete(name, options = {}) {
        this.set(name, null, options);
        return true;
    }
    /** Iterate over the request's cookies, yielding up a tuple containing the
     * key and the value.
     *
     * If there are keys set on the application, only keys and values that are
     * properly signed will be returned. */
    *entries() {
        const keys = this.#requestKeys();
        for (const key of keys) {
            const value = this.get(key);
            if (value) {
                yield [key, value];
            }
        }
    }
    forEach(callback, thisArg = null) {
        const keys = this.#requestKeys();
        for (const key of keys) {
            const value = this.get(key);
            if (value) {
                callback.call(thisArg, key, value, this);
            }
        }
    }
    /** Get the value of a cookie from the request.
     *
     * If the cookie is signed, and the signature is invalid, the cookie will
     * be set to be deleted in the the response.  If the signature uses an "old"
     * key, the cookie will be re-signed with the current key and be added to the
     * response to be updated. */
    get(name, options = {}) {
        const signed = options.signed ?? !!this.#keys;
        const nameSig = `${name}.sig`;
        const header = this.#request.headers.get("cookie");
        if (!header) {
            return;
        }
        const match = header.match(getPattern(name));
        if (!match) {
            return;
        }
        const [, value] = match;
        if (!signed) {
            return value;
        }
        const digest = this.get(nameSig, { signed: false });
        if (!digest) {
            return;
        }
        const data = `${name}=${value}`;
        if (!this.#keys) {
            throw new TypeError("keys required for signed cookies");
        }
        const index = this.#keys.indexOf(data, digest);
        if (index < 0) {
            this.delete(nameSig, { path: "/", signed: false });
        }
        else {
            if (index) {
                // the key has "aged" and needs to be re-signed
                this.set(nameSig, this.#keys.sign(data), { signed: false });
            }
            return value;
        }
    }
    /** Iterate over the request's cookies, yielding up the keys.
     *
     * If there are keys set on the application, only the keys that are properly
     * signed will be returned. */
    *keys() {
        const keys = this.#requestKeys();
        for (const key of keys) {
            const value = this.get(key);
            if (value) {
                yield key;
            }
        }
    }
    /** Set a cookie in the response.
     *
     * If there are keys set in the application, cookies will be automatically
     * signed, unless overridden by the set options.  Cookies can be deleted by
     * setting the value to `null`. */
    set(name, value, options = {}) {
        const request = this.#request;
        const response = this.#response;
        let headers = response.headers.get("Set-Cookie") ?? [];
        if (typeof headers === "string") {
            headers = [headers];
        }
        const secure = this.#secure !== undefined ? this.#secure : request.secure;
        const signed = options.signed ?? !!this.#keys;
        if (!secure && options.secure) {
            throw new TypeError("Cannot send secure cookie over unencrypted connection.");
        }
        const cookie = new Cookie(name, value, options);
        cookie.secure = options.secure ?? secure;
        pushCookie(headers, cookie);
        if (signed) {
            if (!this.#keys) {
                throw new TypeError(".keys required for signed cookies.");
            }
            cookie.value = this.#keys.sign(cookie.toString());
            cookie.name += ".sig";
            pushCookie(headers, cookie);
        }
        for (const header of headers) {
            response.headers.append("Set-Cookie", header);
        }
        return this;
    }
    /** Iterate over the request's cookies, yielding up each value.
     *
     * If there are keys set on the application, only the values that are
     * properly signed will be returned. */
    *values() {
        const keys = this.#requestKeys();
        for (const key of keys) {
            const value = this.get(key);
            if (value) {
                yield value;
            }
        }
    }
    /** Iterate over the request's cookies, yielding up a tuple containing the
     * key and the value.
     *
     * If there are keys set on the application, only keys and values that are
     * properly signed will be returned. */
    *[Symbol.iterator]() {
        const keys = this.#requestKeys();
        for (const key of keys) {
            const value = this.get(key);
            if (value) {
                yield [key, value];
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvb2tpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBZ0N6RSxNQUFNLFVBQVUsR0FBMkIsRUFBRSxDQUFDO0FBRTlDLE1BQU0sb0JBQW9CLEdBQUcsdUNBQXVDLENBQUM7QUFDckUsTUFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUM7QUFDN0MsTUFBTSxnQkFBZ0IsR0FBRyx3QkFBd0IsQ0FBQztBQUVsRCxTQUFTLFVBQVUsQ0FBQyxJQUFZO0lBQzlCLElBQUksSUFBSSxJQUFJLFVBQVUsRUFBRTtRQUN0QixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6QjtJQUVELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUNsQyxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FDdkUsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxPQUFpQixFQUFFLE1BQWM7SUFDbkQsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3RCO1NBQ0Y7S0FDRjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzdCLEdBQVcsRUFDWCxLQUFnQztJQUVoQyxJQUFJ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