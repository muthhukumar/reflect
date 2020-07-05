/*!
 * Adapted directly from negotiator at https://github.com/jshttp/negotiator/
 * which is licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Federico Romero
 * Copyright (c) 2012-2014 Isaac Z. Schlueter
 * Copyright (c) 2014-2015 Douglas Christopher Wilson
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
import { compareSpecs, isQuality } from "./common.ts";
const simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
function parseEncoding(str, i) {
    const match = simpleEncodingRegExp.exec(str);
    if (!match) {
        return undefined;
    }
    const encoding = match[1];
    let q = 1;
    if (match[2]) {
        const params = match[2].split(";");
        for (const param of params) {
            const p = param.trim().split("=");
            if (p[0] === "q") {
                q = parseFloat(p[1]);
                break;
            }
        }
    }
    return { encoding, q, i };
}
function specify(encoding, spec, i = -1) {
    if (!spec.encoding) {
        return;
    }
    let s = 0;
    if (spec.encoding.toLocaleLowerCase() === encoding.toLocaleLowerCase()) {
        s = 1;
    }
    else if (spec.encoding !== "*") {
        return;
    }
    return {
        i,
        o: spec.i,
        q: spec.q,
        s,
    };
}
function parseAcceptEncoding(accept) {
    const accepts = accept.split(",");
    const parsedAccepts = [];
    let hasIdentity = false;
    let minQuality = 1;
    for (let i = 0; i < accepts.length; i++) {
        const encoding = parseEncoding(accepts[i].trim(), i);
        if (encoding) {
            parsedAccepts.push(encoding);
            hasIdentity = hasIdentity || !!specify("identity", encoding);
            minQuality = Math.min(minQuality, encoding.q || 1);
        }
    }
    if (!hasIdentity) {
        parsedAccepts.push({
            encoding: "identity",
            q: minQuality,
            i: accepts.length - 1,
        });
    }
    return parsedAccepts;
}
function getEncodingPriority(encoding, accepted, index) {
    let priority = { o: -1, q: 0, s: 0, i: 0 };
    for (const s of accepted) {
        const spec = specify(encoding, s, index);
        if (spec &&
            (priority.s - spec.s || priority.q - spec.q ||
                priority.o - spec.o) <
                0) {
            priority = spec;
        }
    }
    return priority;
}
/** Given an `Accept-Encoding` string, parse out the encoding returning a
 * negotiated encoding based on the `provided` encodings otherwise just a
 * prioritized array of encodings. */
export function preferredEncodings(accept, provided) {
    const accepts = parseAcceptEncoding(accept);
    if (!provided) {
        return accepts
            .filter(isQuality)
            .sort(compareSpecs)
            .map((spec) => spec.encoding);
    }
    const priorities = provided.map((type, index) => getEncodingPriority(type, accepts, index));
    return priorities
        .filter(isQuality)
        .sort(compareSpecs)
        .map((priority) => provided[priorities.indexOf(priority)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlbmNvZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUVILE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFlLE1BQU0sYUFBYSxDQUFDO0FBTW5FLE1BQU0sb0JBQW9CLEdBQUcsNkJBQTZCLENBQUM7QUFFM0QsU0FBUyxhQUFhLENBQUMsR0FBVyxFQUFFLENBQVM7SUFDM0MsTUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDVixPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNaLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ2hCLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07YUFDUDtTQUNGO0tBQ0Y7SUFFRCxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxPQUFPLENBQ2QsUUFBZ0IsRUFDaEIsSUFBd0IsRUFDeEIsSUFBWSxDQUFD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