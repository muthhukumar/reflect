// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { httpErrors } from "./httpError.ts";
const COLON = ":".charCodeAt(0);
const HTAB = "\t".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const decoder = new TextDecoder();
/** With a provided attribute pattern, return a RegExp which will match and
 * capture in the first group the value of the attribute from a header value. */
export function toParamRegExp(attributePattern, flags) {
    // deno-fmt-ignore
    return new RegExp(`(?:^|;)\\s*${attributePattern}\\s*=\\s*` +
        `(` +
        `[^";\\s][^;\\s]*` +
        `|` +
        `"(?:[^"\\\\]|\\\\"?)+"?` +
        `)`, flags);
}
/** Asynchronously read the headers out of body request and resolve with them as
 * a `Headers` object. */
export async function readHeaders(body) {
    const headers = new Headers();
    let readResult = await body.readLine();
    while (readResult) {
        const { bytes } = readResult;
        if (!bytes.length) {
            return headers;
        }
        let i = bytes.indexOf(COLON);
        if (i === -1) {
            throw new httpErrors.BadRequest(`Malformed header: ${decoder.decode(bytes)}`);
        }
        const key = decoder.decode(bytes.subarray(0, i));
        if (key === "") {
            throw new httpErrors.BadRequest("Invalid header key.");
        }
        i++;
        while (i < bytes.byteLength && (bytes[i] === SPACE || bytes[i] === HTAB)) {
            i++;
        }
        const value = decoder.decode(bytes.subarray(i));
        try {
            headers.append(key, value);
        }
        catch { }
        readResult = await body.readLine();
    }
    throw new httpErrors.BadRequest("Unexpected end of body reached.");
}
/** Unquotes attribute values that might be pass as part of a header. */
export function unquote(value) {
    if (value.startsWith(`"`)) {
        const parts = value.slice(1).split(`\\"`);
        for (let i = 0; i < parts.length; ++i) {
            const quoteIndex = parts[i].indexOf(`"`);
            if (quoteIndex !== -1) {
                parts[i] = parts[i].slice(0, quoteIndex);
                parts.length = i + 1; // Truncates and stops the loop
            }
            parts[i] = parts[i].replace(/\\(.)/g, "$1");
        }
        value = parts.join(`"`);
    }
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlYWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBR3pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBRWxDO2dGQUNnRjtBQUNoRixNQUFNLFVBQVUsYUFBYSxDQUMzQixnQkFBd0IsRUFDeEIsS0FBYztJQUVkLGtCQUFrQjtJQUNsQixPQUFPLElBQUksTUFBTSxDQUNmLGNBQWMsZ0JBQWdCLFdBQVc7UUFDekMsR0FBRztRQUNELGtCQUFrQjtRQUNwQixHQUFHO1FBQ0QseUJBQXlCO1FBQzNCLEdBQUcsRUFDSCxLQUFLLENBQ04sQ0FBQztBQUNKLENBQUM7QUFFRDt5QkFDeUI7QUFDekIsTUFBTSxDQUFDLEtBQUssVUFBVSxXQUFXLENBQUMsSUFBZTtJQUMvQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQzlCLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZDLE9BQU8sVUFBVSxFQUFFO1FBQ2pCLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFDRCxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ1osTUFBTSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQzdCLHFCQUFxQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQzdDLENBQUM7U0FDSDtRQUNELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7WUFDZCxNQUFNLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsQ0FBQyxFQUFFLENBQUM7UUFDSixPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFDeEUsQ0FBQyxFQUFFLENBQUM7U0FDTDtRQUNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUk7WUFDRixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QjtRQUFDLE1BQU0sR0FBRTtRQUNWLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNwQztJQUNELE1BQU0sSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELHdFQUF3RTtBQUN4RSxNQUFNLFVBQVUsT0FBTyxDQUFDLEtBQWE7SUFDbkMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDekMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsK0JBQStCO2FBQ3REO1lBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDekI7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMifQ==