// This file is ported from globrex@0.1.2
// MIT License
// Copyright (c) 2018 Terkel Gjervig Nielsen
const isWin = Deno.build.os === "windows";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dsb2JyZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41My4wL3BhdGgvX2dsb2JyZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUNBQXlDO0FBQ3pDLGNBQWM7QUFDZCw0Q0FBNEM7QUFFNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDO0FBQzFDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDM0MsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ25DLE1BQU0sUUFBUSxHQUFHLFdBQVcsT0FBTyxTQUFTLE9BQU8sV0FBVyxDQUFDO0FBQy9ELE1BQU0sUUFBUSxHQUFHLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFDdkMsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLE9BQU8sU0FBUyxPQUFPLFdBQVcsQ0FBQztBQUNyRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsT0FBTyxNQUFNLENBQUM7QUFnQy9DOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLE9BQU8sQ0FDckIsSUFBWSxFQUNaLEVBQ0UsUUFBUSxHQUFHLEtBQUssRUFDaEIsUUFBUSxHQUFHLEtBQUssRUFDaEIsTUFBTSxHQUFHLEtBQUssRUFDZCxRQUFRLEdBQUcsS0FBSyxFQUNoQixLQUFLLEdBQUcsRUFBRSxNQUNRLEVBQUU7SUFFdEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFD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