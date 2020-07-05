// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/* eslint-disable max-len */
import { YAMLError } from "../error.ts";
import * as common from "../utils.ts";
import { DumperState } from "./dumper_state.ts";
const _toString = Object.prototype.toString;
const _hasOwnProperty = Object.prototype.hasOwnProperty;
const CHAR_TAB = 0x09; /* Tab */
const CHAR_LINE_FEED = 0x0a; /* LF */
const CHAR_SPACE = 0x20; /* Space */
const CHAR_EXCLAMATION = 0x21; /* ! */
const CHAR_DOUBLE_QUOTE = 0x22; /* " */
const CHAR_SHARP = 0x23; /* # */
const CHAR_PERCENT = 0x25; /* % */
const CHAR_AMPERSAND = 0x26; /* & */
const CHAR_SINGLE_QUOTE = 0x27; /* ' */
const CHAR_ASTERISK = 0x2a; /* * */
const CHAR_COMMA = 0x2c; /* , */
const CHAR_MINUS = 0x2d; /* - */
const CHAR_COLON = 0x3a; /* : */
const CHAR_GREATER_THAN = 0x3e; /* > */
const CHAR_QUESTION = 0x3f; /* ? */
const CHAR_COMMERCIAL_AT = 0x40; /* @ */
const CHAR_LEFT_SQUARE_BRACKET = 0x5b; /* [ */
const CHAR_RIGHT_SQUARE_BRACKET = 0x5d; /* ] */
const CHAR_GRAVE_ACCENT = 0x60; /* ` */
const CHAR_LEFT_CURLY_BRACKET = 0x7b; /* { */
const CHAR_VERTICAL_LINE = 0x7c; /* | */
const CHAR_RIGHT_CURLY_BRACKET = 0x7d; /* } */
const ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = "\\0";
ESCAPE_SEQUENCES[0x07] = "\\a";
ESCAPE_SEQUENCES[0x08] = "\\b";
ESCAPE_SEQUENCES[0x09] = "\\t";
ESCAPE_SEQUENCES[0x0a] = "\\n";
ESCAPE_SEQUENCES[0x0b] = "\\v";
ESCAPE_SEQUENCES[0x0c] = "\\f";
ESCAPE_SEQUENCES[0x0d] = "\\r";
ESCAPE_SEQUENCES[0x1b] = "\\e";
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5c] = "\\\\";
ESCAPE_SEQUENCES[0x85] = "\\N";
ESCAPE_SEQUENCES[0xa0] = "\\_";
ESCAPE_SEQUENCES[0x2028] = "\\L";
ESCAPE_SEQUENCES[0x2029] = "\\P";
const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF",
];
function encodeHex(character) {
    const string = character.toString(16).toUpperCase();
    let handle;
    let length;
    if (character <= 0xff) {
        handle = "x";
        length = 2;
    }
    else if (character <= 0xffff) {
        handle = "u";
        length = 4;
    }
    else if (character <= 0xffffffff) {
        handle = "U";
        length = 8;
    }
    else {
        throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return `\\${handle}${common.repeat("0", length - string.length)}${string}`;
}
// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
    const ind = common.repeat(" ", spaces), length = string.length;
    let position = 0, next = -1, result = "", line;
    while (position < length) {
        next = string.indexOf("\n", position);
        if (next === -1) {
            line = string.slice(position);
            position = length;
        }
        else {
            line = string.slice(position, next + 1);
            position = next + 1;
        }
        if (line.length && line !== "\n")
            result += ind;
        result += line;
    }
    return result;
}
function generateNextLine(state, level) {
    return `\n${common.repeat(" ", state.indent * level)}`;
}
function testImplicitResolving(state, str) {
    let type;
    for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
            return true;
        }
    }
    return false;
}
// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
}
// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
    return ((0x00020 <= c && c <= 0x00007e) ||
        (0x000a1 <= c && c <= 0x00d7ff && c !== 0x2028 && c !== 0x2029) ||
        (0x0e000 <= c && c <= 0x00fffd && c !== 0xfeff) /* BOM */ ||
        (0x10000 <= c && c <= 0x10ffff));
}
// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c) {
    // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
    // where nb-char ::= c-printable - b-char - c-byte-order-mark.
    return (isPrintable(c) &&
        c !== 0xfeff &&
        // - c-flow-indicator
        c !== CHAR_COMMA &&
        c !== CHAR_LEFT_SQUARE_BRACKET &&
        c !== CHAR_RIGHT_SQUARE_BRACKET &&
        c !== CHAR_LEFT_CURLY_BRACKET &&
        c !== CHAR_RIGHT_CURLY_BRACKET &&
        // - ":" - "#"
        c !== CHAR_COLON &&
        c !== CHAR_SHARP);
}
// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
    // Uses a subset of ns-char - c-indicator
    // where ns-char = nb-char - s-white.
    return (isPrintable(c) &&
        c !== 0xfeff &&
        !isWhitespace(c) && // - s-white
        // - (c-indicator ::=
        // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
        c !== CHAR_MINUS &&
        c !== CHAR_QUESTION &&
        c !== CHAR_COLON &&
        c !== CHAR_COMMA &&
        c !== CHAR_LEFT_SQUARE_BRACKET &&
        c !== CHAR_RIGHT_SQUARE_BRACKET &&
        c !== CHAR_LEFT_CURLY_BRACKET &&
        c !== CHAR_RIGHT_CURLY_BRACKET &&
        // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
        c !== CHAR_SHARP &&
        c !== CHAR_AMPERSAND &&
        c !== CHAR_ASTERISK &&
        c !== CHAR_EXCLAMATION &&
        c !== CHAR_VERTICAL_LINE &&
        c !== CHAR_GREATER_THAN &&
        c !== CHAR_SINGLE_QUOTE &&
        c !== CHAR_DOUBLE_QUOTE &&
        // | “%” | “@” | “`”)
        c !== CHAR_PERCENT &&
        c !== CHAR_COMMERCIAL_AT &&
        c !== CHAR_GRAVE_ACCENT);
}
// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
}
const STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//  STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//  STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//  STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    const shouldTrackWidth = lineWidth !== -1;
    let hasLineBreak = false, hasFoldableLine = false, // only checked if shouldTrackWidth
    previousLineBreak = -1, // count the first line correctly
    plain = isPlainSafeFirst(string.charCodeAt(0)) &&
        !isWhitespace(string.charCodeAt(string.length - 1));
    let char, i;
    if (singleLineOnly) {
        // Case: no block styles.
        // Check for disallowed characters to rule out plain and single.
        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            if (!isPrintable(char)) {
                return STYLE_DOUBLE;
            }
            plain = plain && isPlainSafe(char);
        }
    }
    else {
        // Case: block styles permitted.
        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            if (char === CHAR_LINE_FEED) {
                hasLineBreak = true;
                // Check if any line can be folded.
                if (shouldTrackWidth) {
                    hasFoldableLine =
                        hasFoldableLine ||
                            // Foldable line = too long, and not more-indented.
                            (i - previousLineBreak - 1 > lineWidth &&
                                string[previousLineBreak + 1] !== " ");
                    previousLineBreak = i;
                }
            }
            else if (!isPrintable(char)) {
                return STYLE_DOUBLE;
            }
            plain = plain && isPlainSafe(char);
        }
        // in case the end is missing a \n
        hasFoldableLine =
            hasFoldableLine ||
                (shouldTrackWidth &&
                    i - previousLineBreak - 1 > lineWidth &&
                    string[previousLineBreak + 1] !== " ");
    }
    // Although every style can represent \n without escaping, prefer block styles
    // for multiline, since they're more readable and they don't add empty lines.
    // Also prefer folding a super-long line.
    if (!hasLineBreak && !hasFoldableLine) {
        // Strings interpretable as another type have to be quoted;
        // e.g. the string 'true' vs. the boolean true.
        return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
    }
    // Edge case: block indentation indicator can only have one digit.
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
    }
    // At this point we know block styles are valid.
    // Prefer literal style unless we want to fold.
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}
// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
    if (line === "" || line[0] === " ")
        return line;
    // Since a more-indented line adds a \n, breaks can't be followed by a space.
    const breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
    let match;
    // start is an inclusive index. end, curr, and next are exclusive.
    let start = 0, end, curr = 0, next = 0;
    let result = "";
    // Invariants: 0 <= start <= length-1.
    //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
    // Inside the loop:
    //   A match implies length >= 2, so curr and next are <= length-2.
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = breakRe.exec(line))) {
        next = match.index;
        // maintain invariant: curr - start <= width
        if (next - start > width) {
            end = curr > start ? curr : next; // derive end <= length-2
            result += `\n${line.slice(start, end)}`;
            // skip the space that was output as \n
            start = end + 1; // derive start <= length-1
        }
        curr = next;
    }
    // By the invariants, start <= length-1, so there is something left over.
    // It is either the whole string or a part starting from non-whitespace.
    result += "\n";
    // Insert a break if the remainder is too long and there is a break available.
    if (line.length - start > width && curr > start) {
        result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
    }
    else {
        result += line.slice(start);
    }
    return result.slice(1); // drop extra \n joiner
}
// (See the note for writeScalar.)
function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
    // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
    // unless they're before or after a more-indented line, or at the very
    // beginning or end, in which case $k$ maps to $k$.
    // Therefore, parse each chunk as newline(s) followed by a content line.
    const lineRe = /(\n+)([^\n]*)/g;
    // first line (possibly an empty line)
    let result = (() => {
        let nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return foldLine(string.slice(0, nextLF), width);
    })();
    // If we haven't reached the first content line yet, don't add an extra \n.
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    // rest of the lines
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = lineRe.exec(string))) {
        const prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result +=
            prefix +
                (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") +
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                foldLine(line, width);
        prevMoreIndented = moreIndented;
    }
    return result;
}
// Escapes a double-quoted string.
function escapeString(string) {
    let result = "";
    let char, nextChar;
    let escapeSeq;
    for (let i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
        if (char >= 0xd800 && char <= 0xdbff /* high surrogate */) {
            nextChar = string.charCodeAt(i + 1);
            if (nextChar >= 0xdc00 && nextChar <= 0xdfff /* low surrogate */) {
                // Combine the surrogate pair and store it escaped.
                result += encodeHex((char - 0xd800) * 0x400 + nextChar - 0xdc00 + 0x10000);
                // Advance index one extra since we already used that char here.
                i++;
                continue;
            }
        }
        escapeSeq = ESCAPE_SEQUENCES[char];
        result +=
            !escapeSeq && isPrintable(char)
                ? string[i]
                : escapeSeq || encodeHex(char);
    }
    return result;
}
// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string)
        ? String(indentPerLevel)
        : "";
    // note the special case: the string '\n' counts as a "trailing" empty line.
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return `${indentIndicator}${chomp}\n`;
}
// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
    state.dump = (() => {
        if (string.length === 0) {
            return "''";
        }
        if (!state.noCompatMode &&
            DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
            return `'${string}'`;
        }
        const indent = state.indent * Math.max(1, level); // no 0-indent scalars
        // As indentation gets deeper, let the width decrease monotonically
        // to the lower bound min(state.lineWidth, 40).
        // Note that this implies
        //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
        //  state.lineWidth > 40 + state.indent: width decreases until the lower
        //  bound.
        // This behaves better than a constant minimum width which disallows
        // narrower options, or an indent threshold which causes the width
        // to suddenly increase.
        const lineWidth = state.lineWidth === -1
            ? -1
            : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        // Without knowing if keys are implicit/explicit,
        // assume implicit for safety.
        const singleLineOnly = iskey ||
            // No block styles in flow mode.
            (state.flowLevel > -1 && level >= state.flowLevel);
        function testAmbiguity(str) {
            return testImplicitResolving(state, str);
        }
        switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
            case STYLE_PLAIN:
                return string;
            case STYLE_SINGLE:
                return `'${string.replace(/'/g, "''")}'`;
            case STYLE_LITERAL:
                return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent))}`;
            case STYLE_FOLDED:
                return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth), indent))}`;
            case STYLE_DOUBLE:
                return `"${escapeString(string)}"`;
            default:
                throw new YAMLError("impossible error: invalid scalar style");
        }
    })();
}
function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
        // Write only valid elements.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (writeNode(state, level, object[index], false, false)) {
            if (index !== 0)
                _result += `,${!state.condenseFlow ? " " : ""}`;
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = `[${_result}]`;
}
function writeBlockSequence(state, level, object, compact = false) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
        // Write only valid elements.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (writeNode(state, level + 1, object[index], true, true)) {
            if (!compact || index !== 0) {
                _result += generateNextLine(state, level);
            }
            if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                _result += "-";
            }
            else {
                _result += "- ";
            }
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = _result || "[]"; // Empty sequence if no valid values.
}
function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let pairBuffer, objectKey, objectValue;
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = state.condenseFlow ? '"' : "";
        if (index !== 0)
            pairBuffer += ", ";
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!writeNode(state, level, objectKey, false, false)) {
            continue; // Skip this pair because of invalid key;
        }
        if (state.dump.length > 1024)
            pairBuffer += "? ";
        pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!writeNode(state, level, objectValue, false, false)) {
            continue; // Skip this pair because of invalid value.
        }
        pairBuffer += state.dump;
        // Both key and value are valid.
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = `{${_result}}`;
}
function writeBlockMapping(state, level, object, compact = false) {
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let _result = "";
    // Allow sorting keys so that the output file is deterministic
    if (state.sortKeys === true) {
        // Default sorting
        objectKeyList.sort();
    }
    else if (typeof state.sortKeys === "function") {
        // Custom sort function
        objectKeyList.sort(state.sortKeys);
    }
    else if (state.sortKeys) {
        // Something is wrong
        throw new YAMLError("sortKeys must be a boolean or a function");
    }
    let pairBuffer = "", objectKey, objectValue, explicitPair;
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (!compact || index !== 0) {
            pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
            continue; // Skip this pair because of invalid key.
        }
        explicitPair =
            (state.tag !== null && state.tag !== "?") ||
                (state.dump && state.dump.length > 1024);
        if (explicitPair) {
            if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                pairBuffer += "?";
            }
            else {
                pairBuffer += "? ";
            }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
            pairBuffer += generateNextLine(state, level);
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
            continue; // Skip this pair because of invalid value.
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += ":";
        }
        else {
            pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        // Both key and value are valid.
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}"; // Empty mapping if no valid pairs.
}
function detectType(state, object, explicit = false) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    let type;
    let style;
    let _result;
    for (let index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];
        if ((type.instanceOf || type.predicate) &&
            (!type.instanceOf ||
                (typeof object === "object" && object instanceof type.instanceOf)) &&
            (!type.predicate || type.predicate(object))) {
            state.tag = explicit ? type.tag : "?";
            if (type.represent) {
                style = state.styleMap[type.tag] || type.defaultStyle;
                if (_toString.call(type.represent) === "[object Function]") {
                    _result = type.represent(object, style);
                }
                else if (_hasOwnProperty.call(type.represent, style)) {
                    _result = type.represent[style](object, style);
                }
                else {
                    throw new YAMLError(`!<${type.tag}> tag resolver accepts not "${style}" style`);
                }
                state.dump = _result;
            }
            return true;
        }
    }
    return false;
}
// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey = false) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
        detectType(state, object, true);
    }
    const type = _toString.call(state.dump);
    if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type === "[object Object]" || type === "[object Array]";
    let duplicateIndex = -1;
    let duplicate = false;
    if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
    }
    if ((state.tag !== null && state.tag !== "?") ||
        duplicate ||
        (state.indent !== 2 && level > 0)) {
        compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = `*ref_${duplicateIndex}`;
    }
    else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
            state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
            if (block && Object.keys(state.dump).length !== 0) {
                writeBlockMapping(state, level, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            }
            else {
                writeFlowMapping(state, level, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        }
        else if (type === "[object Array]") {
            const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
            if (block && state.dump.length !== 0) {
                writeBlockSequence(state, arrayLevel, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            }
            else {
                writeFlowSequence(state, arrayLevel, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        }
        else if (type === "[object String]") {
            if (state.tag !== "?") {
                writeScalar(state, state.dump, level, iskey);
            }
        }
        else {
            if (state.skipInvalid)
                return false;
            throw new YAMLError(`unacceptable kind of an object to dump ${type}`);
        }
        if (state.tag !== null && state.tag !== "?") {
            state.dump = `!<${state.tag}> ${state.dump}`;
        }
    }
    return true;
}
function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
        const index = objects.indexOf(object);
        if (index !== -1) {
            if (duplicatesIndexes.indexOf(index) === -1) {
                duplicatesIndexes.push(index);
            }
        }
        else {
            objects.push(object);
            if (Array.isArray(object)) {
                for (let idx = 0, length = object.length; idx < length; idx += 1) {
                    inspectNode(object[idx], objects, duplicatesIndexes);
                }
            }
            else {
                const objectKeyList = Object.keys(object);
                for (let idx = 0, length = objectKeyList.length; idx < length; idx += 1) {
                    inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                }
            }
        }
    }
}
function getDuplicateReferences(object, state) {
    const objects = [], duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for (let index = 0; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
}
export function dump(input, options) {
    options = options || {};
    const state = new DumperState(options);
    if (!state.noRefs)
        getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true))
        return `${state.dump}\n`;
    return "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC9kdW1wZXIvZHVtcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSw0QkFBNEI7QUFFNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV4QyxPQUFPLEtBQUssTUFBTSxNQUFNLGFBQWEsQ0FBQztBQUN0QyxPQUFPLEVBQUUsV0FBVyxFQUFzQixNQUFNLG1CQUFtQixDQUFDO0FBS3BFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO0FBQzVDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBRXhELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLFNBQVM7QUFDaEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUTtBQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXO0FBQ3BDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTztBQUN0QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU87QUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTztBQUNoQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPO0FBQ2xDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU87QUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPO0FBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU87QUFDbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTztBQUNoQyxNQUFN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