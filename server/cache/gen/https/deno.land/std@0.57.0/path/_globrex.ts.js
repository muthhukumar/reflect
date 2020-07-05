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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dsb2JyZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL3BhdGgvX2dsb2JyZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUNBQXlDO0FBQ3pDLGNBQWM7QUFDZCw0Q0FBNEM7QUFDNUMseUNBQXlDO0FBRXpDLE9BQU8sRUFBRSxTQUFTLElBQUksS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFckQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMzQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3JDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsV0FBVyxPQUFPLFNBQVMsT0FBTyxXQUFXLENBQUM7QUFDL0QsTUFBTSxRQUFRLEdBQUcsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN2QyxNQUFNLGdCQUFnQixHQUFHLFNBQVMsT0FBTyxTQUFTLE9BQU8sV0FBVyxDQUFDO0FBQ3JFLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQWdDL0M7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUNyQixJQUFZLEVBQ1osRUFDRSxRQUFRLEdBQUcsS0FBSyxFQUNoQixRQUFRLEdBQUcsS0FBSyxFQUNoQixNQUFNLEdBQUcsS0FBSyxFQUNkLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLEtBQUssR0FBRyxFQUFFLE1BQ1EsRUFBRTtJQUV0QixNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFH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