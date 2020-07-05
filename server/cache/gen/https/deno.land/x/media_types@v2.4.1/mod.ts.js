/*!
 * Ported from: https://github.com/jshttp/mime-types and licensed as:
 *
 * (The MIT License)
 *
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 * Copyright (c) 2020 the Deno authors
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
import { db } from "./db.ts";
import { extname } from "./deps.ts";
const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const TEXT_TYPE_REGEXP = /^text\//i;
/** A map of extensions for a given media type */
export const extensions = new Map();
/** A map of the media type for a given extension */
export const types = new Map();
/** Internal function to populate the maps based on the Mime DB */
function populateMaps(extensions, types) {
    const preference = ["nginx", "apache", undefined, "iana"];
    for (const type of Object.keys(db)) {
        const mime = db[type];
        const exts = mime.extensions;
        if (!exts || !exts.length) {
            continue;
        }
        extensions.set(type, exts);
        for (const ext of exts) {
            const current = types.get(ext);
            if (current) {
                const from = preference.indexOf(db[current].source);
                const to = preference.indexOf(mime.source);
                if (current !== "application/octet-stream" &&
                    (from > to ||
                        (from === to && current.substr(0, 12) === "application/"))) {
                    continue;
                }
            }
            types.set(ext, type);
        }
    }
}
// Populate the maps upon module load
populateMaps(extensions, types);
/** Given a media type return any default charset string.  Returns `undefined`
 * if not resolvable.
 */
export function charset(type) {
    const m = EXTRACT_TYPE_REGEXP.exec(type);
    if (!m) {
        return;
    }
    const [match] = m;
    const mime = db[match.toLowerCase()];
    if (mime && mime.charset) {
        return mime.charset;
    }
    if (TEXT_TYPE_REGEXP.test(match)) {
        return "UTF-8";
    }
}
/** Given an extension, lookup the appropriate media type for that extension.
 * Likely you should be using `contentType()` though instead.
 */
export function lookup(path) {
    const extension = extname("x." + path)
        .toLowerCase()
        .substr(1);
    return types.get(extension);
}
/** Given an extension or media type, return the full `Content-Type` header
 * string.  Returns `undefined` if not resolvable.
 */
export function contentType(str) {
    let mime = str.includes("/") ? str : lookup(str);
    if (!mime) {
        return;
    }
    if (!mime.includes("charset")) {
        const cs = charset(mime);
        if (cs) {
            mime += `; charset=${cs.toLowerCase()}`;
        }
    }
    return mime;
}
/** Given a media type, return the most appropriate extension or return
 * `undefined` if there is none.
 */
export function extension(type) {
    const match = EXTRACT_TYPE_REGEXP.exec(type);
    if (!match) {
        return;
    }
    const exts = extensions.get(match[1].toLowerCase());
    if (!exts || !exts.length) {
        return;
    }
    return exts[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EyQkc7QUFFSCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzdCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFcEMsTUFBTSxtQkFBbUIsR0FBRyx5QkFBeUIsQ0FBQztBQUN0RCxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztBQUVwQyxpREFBaUQ7QUFDakQsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0FBRXRELG9EQUFvRDtBQUNwRCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7QUFFL0Msa0VBQWtFO0FBQ2xFLFNBQVMsWUFBWSxDQUNuQixVQUFpQyxFQUNqQyxLQUEwQjtJQUUxQixNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTFELEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN6QixTQUFTO1NBQ1Y7UUFFRCxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUzQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtZQUN0QixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksT0FB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