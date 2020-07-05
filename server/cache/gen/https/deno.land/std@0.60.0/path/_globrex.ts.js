// This file is ported from globrex@0.1.2
// MIT License
// Copyright (c) 2018 Terkel Gjervig Nielsen
/** This module is browser compatible. */
import { isWindows as isWin } from "./_constants.ts";
const SEP = isWin ? `(?:\\\\|\\/)` : `\\/`;
const SEP_ESC = isWin ? `\\\\` : `/`;
const SEP_RAW = isWin ? `\\` : `/`;
const GLOBSTAR = `(?:(?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
const WILDCARD = `(?:[^${SEP_ESC}/]*)`;
const GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}/]*(?:${SEP_ESC}|\/|$))*)`;
const WILDCARD_SEGMENT = `(?:[^${SEP_ESC}/]*)`;
/**
 * Convert any glob pattern to a JavaScript Regexp object
 * @param glob Glob pattern to convert
 * @param opts Configuration object
 * @returns Converted object with string, segments and RegExp object
 */
export function globrex(glob, { extended = false, globstar = false, strict = false, filepath = false, flags = "", } = {}) {
    const sepPattern = new RegExp(`^${SEP}${strict ? "" : "+"}$`);
    let regex = "";
    let segment = "";
    let pathRegexStr = "";
    const pathSegments = [];
    // If we are doing extended matching, this boolean is true when we are inside
    // a group (eg {*.html,*.js}), and false otherwise.
    let inGroup = false;
    let inRange = false;
    // extglob stack. Keep track of scope
    const ext = [];
    // Helper function to build string and segments
    function add(str, options = { split: false, last: false, only: "" }) {
        const { split, last, only } = options;
        if (only !== "path")
            regex += str;
        if (filepath && only !== "regex") {
            pathRegexStr += str.match(sepPattern) ? SEP : str;
            if (split) {
                if (last)
                    segment += str;
                if (segment !== "") {
                    // change it 'includes'
                    if (!flags.includes("g"))
                        segment = `^${segment}$`;
                    pathSegments.push(new RegExp(segment, flags));
                }
                segment = "";
            }
            else {
                segment += str;
            }
        }
    }
    let c, n;
    for (let i = 0; i < glob.length; i++) {
        c = glob[i];
        n = glob[i + 1];
        if (["\\", "$", "^", ".", "="].includes(c)) {
            add(`\\${c}`);
            continue;
        }
        if (c.match(sepPattern)) {
            add(SEP, { split: true });
            if (n != null && n.match(sepPattern) && !strict)
                regex += "?";
            continue;
        }
        if (c === "(") {
            if (ext.length) {
                add(`${c}?:`);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === ")") {
            if (ext.length) {
                add(c);
                const type = ext.pop();
                if (type === "@") {
                    add("{1}");
                }
                else if (type === "!") {
                    add(WILDCARD);
                }
                else {
                    add(type);
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "|") {
            if (ext.length) {
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "+") {
            if (n === "(" && extended) {
                ext.push(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "@" && extended) {
            if (n === "(") {
                ext.push(c);
                continue;
            }
        }
        if (c === "!") {
            if (extended) {
                if (inRange) {
                    add("^");
                    continue;
                }
                if (n === "(") {
                    ext.push(c);
                    add("(?!");
                    i++;
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "?") {
            if (extended) {
                if (n === "(") {
                    ext.push(c);
                }
                else {
                    add(".");
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "[") {
            if (inRange && n === ":") {
                i++; // skip [
                let value = "";
                while (glob[++i] !== ":")
                    value += glob[i];
                if (value === "alnum")
                    add("(?:\\w|\\d)");
                else if (value === "space")
                    add("\\s");
                else if (value === "digit")
                    add("\\d");
                i++; // skip last ]
                continue;
            }
            if (extended) {
                inRange = true;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "]") {
            if (extended) {
                inRange = false;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "{") {
            if (extended) {
                inGroup = true;
                add("(?:");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "}") {
            if (extended) {
                inGroup = false;
                add(")");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === ",") {
            if (inGroup) {
                add("|");
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        if (c === "*") {
            if (n === "(" && extended) {
                ext.push(c);
                continue;
            }
            // Move over all consecutive "*"'s.
            // Also store the previous and next characters
            const prevChar = glob[i - 1];
            let starCount = 1;
            while (glob[i + 1] === "*") {
                starCount++;
                i++;
            }
            const nextChar = glob[i + 1];
            if (!globstar) {
                // globstar is disabled, so treat any number of "*" as one
                add(".*");
            }
            else {
                // globstar is enabled, so determine if this is a globstar segment
                const isGlobstar = starCount > 1 && // multiple "*"'s
                    // from the start of the segment
                    [SEP_RAW, "/", undefined].includes(prevChar) &&
                    // to the end of the segment
                    [SEP_RAW, "/", undefined].includes(nextChar);
                if (isGlobstar) {
                    // it's a globstar, so match zero or more path segments
                    add(GLOBSTAR, { only: "regex" });
                    add(GLOBSTAR_SEGMENT, { only: "path", last: true, split: true });
                    i++; // move over the "/"
                }
                else {
                    // it's not a globstar, so only match one path segment
                    add(WILDCARD, { only: "regex" });
                    add(WILDCARD_SEGMENT, { only: "path" });
                }
            }
            continue;
        }
        add(c);
    }
    // When regexp 'g' flag is specified don't
    // constrain the regular expression with ^ & $
    if (!flags.includes("g")) {
        regex = `^${regex}$`;
        segment = `^${segment}$`;
        if (filepath)
            pathRegexStr = `^${pathRegexStr}$`;
    }
    const result = { regex: new RegExp(regex, flags) };
    // Push the last segment
    if (filepath) {
        pathSegments.push(new RegExp(segment, flags));
        result.path = {
            regex: new RegExp(pathRegexStr, flags),
            segments: pathSegments,
            globstar: new RegExp(!flags.includes("g") ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT, flags),
        };
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dsb2JyZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJfZ2xvYnJleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5Q0FBeUM7QUFDekMsY0FBYztBQUNkLDRDQUE0QztBQUM1Qyx5Q0FBeUM7QUFFekMsT0FBTyxFQUFFLFNBQVMsSUFBSSxLQUFLLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVyRCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzNDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDckMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNuQyxNQUFNLFFBQVEsR0FBRyxXQUFXLE9BQU8sU0FBUyxPQUFPLFdBQVcsQ0FBQztBQUMvRCxNQUFNLFFBQVEsR0FBRyxRQUFRLE9BQU8sTUFBTSxDQUFDO0FBQ3ZDLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxPQUFPLFNBQVMsT0FBTyxXQUFXLENBQUM7QUFDckUsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLE9BQU8sTUFBTSxDQUFDO0FBZ0MvQzs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQ3JCLElBQVksRUFDWixFQUNFLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLE1BQU0sR0FBRyxLQUFLLEVBQ2QsUUFBUSxHQUFHLEtBQUssRUFDaEIsS0FBSyxHQUFHLEVBQUUsTUFDUSxFQUFFO0lBRXRCLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzlELElBQUksS0FBSyxHQUFHLEVB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