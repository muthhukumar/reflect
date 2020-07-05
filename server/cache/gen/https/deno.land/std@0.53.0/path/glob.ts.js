import { SEP, SEP_PATTERN } from "./separator.ts";
import { globrex } from "./_globrex.ts";
import { join, normalize } from "./mod.ts";
import { assert } from "../testing/asserts.ts";
/**
 * Generate a regex based on glob pattern and options
 * This was meant to be using the the `fs.walk` function
 * but can be used anywhere else.
 * Examples:
 *
 *     Looking for all the `ts` files:
 *     walkSync(".", {
 *       match: [globToRegExp("*.ts")]
 *     })
 *
 *     Looking for all the `.json` files in any subfolder:
 *     walkSync(".", {
 *       match: [globToRegExp(join("a", "**", "*.json"),{
 *         flags: "g",
 *         extended: true,
 *         globstar: true
 *       })]
 *     })
 *
 * @param glob - Glob pattern to be used
 * @param options - Specific options for the glob pattern
 * @returns A RegExp for the glob pattern
 */
export function globToRegExp(glob, { extended = false, globstar = true } = {}) {
    const result = globrex(glob, {
        extended,
        globstar,
        strict: false,
        filepath: true,
    });
    assert(result.path != null);
    return result.path.regex;
}
/** Test whether the given string is a glob */
export function isGlob(str) {
    const chars = { "{": "}", "(": ")", "[": "]" };
    /* eslint-disable-next-line max-len */
    const regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while ((match = regex.exec(str))) {
        if (match[2])
            return true;
        let idx = match.index + match[0].length;
        // if an open bracket/brace/paren is escaped,
        // set the index to the next closing character
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
/** Like normalize(), but doesn't collapse "**\/.." when `globstar` is true. */
export function normalizeGlob(glob, { globstar = false } = {}) {
    if (!!glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize(glob);
    }
    const s = SEP_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
/** Like join(), but doesn't collapse "**\/.." when `globstar` is true. */
export function joinGlobs(globs, { extended = false, globstar = false } = {}) {
    if (!globstar || globs.length == 0) {
        return join(...globs);
    }
    if (globs.length === 0)
        return ".";
    let joined;
    for (const glob of globs) {
        const path = glob;
        if (path.length > 0) {
            if (!joined)
                joined = path;
            else
                joined += `${SEP}${path}`;
        }
    }
    if (!joined)
        return ".";
    return normalizeGlob(joined, { extended, globstar });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjUzLjAvcGF0aC9nbG9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFXL0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FDMUIsSUFBWSxFQUNaLEVBQUUsUUFBUSxHQUFHLEtBQUssRUFBRSxRQUFRLEdBQUcsSUFBSSxLQUEwQixFQUFFO0lBRS9ELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDM0IsUUFBUTtRQUNSLFFBQVE7UUFDUixNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxJQUFJO0tBQ2YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7SUFDNUIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQixDQUFDO0FBRUQsOENBQThDO0FBQzlDLE1BQU0sVUFBVSxNQUFNLENBQUMsR0FBVztJQUNoQyxNQUFNLEtBQUssR0FBMkIsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ3ZFLHNDQUFzQztJQUN0QyxNQUFNLEtBQUssR0FBRyx3RkFBd0YsQ0FBQztJQUV2RyxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7UUFDZCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsSUFBSSxL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