// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { isAbsolute, join, normalize, resolve, sep, Sha1, Status, } from "./deps.ts";
import { createHttpError } from "./httpError.ts";
const ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g;
const HTAB = "\t".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
const UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
const UNMATCHED_SURROGATE_PAIR_REPLACE = "$1\uFFFD$2";
/** Safely decode a URI component, where if it fails, instead of throwing,
 * just returns the original string
 */
export function decodeComponent(text) {
    try {
        return decodeURIComponent(text);
    }
    catch {
        return text;
    }
}
/** Encodes the url preventing double enconding */
export function encodeUrl(url) {
    return String(url)
        .replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE)
        .replace(ENCODE_CHARS_REGEXP, encodeURI);
}
export function getRandomFilename(prefix = "", extension = "") {
    return `${prefix}${new Sha1().update(crypto.getRandomValues(new Uint8Array(256))).hex()}${extension ? `.${extension}` : ""}`;
}
/** Determines if a HTTP `Status` is an `ErrorStatus` (4XX or 5XX). */
export function isErrorStatus(value) {
    return [
        Status.BadRequest,
        Status.Unauthorized,
        Status.PaymentRequired,
        Status.Forbidden,
        Status.NotFound,
        Status.MethodNotAllowed,
        Status.NotAcceptable,
        Status.ProxyAuthRequired,
        Status.RequestTimeout,
        Status.Conflict,
        Status.Gone,
        Status.LengthRequired,
        Status.PreconditionFailed,
        Status.RequestEntityTooLarge,
        Status.RequestURITooLong,
        Status.UnsupportedMediaType,
        Status.RequestedRangeNotSatisfiable,
        Status.ExpectationFailed,
        Status.Teapot,
        Status.MisdirectedRequest,
        Status.UnprocessableEntity,
        Status.Locked,
        Status.FailedDependency,
        Status.UpgradeRequired,
        Status.PreconditionRequired,
        Status.TooManyRequests,
        Status.RequestHeaderFieldsTooLarge,
        Status.UnavailableForLegalReasons,
        Status.InternalServerError,
        Status.NotImplemented,
        Status.BadGateway,
        Status.ServiceUnavailable,
        Status.GatewayTimeout,
        Status.HTTPVersionNotSupported,
        Status.VariantAlsoNegotiates,
        Status.InsufficientStorage,
        Status.LoopDetected,
        Status.NotExtended,
        Status.NetworkAuthenticationRequired,
    ].includes(value);
}
/** Determines if a HTTP `Status` is a `RedirectStatus` (3XX). */
export function isRedirectStatus(value) {
    return [
        Status.MultipleChoices,
        Status.MovedPermanently,
        Status.Found,
        Status.SeeOther,
        Status.UseProxy,
        Status.TemporaryRedirect,
        Status.PermanentRedirect,
    ].includes(value);
}
/** Determines if a string "looks" like HTML */
export function isHtml(value) {
    return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
}
/** Returns `u8` with leading white space removed. */
export function skipLWSPChar(u8) {
    const result = new Uint8Array(u8.length);
    let j = 0;
    for (let i = 0; i < u8.length; i++) {
        if (u8[i] === SPACE || u8[i] === HTAB)
            continue;
        result[j++] = u8[i];
    }
    return result.slice(0, j);
}
export function stripEol(value) {
    if (value[value.byteLength - 1] == LF) {
        let drop = 1;
        if (value.byteLength > 1 && value[value.byteLength - 2] === CR) {
            drop = 2;
        }
        return value.subarray(0, value.byteLength - drop);
    }
    return value;
}
/*!
 * Adapted directly from https://github.com/pillarjs/resolve-path
 * which is licensed as follows:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2015-2018 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
export function resolvePath(rootPath, relativePath) {
    let path = relativePath;
    let root = rootPath;
    // root is optional, similar to root.resolve
    if (arguments.length === 1) {
        path = rootPath;
        root = Deno.cwd();
    }
    if (path == null) {
        throw new TypeError("Argument relativePath is required.");
    }
    // containing NULL bytes is malicious
    if (path.includes("\0")) {
        throw createHttpError(400, "Malicious Path");
    }
    // path should never be absolute
    if (isAbsolute(path)) {
        throw createHttpError(400, "Malicious Path");
    }
    // path outside root
    if (UP_PATH_REGEXP.test(normalize("." + sep + path))) {
        throw createHttpError(403);
    }
    // join the relative path
    return normalize(join(resolve(root), path));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBRXpFLE9BQU8sRUFDTCxVQUFVLEVBQ1YsSUFBSSxFQUNKLFNBQVMsRUFDVCxPQUFPLEVBQ1AsR0FBRyxFQUNILElBQUksRUFDSixNQUFNLEdBQ1AsTUFBTSxXQUFXLENBQUM7QUFDbkIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR2pELE1BQU0sbUJBQW1CLEdBQ3ZCLDBHQUEwRyxDQUFDO0FBQzdHLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsTUFBTSwrQkFBK0IsR0FDbkMsMEVBQTBFLENBQUM7QUFDN0UsTUFBTSxnQ0FBZ0MsR0FBRyxZQUFZLENBQUM7QUFFdEQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLElBQVk7SUFDMUMsSUFBSTtRQUNGLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakM7SUFBQyxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUM7QUFFRCxrREFBa0Q7QUFDbEQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxHQUFXO0lBQ25DLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQztTQUNmLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxnQ0FBZ0MsQ0FBQztTQUMxRSxPQUFPLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELE1BQU0sVUFBVSxp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