/**
 * Adapted directly from content-disposition.js at
 * https://github.com/Rob--W/open-in-browser/blob/master/extension/content-disposition.js
 * which is licensed as:
 *
 * (c) 2017 Rob Wu <rob@robwu.nl> (https://robwu.nl)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { toParamRegExp, unquote } from "./headers.ts";
let needsEncodingFixup = false;
function fixupEncoding(value) {
    if (needsEncodingFixup && /[\x80-\xff]/.test(value)) {
        value = textDecode("utf-8", value);
        if (needsEncodingFixup) {
            value = textDecode("iso-8859-1", value);
        }
    }
    return value;
}
const FILENAME_STAR_REGEX = toParamRegExp("filename\\*", "i");
const FILENAME_START_ITER_REGEX = toParamRegExp("filename\\*((?!0\\d)\\d+)(\\*?)", "ig");
const FILENAME_REGEX = toParamRegExp("filename", "i");
function rfc2047decode(value) {
    if (!value.startsWith("=?") || /[\x00-\x19\x80-\xff]/.test(value)) {
        return value;
    }
    return value.replace(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g, (_, charset, encoding, text) => {
        if (encoding === "q" || encoding === "Q") {
            text = text.replace(/_/g, " ");
            text = text.replace(/=([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            return textDecode(charset, text);
        }
        try {
            text = atob(text);
        }
        catch { }
        return textDecode(charset, text);
    });
}
function rfc2231getParam(header) {
    const matches = [];
    let match;
    while ((match = FILENAME_START_ITER_REGEX.exec(header))) {
        const [, ns, quote, part] = match;
        const n = parseInt(ns, 10);
        if (n in matches) {
            if (n === 0) {
                break;
            }
            continue;
        }
        matches[n] = [quote, part];
    }
    const parts = [];
    for (let n = 0; n < matches.length; ++n) {
        if (!(n in matches)) {
            break;
        }
        let [quote, part] = matches[n];
        part = unquote(part);
        if (quote) {
            part = unescape(part);
            if (n === 0) {
                part = rfc5987decode(part);
            }
        }
        parts.push(part);
    }
    return parts.join("");
}
function rfc5987decode(value) {
    const encodingEnd = value.indexOf(`'`);
    if (encodingEnd === -1) {
        return value;
    }
    const encoding = value.slice(0, encodingEnd);
    const langValue = value.slice(encodingEnd + 1);
    return textDecode(encoding, langValue.replace(/^[^']*'/, ""));
}
function textDecode(encoding, value) {
    if (encoding) {
        try {
            const decoder = new TextDecoder(encoding, { fatal: true });
            const bytes = Array.from(value, (c) => c.charCodeAt(0));
            if (bytes.every((code) => code <= 0xFF)) {
                value = decoder.decode(new Uint8Array(bytes));
                needsEncodingFixup = false;
            }
        }
        catch { }
    }
    return value;
}
export function getFilename(header) {
    needsEncodingFixup = true;
    // filename*=ext-value ("ext-value" from RFC 5987, referenced by RFC 6266).
    let matches = FILENAME_STAR_REGEX.exec(header);
    if (matches) {
        const [, filename] = matches;
        return fixupEncoding(rfc2047decode(rfc5987decode(unescape(unquote(filename)))));
    }
    // Continuations (RFC 2231 section 3, referenced by RFC 5987 section 3.1).
    // filename*n*=part
    // filename*n=part
    const filename = rfc2231getParam(header);
    if (filename) {
        return fixupEncoding(rfc2047decode(filename));
    }
    // filename=value (RFC 5987, section 4.1).
    matches = FILENAME_REGEX.exec(header);
    if (matches) {
        const [, filename] = matches;
        return fixupEncoding(rfc2047decode(unquote(filename)));
    }
    return "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudF9kaXNwb3NpdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRlbnRfZGlzcG9zaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHO0FBRUgsT0FBTyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdEQsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7QUFFL0IsU0FBUyxhQUFhLENBQUMsS0FBYTtJQUNsQyxJQUFJLGtCQUFrQixJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkQsS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxrQkFBa0IsRUFBRTtZQUN0QixLQUFLLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QztLQUNGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzlELE1BQU0seUJBQXlCLEdBQUcsYUFBYSxDQUM3QyxpQ0FBaUMsRUFDakMsSUFBSSxDQUNMLENBQUM7QUFDRixNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXRELFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2pFLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQ2xCLGdEQUFnRCxFQUNoRCxDQUFDLENBQVMsRUFBRSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUM3RCxJQUFJLFFBQVEsS0FB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