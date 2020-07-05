// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/* eslint-disable max-len */
import { YAMLError } from "../error.ts";
import { Mark } from "../mark.ts";
import * as common from "../utils.ts";
import { LoaderState } from "./loader_state.ts";
const _hasOwnProperty = Object.prototype.hasOwnProperty;
const CONTEXT_FLOW_IN = 1;
const CONTEXT_FLOW_OUT = 2;
const CONTEXT_BLOCK_IN = 3;
const CONTEXT_BLOCK_OUT = 4;
const CHOMPING_CLIP = 1;
const CHOMPING_STRIP = 2;
const CHOMPING_KEEP = 3;
const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
const PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
const PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
/* eslint-disable-next-line max-len */
const PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
    return Object.prototype.toString.call(obj);
}
function isEOL(c) {
    return c === 0x0a || /* LF */ c === 0x0d /* CR */;
}
function isWhiteSpace(c) {
    return c === 0x09 || /* Tab */ c === 0x20 /* Space */;
}
function isWsOrEol(c) {
    return (c === 0x09 /* Tab */ ||
        c === 0x20 /* Space */ ||
        c === 0x0a /* LF */ ||
        c === 0x0d /* CR */);
}
function isFlowIndicator(c) {
    return (c === 0x2c /* , */ ||
        c === 0x5b /* [ */ ||
        c === 0x5d /* ] */ ||
        c === 0x7b /* { */ ||
        c === 0x7d /* } */);
}
function fromHexCode(c) {
    if (0x30 <= /* 0 */ c && c <= 0x39 /* 9 */) {
        return c - 0x30;
    }
    const lc = c | 0x20;
    if (0x61 <= /* a */ lc && lc <= 0x66 /* f */) {
        return lc - 0x61 + 10;
    }
    return -1;
}
function escapedHexLen(c) {
    if (c === 0x78 /* x */) {
        return 2;
    }
    if (c === 0x75 /* u */) {
        return 4;
    }
    if (c === 0x55 /* U */) {
        return 8;
    }
    return 0;
}
function fromDecimalCode(c) {
    if (0x30 <= /* 0 */ c && c <= 0x39 /* 9 */) {
        return c - 0x30;
    }
    return -1;
}
function simpleEscapeSequence(c) {
    /* eslint:disable:prettier */
    return c === 0x30 /* 0 */
        ? "\x00"
        : c === 0x61 /* a */
            ? "\x07"
            : c === 0x62 /* b */
                ? "\x08"
                : c === 0x74 /* t */
                    ? "\x09"
                    : c === 0x09 /* Tab */
                        ? "\x09"
                        : c === 0x6e /* n */
                            ? "\x0A"
                            : c === 0x76 /* v */
                                ? "\x0B"
                                : c === 0x66 /* f */
                                    ? "\x0C"
                                    : c === 0x72 /* r */
                                        ? "\x0D"
                                        : c === 0x65 /* e */
                                            ? "\x1B"
                                            : c === 0x20 /* Space */
                                                ? " "
                                                : c === 0x22 /* " */
                                                    ? "\x22"
                                                    : c === 0x2f /* / */
                                                        ? "/"
                                                        : c === 0x5c /* \ */
                                                            ? "\x5C"
                                                            : c === 0x4e /* N */
                                                                ? "\x85"
                                                                : c === 0x5f /* _ */
                                                                    ? "\xA0"
                                                                    : c === 0x4c /* L */
                                                                        ? "\u2028"
                                                                        : c === 0x50 /* P */
                                                                            ? "\u2029"
                                                                            : "";
    /* eslint:enable:prettier */
}
function charFromCodepoint(c) {
    if (c <= 0xffff) {
        return String.fromCharCode(c);
    }
    // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
    return String.fromCharCode(((c - 0x010000) >> 10) + 0xd800, ((c - 0x010000) & 0x03ff) + 0xdc00);
}
const simpleEscapeCheck = new Array(256); // integer, for fast access
const simpleEscapeMap = new Array(256);
for (let i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function generateError(state, message) {
    return new YAMLError(message, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
}
function throwError(state, message) {
    throw generateError(state, message);
}
function throwWarning(state, message) {
    if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
    }
}
const directiveHandlers = {
    YAML(state, _name, ...args) {
        if (state.version !== null) {
            return throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
            return throwError(state, "YAML directive accepts exactly one argument");
        }
        const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
            return throwError(state, "ill-formed argument of the YAML directive");
        }
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        if (major !== 1) {
            return throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
            return throwWarning(state, "unsupported YAML version of the document");
        }
    },
    TAG(state, _name, ...args) {
        if (args.length !== 2) {
            return throwError(state, "TAG directive accepts exactly two arguments");
        }
        const handle = args[0];
        const prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
            return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty.call(state.tagMap, handle)) {
            return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
            return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        if (typeof state.tagMap === "undefined") {
            state.tagMap = {};
        }
        state.tagMap[handle] = prefix;
    },
};
function captureSegment(state, start, end, checkJson) {
    let result;
    if (start < end) {
        result = state.input.slice(start, end);
        if (checkJson) {
            for (let position = 0, length = result.length; position < length; position++) {
                const character = result.charCodeAt(position);
                if (!(character === 0x09 || (0x20 <= character && character <= 0x10ffff))) {
                    return throwError(state, "expected valid JSON character");
                }
            }
        }
        else if (PATTERN_NON_PRINTABLE.test(result)) {
            return throwError(state, "the stream contains non-printable characters");
        }
        state.result += result;
    }
}
function mergeMappings(state, destination, source, overridableKeys) {
    if (!common.isObject(source)) {
        return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    const keys = Object.keys(source);
    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (!_hasOwnProperty.call(destination, key)) {
            destination[key] = source[key];
            overridableKeys[key] = true;
        }
    }
}
function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).
    if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (let index = 0, quantity = keyNode.length; index < quantity; index++) {
            if (Array.isArray(keyNode[index])) {
                return throwError(state, "nested arrays are not supported inside keys");
            }
            if (typeof keyNode === "object" &&
                _class(keyNode[index]) === "[object Object]") {
                keyNode[index] = "[object Object]";
            }
        }
    }
    // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (result === null) {
        result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
            for (let index = 0, quantity = valueNode.length; index < quantity; index++) {
                mergeMappings(state, result, valueNode[index], overridableKeys);
            }
        }
        else {
            mergeMappings(state, result, valueNode, overridableKeys);
        }
    }
    else {
        if (!state.json &&
            !_hasOwnProperty.call(overridableKeys, keyNode) &&
            _hasOwnProperty.call(result, keyNode)) {
            state.line = startLine || state.line;
            state.position = startPos || state.position;
            return throwError(state, "duplicated mapping key");
        }
        result[keyNode] = valueNode;
        delete overridableKeys[keyNode];
    }
    return result;
}
function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 0x0a /* LF */) {
        state.position++;
    }
    else if (ch === 0x0d /* CR */) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 0x0a /* LF */) {
            state.position++;
        }
    }
    else {
        return throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0, ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
        while (isWhiteSpace(ch)) {
            ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 0x23 /* # */) {
            do {
                ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0x0a && /* LF */ ch !== 0x0d && /* CR */ ch !== 0);
        }
        if (isEOL(ch)) {
            readLineBreak(state);
            ch = state.input.charCodeAt(state.position);
            lineBreaks++;
            state.lineIndent = 0;
            while (ch === 0x20 /* Space */) {
                state.lineIndent++;
                ch = state.input.charCodeAt(++state.position);
            }
        }
        else {
            break;
        }
    }
    if (checkIndent !== -1 &&
        lineBreaks !== 0 &&
        state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
}
function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.
    if ((ch === 0x2d || /* - */ ch === 0x2e) /* . */ &&
        ch === state.input.charCodeAt(_position + 1) &&
        ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || isWsOrEol(ch)) {
            return true;
        }
    }
    return false;
}
function writeFoldedLines(state, count) {
    if (count === 1) {
        state.result += " ";
    }
    else if (count > 1) {
        state.result += common.repeat("\n", count - 1);
    }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    const kind = state.kind;
    const result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) ||
        isFlowIndicator(ch) ||
        ch === 0x23 /* # */ ||
        ch === 0x26 /* & */ ||
        ch === 0x2a /* * */ ||
        ch === 0x21 /* ! */ ||
        ch === 0x7c /* | */ ||
        ch === 0x3e /* > */ ||
        ch === 0x27 /* ' */ ||
        ch === 0x22 /* " */ ||
        ch === 0x25 /* % */ ||
        ch === 0x40 /* @ */ ||
        ch === 0x60 /* ` */) {
        return false;
    }
    let following;
    if (ch === 0x3f || /* ? */ ch === 0x2d /* - */) {
        following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) ||
            (withinFlowCollection && isFlowIndicator(following))) {
            return false;
        }
    }
    state.kind = "scalar";
    state.result = "";
    let captureEnd, captureStart = (captureEnd = state.position);
    let hasPendingContent = false;
    let line = 0;
    while (ch !== 0) {
        if (ch === 0x3a /* : */) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following) ||
                (withinFlowCollection && isFlowIndicator(following))) {
                break;
            }
        }
        else if (ch === 0x23 /* # */) {
            const preceding = state.input.charCodeAt(state.position - 1);
            if (isWsOrEol(preceding)) {
                break;
            }
        }
        else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
            (withinFlowCollection && isFlowIndicator(ch))) {
            break;
        }
        else if (isEOL(ch)) {
            line = state.line;
            const lineStart = state.lineStart;
            const lineIndent = state.lineIndent;
            skipSeparationSpace(state, false, -1);
            if (state.lineIndent >= nodeIndent) {
                hasPendingContent = true;
                ch = state.input.charCodeAt(state.position);
                continue;
            }
            else {
                state.position = captureEnd;
                state.line = line;
                state.lineStart = lineStart;
                state.lineIndent = lineIndent;
                break;
            }
        }
        if (hasPendingContent) {
            captureSegment(state, captureStart, captureEnd, false);
            writeFoldedLines(state, state.line - line);
            captureStart = captureEnd = state.position;
            hasPendingContent = false;
        }
        if (!isWhiteSpace(ch)) {
            captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
        return true;
    }
    state.kind = kind;
    state.result = result;
    return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
    let ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x27 /* ' */) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 0x27 /* ' */) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (ch === 0x27 /* ' */) {
                captureStart = state.position;
                state.position++;
                captureEnd = state.position;
            }
            else {
                return true;
            }
        }
        else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        }
        else if (state.position === state.lineStart &&
            testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a single quoted scalar");
        }
        else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x22 /* " */) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    let captureEnd, captureStart = (captureEnd = state.position);
    let tmp;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 0x22 /* " */) {
            captureSegment(state, captureStart, state.position, true);
            state.position++;
            return true;
        }
        if (ch === 0x5c /* \ */) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (isEOL(ch)) {
                skipSeparationSpace(state, false, nodeIndent);
                // TODO: rework to inline fn with no type cast?
            }
            else if (ch < 256 && simpleEscapeCheck[ch]) {
                state.result += simpleEscapeMap[ch];
                state.position++;
            }
            else if ((tmp = escapedHexLen(ch)) > 0) {
                let hexLength = tmp;
                let hexResult = 0;
                for (; hexLength > 0; hexLength--) {
                    ch = state.input.charCodeAt(++state.position);
                    if ((tmp = fromHexCode(ch)) >= 0) {
                        hexResult = (hexResult << 4) + tmp;
                    }
                    else {
                        return throwError(state, "expected hexadecimal character");
                    }
                }
                state.result += charFromCodepoint(hexResult);
                state.position++;
            }
            else {
                return throwError(state, "unknown escape sequence");
            }
            captureStart = captureEnd = state.position;
        }
        else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        }
        else if (state.position === state.lineStart &&
            testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a double quoted scalar");
        }
        else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    let terminator;
    let isMapping = true;
    let result = {};
    if (ch === 0x5b /* [ */) {
        terminator = 0x5d; /* ] */
        isMapping = false;
        result = [];
    }
    else if (ch === 0x7b /* { */) {
        terminator = 0x7d; /* } */
    }
    else {
        return false;
    }
    if (state.anchor !== null &&
        typeof state.anchor != "undefined" &&
        typeof state.anchorMap != "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(++state.position);
    const tag = state.tag, anchor = state.anchor;
    let readNext = true;
    let valueNode, keyNode, keyTag = (keyNode = valueNode = null), isExplicitPair, isPair = (isExplicitPair = false);
    let following = 0, line = 0;
    const overridableKeys = {};
    while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
            state.position++;
            state.tag = tag;
            state.anchor = anchor;
            state.kind = isMapping ? "mapping" : "sequence";
            state.result = result;
            return true;
        }
        if (!readNext) {
            return throwError(state, "missed comma between flow collection entries");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 0x3f /* ? */) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following)) {
                isPair = isExplicitPair = true;
                state.position++;
                skipSeparationSpace(state, true, nodeIndent);
            }
        }
        line = state.line;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag || null;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === line) && ch === 0x3a /* : */) {
            isPair = true;
            ch = state.input.charCodeAt(++state.position);
            skipSeparationSpace(state, true, nodeIndent);
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
            valueNode = state.result;
        }
        if (isMapping) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
        }
        else if (isPair) {
            result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
        }
        else {
            result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 0x2c /* , */) {
            readNext = true;
            ch = state.input.charCodeAt(++state.position);
        }
        else {
            readNext = false;
        }
    }
    return throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
    let chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false;
    let ch = state.input.charCodeAt(state.position);
    let folding = false;
    if (ch === 0x7c /* | */) {
        folding = false;
    }
    else if (ch === 0x3e /* > */) {
        folding = true;
    }
    else {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    let tmp = 0;
    while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
        if (ch === 0x2b || /* + */ ch === 0x2d /* - */) {
            if (CHOMPING_CLIP === chomping) {
                chomping = ch === 0x2b /* + */ ? CHOMPING_KEEP : CHOMPING_STRIP;
            }
            else {
                return throwError(state, "repeat of a chomping mode identifier");
            }
        }
        else if ((tmp = fromDecimalCode(ch)) >= 0) {
            if (tmp === 0) {
                return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
            }
            else if (!detectedIndent) {
                textIndent = nodeIndent + tmp - 1;
                detectedIndent = true;
            }
            else {
                return throwError(state, "repeat of an indentation width identifier");
            }
        }
        else {
            break;
        }
    }
    if (isWhiteSpace(ch)) {
        do {
            ch = state.input.charCodeAt(++state.position);
        } while (isWhiteSpace(ch));
        if (ch === 0x23 /* # */) {
            do {
                ch = state.input.charCodeAt(++state.position);
            } while (!isEOL(ch) && ch !== 0);
        }
    }
    while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while ((!detectedIndent || state.lineIndent < textIndent) &&
            ch === 0x20 /* Space */) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
            textIndent = state.lineIndent;
        }
        if (isEOL(ch)) {
            emptyLines++;
            continue;
        }
        // End of the scalar.
        if (state.lineIndent < textIndent) {
            // Perform the chomping.
            if (chomping === CHOMPING_KEEP) {
                state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            }
            else if (chomping === CHOMPING_CLIP) {
                if (didReadContent) {
                    // i.e. only if the scalar is not empty.
                    state.result += "\n";
                }
            }
            // Break this `while` cycle and go to the funciton's epilogue.
            break;
        }
        // Folded style: use fancy rules to handle line breaks.
        if (folding) {
            // Lines starting with white space characters (more-indented lines) are not folded.
            if (isWhiteSpace(ch)) {
                atMoreIndented = true;
                // except for the first content line (cf. Example 8.1)
                state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
                // End of more-indented block.
            }
            else if (atMoreIndented) {
                atMoreIndented = false;
                state.result += common.repeat("\n", emptyLines + 1);
                // Just one line break - perceive as the same line.
            }
            else if (emptyLines === 0) {
                if (didReadContent) {
                    // i.e. only if we have already read some scalar content.
                    state.result += " ";
                }
                // Several line breaks - perceive as different lines.
            }
            else {
                state.result += common.repeat("\n", emptyLines);
            }
            // Literal style: just add exact number of line breaks between content lines.
        }
        else {
            // Keep all line breaks except the header line break.
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        const captureStart = state.position;
        while (!isEOL(ch) && ch !== 0) {
            ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
    }
    return true;
}
function readBlockSequence(state, nodeIndent) {
    let line, following, detected = false, ch;
    const tag = state.tag, anchor = state.anchor, result = [];
    if (state.anchor !== null &&
        typeof state.anchor !== "undefined" &&
        typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
        if (ch !== 0x2d /* - */) {
            break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!isWsOrEol(following)) {
            break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
            if (state.lineIndent <= nodeIndent) {
                result.push(null);
                ch = state.input.charCodeAt(state.position);
                continue;
            }
        }
        line = state.line;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === line || state.lineIndent > nodeIndent) && ch !== 0) {
            return throwError(state, "bad indentation of a sequence entry");
        }
        else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    if (detected) {
        state.tag = tag;
        state.anchor = anchor;
        state.kind = "sequence";
        state.result = result;
        return true;
    }
    return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
    const tag = state.tag, anchor = state.anchor, result = {}, overridableKeys = {};
    let following, allowCompact = false, line, pos, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
    if (state.anchor !== null &&
        typeof state.anchor !== "undefined" &&
        typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
        following = state.input.charCodeAt(state.position + 1);
        line = state.line; // Save the current line.
        pos = state.position;
        //
        // Explicit notation case. There are two separate blocks:
        // first for the key (denoted by "?") and second for the value (denoted by ":")
        //
        if ((ch === 0x3f || /* ? */ ch === 0x3a) && /* : */ isWsOrEol(following)) {
            if (ch === 0x3f /* ? */) {
                if (atExplicitKey) {
                    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                    keyTag = keyNode = valueNode = null;
                }
                detected = true;
                atExplicitKey = true;
                allowCompact = true;
            }
            else if (atExplicitKey) {
                // i.e. 0x3A/* : */ === character after the explicit key.
                atExplicitKey = false;
                allowCompact = true;
            }
            else {
                return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
            }
            state.position += 1;
            ch = following;
            //
            // Implicit notation case. Flow-style node as the key first, then ":", and the value.
            //
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
        }
        else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
            if (state.line === line) {
                ch = state.input.charCodeAt(state.position);
                while (isWhiteSpace(ch)) {
                    ch = state.input.charCodeAt(++state.position);
                }
                if (ch === 0x3a /* : */) {
                    ch = state.input.charCodeAt(++state.position);
                    if (!isWsOrEol(ch)) {
                        return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
                    }
                    if (atExplicitKey) {
                        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                        keyTag = keyNode = valueNode = null;
                    }
                    detected = true;
                    atExplicitKey = false;
                    allowCompact = false;
                    keyTag = state.tag;
                    keyNode = state.result;
                }
                else if (detected) {
                    return throwError(state, "can not read an implicit mapping pair; a colon is missed");
                }
                else {
                    state.tag = tag;
                    state.anchor = anchor;
                    return true; // Keep the result of `composeNode`.
                }
            }
            else if (detected) {
                return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
            }
            else {
                state.tag = tag;
                state.anchor = anchor;
                return true; // Keep the result of `composeNode`.
            }
        }
        else {
            break; // Reading is done. Go to the epilogue.
        }
        //
        // Common reading code for both explicit and implicit notations.
        //
        if (state.line === line || state.lineIndent > nodeIndent) {
            if (
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
                if (atExplicitKey) {
                    keyNode = state.result;
                }
                else {
                    valueNode = state.result;
                }
            }
            if (!atExplicitKey) {
                storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line, pos);
                keyTag = keyNode = valueNode = null;
            }
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
        }
        if (state.lineIndent > nodeIndent && ch !== 0) {
            return throwError(state, "bad indentation of a mapping entry");
        }
        else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    //
    // Epilogue.
    //
    // Special case: last mapping's node contains only the key in explicit notation.
    if (atExplicitKey) {
        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
    }
    // Expose the resulting mapping.
    if (detected) {
        state.tag = tag;
        state.anchor = anchor;
        state.kind = "mapping";
        state.result = result;
    }
    return detected;
}
function readTagProperty(state) {
    let position, isVerbatim = false, isNamed = false, tagHandle = "", tagName, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x21 /* ! */)
        return false;
    if (state.tag !== null) {
        return throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 0x3c /* < */) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
    }
    else if (ch === 0x21 /* ! */) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
    }
    else {
        tagHandle = "!";
    }
    position = state.position;
    if (isVerbatim) {
        do {
            ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && ch !== 0x3e /* > */);
        if (state.position < state.length) {
            tagName = state.input.slice(position, state.position);
            ch = state.input.charCodeAt(++state.position);
        }
        else {
            return throwError(state, "unexpected end of the stream within a verbatim tag");
        }
    }
    else {
        while (ch !== 0 && !isWsOrEol(ch)) {
            if (ch === 0x21 /* ! */) {
                if (!isNamed) {
                    tagHandle = state.input.slice(position - 1, state.position + 1);
                    if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                        return throwError(state, "named tag handle cannot contain such characters");
                    }
                    isNamed = true;
                    position = state.position + 1;
                }
                else {
                    return throwError(state, "tag suffix cannot contain exclamation marks");
                }
            }
            ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
            return throwError(state, "tag suffix cannot contain flow indicator characters");
        }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        return throwError(state, `tag name cannot contain such characters: ${tagName}`);
    }
    if (isVerbatim) {
        state.tag = tagName;
    }
    else if (typeof state.tagMap !== "undefined" &&
        _hasOwnProperty.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
    }
    else if (tagHandle === "!") {
        state.tag = `!${tagName}`;
    }
    else if (tagHandle === "!!") {
        state.tag = `tag:yaml.org,2002:${tagName}`;
    }
    else {
        return throwError(state, `undeclared tag handle "${tagHandle}"`);
    }
    return true;
}
function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x26 /* & */)
        return false;
    if (state.anchor !== null) {
        return throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === position) {
        return throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(position, state.position);
    return true;
}
function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x2a /* * */)
        return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
        return throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (typeof state.anchorMap !== "undefined" &&
        !Object.prototype.hasOwnProperty.call(state.anchorMap, alias)) {
        return throwError(state, `unidentified alias "${alias}"`);
    }
    if (typeof state.anchorMap !== "undefined") {
        state.result = state.anchorMap[alias];
    }
    skipSeparationSpace(state, true, -1);
    return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars, allowBlockCollections, indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
    atNewLine = false, hasContent = false, type, flowIndent, blockIndent;
    if (state.listener && state.listener !== null) {
        state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = (allowBlockScalars = allowBlockCollections =
        CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext);
    if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            if (state.lineIndent > parentIndent) {
                indentStatus = 1;
            }
            else if (state.lineIndent === parentIndent) {
                indentStatus = 0;
            }
            else if (state.lineIndent < parentIndent) {
                indentStatus = -1;
            }
        }
    }
    if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
            if (skipSeparationSpace(state, true, -1)) {
                atNewLine = true;
                allowBlockCollections = allowBlockStyles;
                if (state.lineIndent > parentIndent) {
                    indentStatus = 1;
                }
                else if (state.lineIndent === parentIndent) {
                    indentStatus = 0;
                }
                else if (state.lineIndent < parentIndent) {
                    indentStatus = -1;
                }
            }
            else {
                allowBlockCollections = false;
            }
        }
    }
    if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        const cond = CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext;
        flowIndent = cond ? parentIndent : parentIndent + 1;
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
            if ((allowBlockCollections &&
                (readBlockSequence(state, blockIndent) ||
                    readBlockMapping(state, blockIndent, flowIndent))) ||
                readFlowCollection(state, flowIndent)) {
                hasContent = true;
            }
            else {
                if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
                    readSingleQuotedScalar(state, flowIndent) ||
                    readDoubleQuotedScalar(state, flowIndent)) {
                    hasContent = true;
                }
                else if (readAlias(state)) {
                    hasContent = true;
                    if (state.tag !== null || state.anchor !== null) {
                        return throwError(state, "alias node should not have Any properties");
                    }
                }
                else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
                    hasContent = true;
                    if (state.tag === null) {
                        state.tag = "?";
                    }
                }
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        }
        else if (indentStatus === 0) {
            // Special case: block sequences are allowed to have same indentation level as the parent.
            // http://www.yaml.org/spec/1.2/spec.html#id2799784
            hasContent =
                allowBlockCollections && readBlockSequence(state, blockIndent);
        }
    }
    if (state.tag !== null && state.tag !== "!") {
        if (state.tag === "?") {
            for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex++) {
                type = state.implicitTypes[typeIndex];
                // Implicit resolving is not allowed for non-scalar types, and '?'
                // non-specific tag is only assigned to plain scalars. So, it isn't
                // needed to check for 'kind' conformity.
                if (type.resolve(state.result)) {
                    // `state.result` updated in resolver if matched
                    state.result = type.construct(state.result);
                    state.tag = type.tag;
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                    break;
                }
            }
        }
        else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
            type = state.typeMap[state.kind || "fallback"][state.tag];
            if (state.result !== null && type.kind !== state.kind) {
                return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type.kind}", not "${state.kind}"`);
            }
            if (!type.resolve(state.result)) {
                // `state.result` updated in resolver if matched
                return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
            }
            else {
                state.result = type.construct(state.result);
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        }
        else {
            return throwError(state, `unknown tag !<${state.tag}>`);
        }
    }
    if (state.listener && state.listener !== null) {
        state.listener("close", state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
    const documentStart = state.position;
    let position, directiveName, directiveArgs, hasDirectives = false, ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 0x25 /* % */) {
            break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        position = state.position;
        while (ch !== 0 && !isWsOrEol(ch)) {
            ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
            return throwError(state, "directive name must not be less than one character in length");
        }
        while (ch !== 0) {
            while (isWhiteSpace(ch)) {
                ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 0x23 /* # */) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                } while (ch !== 0 && !isEOL(ch));
                break;
            }
            if (isEOL(ch))
                break;
            position = state.position;
            while (ch !== 0 && !isWsOrEol(ch)) {
                ch = state.input.charCodeAt(++state.position);
            }
            directiveArgs.push(state.input.slice(position, state.position));
        }
        if (ch !== 0)
            readLineBreak(state);
        if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
            directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
        }
        else {
            throwWarning(state, `unknown document directive "${directiveName}"`);
        }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 &&
        state.input.charCodeAt(state.position) === 0x2d /* - */ &&
        state.input.charCodeAt(state.position + 1) === 0x2d /* - */ &&
        state.input.charCodeAt(state.position + 2) === 0x2d /* - */) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
    }
    else if (hasDirectives) {
        return throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks &&
        PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 0x2e /* . */) {
            state.position += 3;
            skipSeparationSpace(state, true, -1);
        }
        return;
    }
    if (state.position < state.length - 1) {
        return throwError(state, "end of the stream or a document separator is expected");
    }
    else {
        return;
    }
}
function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
        // Add tailing `\n` if not exists
        if (input.charCodeAt(input.length - 1) !== 0x0a /* LF */ &&
            input.charCodeAt(input.length - 1) !== 0x0d /* CR */) {
            input += "\n";
        }
        // Strip BOM
        if (input.charCodeAt(0) === 0xfeff) {
            input = input.slice(1);
        }
    }
    const state = new LoaderState(input, options);
    // Use 0 as string terminator. That significantly simplifies bounds check.
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 0x20 /* Space */) {
        state.lineIndent += 1;
        state.position += 1;
    }
    while (state.position < state.length - 1) {
        readDocument(state);
    }
    return state.documents;
}
function isCbFunction(fn) {
    return typeof fn === "function";
}
export function loadAll(input, iteratorOrOption, options) {
    if (!isCbFunction(iteratorOrOption)) {
        return loadDocuments(input, iteratorOrOption);
    }
    const documents = loadDocuments(input, options);
    const iterator = iteratorOrOption;
    for (let index = 0, length = documents.length; index < length; index++) {
        iterator(documents[index]);
    }
    return void 0;
}
export function load(input, options) {
    const documents = loadDocuments(input, options);
    if (documents.length === 0) {
        return;
    }
    if (documents.length === 1) {
        return documents[0];
    }
    throw new YAMLError("expected a single document in the stream, but found more");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC9sb2FkZXIvbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSw0QkFBNEI7QUFFNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWxDLE9BQU8sS0FBSyxNQUFNLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQWtDLE1BQU0sbUJBQW1CLENBQUM7QUFLaEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFFeEQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBRTVCLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDekIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBRXhCLE1BQU0scUJBQXFCLEdBQUcscUlBQXFJLENBQUM7QUFDcEssTUFBTSw2QkFBNkIsR0FBRyxvQkFBb0IsQ0FBQztBQUMzRCxNQUFNLHVCQUF1QixHQUFHLGFBQWEsQ0FBQztBQUM5QyxNQUFNLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDO0FBQ3BELHNDQUFzQztBQUN0QyxNQUFNLGVBQWUsR0FBRyxrRkFBa0YsQ0FBQztBQUUzRyxTQUFTLE1BQU0sQ0FBQyxHQUFZO0lBQzFCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxDQUFTO0lBQ3RCLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDcEQsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLENBQVM7SUFDN0IsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUN4RCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsQ0FBUztJQUMxQixPQUFPLENBQ0wsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTO1FBQ3BCLENBQUMsS0FBSyxJQUFJLENBQUMsV0FBVztRQUN0QixDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVE7UUFDbkIsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQ3BCLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsQ0FBUztJQUNoQyxPQUFPLENBQ0wsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ2xCLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTztRQUNsQixDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87UUFDbEIsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ2xCLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUNuQixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLENBQVM7SUFDNUIsSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUMxQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDakI7SUFFRCxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBRXBCLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDNUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUN2QjtJQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDWixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsQ0FBUztJQUM5QixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxDQUFTO0lBQ2hDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDMUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ2pCO0lBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLENBQVM7SUFDckMsNkJBQTZCO0lBQzdCLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ3ZCLENBQUMsQ0FBQyxNQUFNO1FBQ1IsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTztZQUNwQixDQUFDLENBQUMsTUFBTTtZQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87Z0JBQ3BCLENBQUMsQ0FBQyxNQUFNO2dCQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87b0JBQ3BCLENBQUMsQ0FBQyxNQUFNO29CQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVM7d0JBQ3RCLENBQUMsQ0FBQyxNQUFNO3dCQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87NEJBQ3BCLENBQUMsQ0FBQyxNQUFNOzRCQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87Z0NBQ3BCLENBQUMsQ0FBQyxNQUFNO2dDQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87b0NBQ3BCLENBQUMsQ0FBQyxNQUFNO29DQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87d0NBQ3BCLENBQUMsQ0FBQyxNQUFNO3dDQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87NENBQ3BCLENBQUMsQ0FBQyxNQUFNOzRDQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVc7Z0RBQ3hCLENBQUMsQ0FBQyxHQUFHO2dEQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87b0RBQ3BCLENBQUMsQ0FBQyxNQUFNO29EQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87d0RBQ3BCLENBQUMsQ0FBQyxHQUFHO3dEQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87NERBQ3BCLENBQUMsQ0FBQyxNQUFNOzREQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87Z0VBQ3BCLENBQUMsQ0FBQyxNQUFNO2dFQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87b0VBQ3BCLENBQUMsQ0FBQyxNQUFNO29FQUNSLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87d0VBQ3BCLENBQUMsQ0FBQyxRQUFRO3dFQUNWLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU87NEVBQ3BCLENBQUMsQ0FBQyxRQUFROzRFQUNWLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDUCw0QkFBNEI7QUFDOUIsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsQ0FBUztJQUNsQyxJQUFJLENBQUMsSUFBSSxNQUFNLEVBQUU7UUFDZixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0I7SUFDRCwrQkFBK0I7SUFDL0IsNEVBQTRFO0lBQzVFLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FDeEIsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQy9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUNuQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7QUFDckUsTUFBTSxlQUFlLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUM1QixpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlDO0FBRUQsU0FBUyxhQUFhLENBQUMsS0FBa0IsRUFBRSxPQUFlO0lBQ3hELE9BQU8sSUFBSSxTQUFTLENBQ2xCLE9BQU8sRUFDUCxJQUFJLElBQUksQ0FDTixLQUFLLENBQUMsUUFBa0IsRUFDeEIsS0FBSyxDQUFDLEtBQUssRUFDWCxLQUFLLENBQUMsUUFBUSxFQUNkLEtBQUssQ0FBQyxJQUFJLEVBQ1YsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUNqQyxDQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsS0FBa0IsRUFBRSxPQUFlO0lBQ3JELE1BQU0sYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsS0FBa0IsRUFBRSxPQUFlO0lBQ3ZELElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtRQUNuQixLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQzNEO0FBQ0gsQ0FBQztBQVVELE1BQU0saUJBQWlCLEdBQXNCO0lBQzNDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBYztRQUNsQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQzFCLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztTQUN6RTtRQUVELE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDbEIsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7U0FDdkU7UUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ2YsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7U0FDdkU7UUFFRCxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixLQUFLLENBQUMsZUFBZSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7U0FDeEU7SUFDSCxDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFjO1FBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7U0FDekU7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEMsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDZEQUE2RCxDQUM5RCxDQUFDO1NBQ0g7UUFFRCxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUM5QyxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsOENBQThDLE1BQU0sY0FBYyxDQUNuRSxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqQyxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsOERBQThELENBQy9ELENBQUM7U0FDSDtRQUVELElBQUksT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtZQUN2QyxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztTQUNuQjtRQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ2hDLENBQUM7Q0FDRixDQUFDO0FBRUYsU0FBUyxjQUFjLENBQ3JCLEtBQWtCLEVBQ2xCLEtBQWEsRUFDYixHQUFXLEVBQ1gsU0FBa0I7SUFFbEIsSUFBSSxNQUFjLENBQUM7SUFDbkIsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO1FBQ2YsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV2QyxJQUFJLFNBQVMsRUFBRTtZQUNiLEtBQ0UsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxFQUN4QyxRQUFRLEdBQUcsTUFBTSxFQUNqQixRQUFRLEVBQUUsRUFDVjtnQkFDQSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxJQUNFLENBQUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFNBQVMsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsRUFDckU7b0JBQ0EsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLCtCQUErQixDQUFDLENBQUM7aUJBQzNEO2FBQ0Y7U0FDRjthQUFNLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdDLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1NBQzFFO1FBRUQsS0FBSyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUM7S0FDeEI7QUFDSCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQ3BCLEtBQWtCLEVBQ2xCLFdBQXdCLEVBQ3hCLE1BQW1CLEVBQ25CLGVBQXFDO0lBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzVCLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCxtRUFBbUUsQ0FDcEUsQ0FBQztLQUNIO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDM0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFJLE1BQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEQsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUM3QjtLQUNGO0FBQ0gsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQ3ZCLEtBQWtCLEVBQ2xCLE1BQTBCLEVBQzFCLGVBQXFDLEVBQ3JDLE1BQXFCLEVBQ3JCLE9BQVksRUFDWixTQUFrQixFQUNsQixTQUFrQixFQUNsQixRQUFpQjtJQUVqQixrRUFBa0U7SUFDbEUsNEVBQTRFO0lBQzVFLG1FQUFtRTtJQUNuRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3hFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDakMsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7YUFDekU7WUFFRCxJQUNFLE9BQU8sT0FBTyxLQUFLLFFBQVE7Z0JBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsRUFDNUM7Z0JBQ0EsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGlCQUFpQixDQUFDO2FBQ3BDO1NBQ0Y7S0FDRjtJQUVELHVEQUF1RDtJQUN2RCxzREFBc0Q7SUFDdEQsb0VBQW9FO0lBQ3BFLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxpQkFBaUIsRUFBRTtRQUN4RSxPQUFPLEdBQUcsaUJBQWlCLENBQUM7S0FDN0I7SUFFRCxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTFCLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixNQUFNLEdBQUcsRUFBRSxDQUFDO0tBQ2I7SUFFRCxJQUFJLE1BQU0sS0FBSyx5QkFBeUIsRUFBRTtRQUN4QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsS0FDRSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsUUFBUSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQzFDLEtBQUssR0FBRyxRQUFRLEVBQ2hCLEtBQUssRUFBRSxFQUNQO2dCQUNBLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNqRTtTQUNGO2FBQU07WUFDTCxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUF3QixFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQ3pFO0tBQ0Y7U0FBTTtRQUNMLElBQ0UsQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNYLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO1lBQy9DLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUNyQztZQUNBLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDckMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUM1QyxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztTQUNwRDtRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDNUIsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDakM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsS0FBa0I7SUFDdkMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWxELElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDeEIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2xCO1NBQU0sSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUMvQixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM1RCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDbEI7S0FDRjtTQUFNO1FBQ0wsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDBCQUEwQixDQUFDLENBQUM7S0FDdEQ7SUFFRCxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUNoQixLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDbkMsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQzFCLEtBQWtCLEVBQ2xCLGFBQXNCLEVBQ3RCLFdBQW1CO0lBRW5CLElBQUksVUFBVSxHQUFHLENBQUMsRUFDaEIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU5QyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN2QixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFJLGFBQWEsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN4QyxHQUFHO2dCQUNELEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMvQyxRQUFRLEVBQUUsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7U0FDcEU7UUFFRCxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNiLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyQixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLFVBQVUsRUFBRSxDQUFDO1lBQ2IsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFFckIsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDOUIsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0M7U0FDRjthQUFNO1lBQ0wsTUFBTTtTQUNQO0tBQ0Y7SUFFRCxJQUNFLFdBQVcsS0FBSyxDQUFDLENBQUM7UUFDbEIsVUFBVSxLQUFLLENBQUM7UUFDaEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxXQUFXLEVBQzlCO1FBQ0EsWUFBWSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsS0FBa0I7SUFDL0MsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUMvQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzQyx5REFBeUQ7SUFDekQsdUVBQXVFO0lBQ3ZFLElBQ0UsQ0FBQyxFQUFFLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTztRQUM1QyxFQUFFLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUM1QyxFQUFFLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUM1QztRQUNBLFNBQVMsSUFBSSxDQUFDLENBQUM7UUFFZixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdkMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM3QixPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLEtBQWtCLEVBQUUsS0FBYTtJQUN6RCxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7UUFDZixLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztLQUNyQjtTQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtRQUNwQixLQUFLLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNoRDtBQUNILENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FDdEIsS0FBa0IsRUFDbEIsVUFBa0IsRUFDbEIsb0JBQTZCO0lBRTdCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDeEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM1QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEQsSUFDRSxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ2IsZUFBZSxDQUFDLEVBQUUsQ0FBQztRQUNuQixFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU87UUFDbkIsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ25CLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTztRQUNuQixFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU87UUFDbkIsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ25CLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTztRQUNuQixFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU87UUFDbkIsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQ25CLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTztRQUNuQixFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU87UUFDbkIsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQ25CO1FBQ0EsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQzlDLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXZELElBQ0UsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUNwQixDQUFDLG9CQUFvQixJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUNwRDtZQUNBLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7S0FDRjtJQUVELEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUksVUFBa0IsRUFDcEIsWUFBWSxHQUFHLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztJQUM5QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7SUFDYixPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDZixJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXZELElBQ0UsU0FBUyxDQUFDLFNBQVMsQ0FBQztnQkFDcEIsQ0FBQyxvQkFBb0IsSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsRUFDcEQ7Z0JBQ0EsTUFBTTthQUNQO1NBQ0Y7YUFBTSxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFN0QsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3hCLE1BQU07YUFDUDtTQUNGO2FBQU0sSUFDTCxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRSxDQUFDLG9CQUFvQixJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUM3QztZQUNBLE1BQU07U0FDUDthQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ2xCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNwQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEMsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLFVBQVUsRUFBRTtnQkFDbEMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxTQUFTO2FBQ1Y7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7Z0JBQzVCLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztnQkFDNUIsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7Z0JBQzlCLE1BQU07YUFDUDtTQUNGO1FBRUQsSUFBSSxpQkFBaUIsRUFBRTtZQUNyQixjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkQsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDM0MsWUFBWSxHQUFHLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQzNDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztTQUMzQjtRQUVELElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDckIsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXZELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNoQixPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FDN0IsS0FBa0IsRUFDbEIsVUFBa0I7SUFFbEIsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQztJQUVqQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVDLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDdkIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQixZQUFZLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFFM0MsT0FBTyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUQsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN2QixjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFELEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5QyxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN2QixZQUFZLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDOUIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNqQixVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQzthQUM3QjtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7YUFBTSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNwQixjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEQsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN2RSxZQUFZLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7U0FDNUM7YUFBTSxJQUNMLEtBQUssQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFNBQVM7WUFDbEMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEVBQzVCO1lBQ0EsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDhEQUE4RCxDQUMvRCxDQUFDO1NBQ0g7YUFBTTtZQUNMLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztTQUM3QjtLQUNGO0lBRUQsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDREQUE0RCxDQUM3RCxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzdCLEtBQWtCLEVBQ2xCLFVBQWtCO0lBRWxCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVoRCxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3ZCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztJQUN0QixLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakIsSUFBSSxVQUFrQixFQUNwQixZQUFZLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLElBQUksR0FBVyxDQUFDO0lBQ2hCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzFELElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdkIsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdkIsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2IsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFFOUMsK0NBQStDO2FBQ2hEO2lCQUFNLElBQUksRUFBRSxHQUFHLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDNUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNsQjtpQkFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDO2dCQUNwQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBRWxCLE9BQU8sU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTtvQkFDakMsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUU5QyxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDaEMsU0FBUyxHQUFHLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztxQkFDcEM7eUJBQU07d0JBQ0wsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7cUJBQzVEO2lCQUNGO2dCQUVELEtBQUssQ0FBQyxNQUFNLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTdDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNsQjtpQkFBTTtnQkFDTCxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUseUJBQXlCLENBQUMsQ0FBQzthQUNyRDtZQUVELFlBQVksR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztTQUM1QzthQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3BCLGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLFlBQVksR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztTQUM1QzthQUFNLElBQ0wsS0FBSyxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsU0FBUztZQUNsQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFDNUI7WUFDQSxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsOERBQThELENBQy9ELENBQUM7U0FDSDthQUFNO1lBQ0wsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1NBQzdCO0tBQ0Y7SUFFRCxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsNERBQTRELENBQzdELENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxLQUFrQixFQUFFLFVBQWtCO0lBQ2hFLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxJQUFJLFVBQWtCLENBQUM7SUFDdkIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLElBQUksTUFBTSxHQUFlLEVBQUUsQ0FBQztJQUM1QixJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ3ZCLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPO1FBQzFCLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNiO1NBQU0sSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUM5QixVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTztLQUMzQjtTQUFNO1FBQ0wsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQ0UsS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxXQUFXO1FBQ2xDLE9BQU8sS0FBSyxDQUFDLFNBQVMsSUFBSSxXQUFXLEVBQ3JDO1FBQ0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQ3hDO0lBRUQsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQ25CLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixJQUFJLFNBQVMsRUFDWCxPQUFPLEVBQ1AsTUFBTSxHQUFrQixDQUFDLE9BQU8sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQ3BELGNBQXVCLEVBQ3ZCLE1BQU0sR0FBRyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNwQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQ2YsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNYLE1BQU0sZUFBZSxHQUF5QixFQUFFLENBQUM7SUFDakQsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ2YsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU3QyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTVDLElBQUksRUFBRSxLQUFLLFVBQVUsRUFBRTtZQUNyQixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDakIsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDaEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDdEIsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ2hELEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLDhDQUE4QyxDQUFDLENBQUM7U0FDMUU7UUFFRCxNQUFNLEdBQUcsT0FBTyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDcEMsTUFBTSxHQUFHLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFFaEMsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV2RCxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakIsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzthQUM5QztTQUNGO1FBRUQsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDbEIsbUVBQW1FO1FBQ25FLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0QsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO1FBQzNCLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFN0MsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEUsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNkLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLG1FQUFtRTtZQUNuRSxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxTQUFTLEVBQUU7WUFDYixnQkFBZ0IsQ0FDZCxLQUFLLEVBQ0wsTUFBTSxFQUNOLGVBQWUsRUFDZixNQUFNLEVBQ04sT0FBTyxFQUNQLFNBQVMsQ0FDVixDQUFDO1NBQ0g7YUFBTSxJQUFJLE1BQU0sRUFBRTtZQUNoQixNQUFvQixDQUFDLElBQUksQ0FDeEIsZ0JBQWdCLENBQ2QsS0FBSyxFQUNMLElBQUksRUFDSixlQUFlLEVBQ2YsTUFBTSxFQUNOLE9BQU8sRUFDUCxTQUFTLENBQ1YsQ0FDRixDQUFDO1NBQ0g7YUFBTTtZQUNKLE1BQXVCLENBQUMsSUFBSSxDQUFDLE9BQXFCLENBQUMsQ0FBQztTQUN0RDtRQUVELG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFN0MsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1QyxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDaEIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDTCxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ2xCO0tBQ0Y7SUFFRCxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsdURBQXVELENBQ3hELENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsS0FBa0IsRUFBRSxVQUFrQjtJQUM3RCxJQUFJLFFBQVEsR0FBRyxhQUFhLEVBQzFCLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLFVBQVUsR0FBRyxVQUFVLEVBQ3ZCLFVBQVUsR0FBRyxDQUFDLEVBQ2QsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUV6QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFaEQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3BCLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDdkIsT0FBTyxHQUFHLEtBQUssQ0FBQztLQUNqQjtTQUFNLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDOUIsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNoQjtTQUFNO1FBQ0wsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBRWxCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNmLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QyxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlDLElBQUksYUFBYSxLQUFLLFFBQVEsRUFBRTtnQkFDOUIsUUFBUSxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQzthQUNqRTtpQkFBTTtnQkFDTCxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsc0NBQXNDLENBQUMsQ0FBQzthQUNsRTtTQUNGO2FBQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO2dCQUNiLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCw4RUFBOEUsQ0FDL0UsQ0FBQzthQUNIO2lCQUFNLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQzFCLFVBQVUsR0FBRyxVQUFVLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDbEMsY0FBYyxHQUFHLElBQUksQ0FBQzthQUN2QjtpQkFBTTtnQkFDTCxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsMkNBQTJDLENBQUMsQ0FBQzthQUN2RTtTQUNGO2FBQU07WUFDTCxNQUFNO1NBQ1A7S0FDRjtJQUVELElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3BCLEdBQUc7WUFDRCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0MsUUFBUSxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFM0IsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN2QixHQUFHO2dCQUNELEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMvQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7U0FDbEM7S0FDRjtJQUVELE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNmLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVyQixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTVDLE9BQ0UsQ0FBQyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUNsRCxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFDdkI7WUFDQSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRTtZQUNwRCxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztTQUMvQjtRQUVELElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2IsVUFBVSxFQUFFLENBQUM7WUFDYixTQUFTO1NBQ1Y7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRTtZQUNqQyx3QkFBd0I7WUFDeEIsSUFBSSxRQUFRLEtBQUssYUFBYSxFQUFFO2dCQUM5QixLQUFLLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQzNCLElBQUksRUFDSixjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FDN0MsQ0FBQzthQUNIO2lCQUFNLElBQUksUUFBUSxLQUFLLGFBQWEsRUFBRTtnQkFDckMsSUFBSSxjQUFjLEVBQUU7b0JBQ2xCLHdDQUF3QztvQkFDeEMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7aUJBQ3RCO2FBQ0Y7WUFFRCw4REFBOEQ7WUFDOUQsTUFBTTtTQUNQO1FBRUQsdURBQXVEO1FBQ3ZELElBQUksT0FBTyxFQUFFO1lBQ1gsbUZBQW1GO1lBQ25GLElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNwQixjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixzREFBc0Q7Z0JBQ3RELEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FDM0IsSUFBSSxFQUNKLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUM3QyxDQUFDO2dCQUVGLDhCQUE4QjthQUMvQjtpQkFBTSxJQUFJLGNBQWMsRUFBRTtnQkFDekIsY0FBYyxHQUFHLEtBQUssQ0FBQztnQkFDdkIsS0FBSyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRXBELG1EQUFtRDthQUNwRDtpQkFBTSxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7Z0JBQzNCLElBQUksY0FBYyxFQUFFO29CQUNsQix5REFBeUQ7b0JBQ3pELEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO2lCQUNyQjtnQkFFRCxxREFBcUQ7YUFDdEQ7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNqRDtZQUVELDZFQUE2RTtTQUM5RTthQUFNO1lBQ0wscURBQXFEO1lBQ3JELEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FDM0IsSUFBSSxFQUNKLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUM3QyxDQUFDO1NBQ0g7UUFFRCxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDdEIsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNmLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFFcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzdCLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQztRQUVELGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDNUQ7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEtBQWtCLEVBQUUsVUFBa0I7SUFDL0QsSUFBSSxJQUFZLEVBQ2QsU0FBaUIsRUFDakIsUUFBUSxHQUFHLEtBQUssRUFDaEIsRUFBVSxDQUFDO0lBQ2IsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFDbkIsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQ3JCLE1BQU0sR0FBYyxFQUFFLENBQUM7SUFFekIsSUFDRSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUk7UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVc7UUFDbkMsT0FBTyxLQUFLLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFDdEM7UUFDQSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7S0FDeEM7SUFFRCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNmLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdkIsTUFBTTtTQUNQO1FBRUQsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN6QixNQUFNO1NBQ1A7UUFFRCxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqQixJQUFJLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksVUFBVSxFQUFFO2dCQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxTQUFTO2FBQ1Y7U0FDRjtRQUVELElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ2xCLG1FQUFtRTtRQUNuRSxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN0RSxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUscUNBQXFDLENBQUMsQ0FBQztTQUNqRTthQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUU7WUFDeEMsTUFBTTtTQUNQO0tBQ0Y7SUFFRCxJQUFJLFFBQVEsRUFBRTtRQUNaLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUN2QixLQUFrQixFQUNsQixVQUFrQixFQUNsQixVQUFrQjtJQUVsQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUNuQixNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDckIsTUFBTSxHQUFHLEVBQUUsRUFDWCxlQUFlLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksU0FBaUIsRUFDbkIsWUFBWSxHQUFHLEtBQUssRUFDcEIsSUFBWSxFQUNaLEdBQVcsRUFDWCxNQUFNLEdBQUcsSUFBSSxFQUNiLE9BQU8sR0FBRyxJQUFJLEVBQ2QsU0FBUyxHQUFHLElBQUksRUFDaEIsYUFBYSxHQUFHLEtBQUssRUFDckIsUUFBUSxHQUFHLEtBQUssRUFDaEIsRUFBVSxDQUFDO0lBRWIsSUFDRSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUk7UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVc7UUFDbkMsT0FBTyxLQUFLLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFDdEM7UUFDQSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7S0FDeEM7SUFFRCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNmLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMseUJBQXlCO1FBQzVDLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBRXJCLEVBQUU7UUFDRix5REFBeUQ7UUFDekQsK0VBQStFO1FBQy9FLEVBQUU7UUFDRixJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDeEUsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDdkIsSUFBSSxhQUFhLEVBQUU7b0JBQ2pCLGdCQUFnQixDQUNkLEtBQUssRUFDTCxNQUFNLEVBQ04sZUFBZSxFQUNmLE1BQWdCLEVBQ2hCLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztvQkFDRixNQUFNLEdBQUcsT0FBTyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUM7aUJBQ3JDO2dCQUVELFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLFlBQVksR0FBRyxJQUFJLENBQUM7YUFDckI7aUJBQU0sSUFBSSxhQUFhLEVBQUU7Z0JBQ3hCLHlEQUF5RDtnQkFDekQsYUFBYSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsWUFBWSxHQUFHLElBQUksQ0FBQzthQUNyQjtpQkFBTTtnQkFDTCxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsbUdBQW1HLENBQ3BHLENBQUM7YUFDSDtZQUVELEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ3BCLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFFZixFQUFFO1lBQ0YscUZBQXFGO1lBQ3JGLEVBQUU7WUFDRixtRUFBbUU7U0FDcEU7YUFBTSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN4RSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUN2QixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU1QyxPQUFPLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDdkIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMvQztnQkFFRCxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUN2QixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRTlDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7d0JBQ2xCLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCx5RkFBeUYsQ0FDMUYsQ0FBQztxQkFDSDtvQkFFRCxJQUFJLGFBQWEsRUFBRTt3QkFDakIsZ0JBQWdCLENBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBQ2YsTUFBZ0IsRUFDaEIsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO3dCQUNGLE1BQU0sR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztxQkFDckM7b0JBRUQsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsYUFBYSxHQUFHLEtBQUssQ0FBQztvQkFDdEIsWUFBWSxHQUFHLEtBQUssQ0FBQztvQkFDckIsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7b0JBQ25CLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2lCQUN4QjtxQkFBTSxJQUFJLFFBQVEsRUFBRTtvQkFDbkIsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDBEQUEwRCxDQUMzRCxDQUFDO2lCQUNIO3FCQUFNO29CQUNMLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO29CQUNoQixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxvQ0FBb0M7aUJBQ2xEO2FBQ0Y7aUJBQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCxnRkFBZ0YsQ0FDakYsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUNoQixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDdEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxvQ0FBb0M7YUFDbEQ7U0FDRjthQUFNO1lBQ0wsTUFBTSxDQUFDLHVDQUF1QztTQUMvQztRQUVELEVBQUU7UUFDRixnRUFBZ0U7UUFDaEUsRUFBRTtRQUNGLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUU7WUFDeEQ7WUFDRSxtRUFBbUU7WUFDbkUsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUNyRTtnQkFDQSxJQUFJLGFBQWEsRUFBRTtvQkFDakIsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7aUJBQ3hCO3FCQUFNO29CQUNMLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2lCQUMxQjthQUNGO1lBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbEIsZ0JBQWdCLENBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBQ2YsTUFBZ0IsRUFDaEIsT0FBTyxFQUNQLFNBQVMsRUFDVCxJQUFJLEVBQ0osR0FBRyxDQUNKLENBQUM7Z0JBQ0YsTUFBTSxHQUFHLE9BQU8sR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ3JDO1lBRUQsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0M7UUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDN0MsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7U0FDaEU7YUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFO1lBQ3hDLE1BQU07U0FDUDtLQUNGO0lBRUQsRUFBRTtJQUNGLFlBQVk7SUFDWixFQUFFO0lBRUYsZ0ZBQWdGO0lBQ2hGLElBQUksYUFBYSxFQUFFO1FBQ2pCLGdCQUFnQixDQUNkLEtBQUssRUFDTCxNQUFNLEVBQ04sZUFBZSxFQUNmLE1BQWdCLEVBQ2hCLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztLQUNIO0lBRUQsZ0NBQWdDO0lBQ2hDLElBQUksUUFBUSxFQUFFO1FBQ1osS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDaEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdEIsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDdkIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7S0FDdkI7SUFFRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsS0FBa0I7SUFDekMsSUFBSSxRQUFnQixFQUNsQixVQUFVLEdBQUcsS0FBSyxFQUNsQixPQUFPLEdBQUcsS0FBSyxFQUNmLFNBQVMsR0FBRyxFQUFFLEVBQ2QsT0FBZSxFQUNmLEVBQVUsQ0FBQztJQUViLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUMsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLEtBQUssQ0FBQztJQUV0QyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ3RCLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0tBQzNEO0lBRUQsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTlDLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDdkIsVUFBVSxHQUFHLElBQUksQ0FBQztRQUNsQixFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0M7U0FBTSxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQzlCLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDZixTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMvQztTQUFNO1FBQ0wsU0FBUyxHQUFHLEdBQUcsQ0FBQztLQUNqQjtJQUVELFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBRTFCLElBQUksVUFBVSxFQUFFO1FBQ2QsR0FBRztZQUNELEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFFMUMsSUFBSSxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDakMsT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDTCxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsb0RBQW9ELENBQ3JELENBQUM7U0FDSDtLQUNGO1NBQU07UUFDTCxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDakMsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDdkIsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDWixTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUVoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUN2QyxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsaURBQWlELENBQ2xELENBQUM7cUJBQ0g7b0JBRUQsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDZixRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7aUJBQy9CO3FCQUFNO29CQUNMLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCw2Q0FBNkMsQ0FDOUMsQ0FBQztpQkFDSDthQUNGO1lBRUQsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEQsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekMsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLHFEQUFxRCxDQUN0RCxDQUFDO1NBQ0g7S0FDRjtJQUVELElBQUksT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM3QyxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsNENBQTRDLE9BQU8sRUFBRSxDQUN0RCxDQUFDO0tBQ0g7SUFFRCxJQUFJLFVBQVUsRUFBRTtRQUNkLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO0tBQ3JCO1NBQU0sSUFDTCxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssV0FBVztRQUNuQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEVBQzdDO1FBQ0EsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztLQUMvQztTQUFNLElBQUksU0FBUyxLQUFLLEdBQUcsRUFBRTtRQUM1QixLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7S0FDM0I7U0FBTSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7UUFDN0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxxQkFBcUIsT0FBTyxFQUFFLENBQUM7S0FDNUM7U0FBTTtRQUNMLE9BQU8sVUFBVSxDQUFDLEtBQUssRUFBRSwwQkFBMEIsU0FBUyxHQUFHLENBQUMsQ0FBQztLQUNsRTtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsS0FBa0I7SUFDNUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFdEMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztLQUMvRDtJQUNELEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU5QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQ2hDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUN6RCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0M7SUFFRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO1FBQy9CLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCw0REFBNEQsQ0FDN0QsQ0FBQztLQUNIO0lBRUQsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLEtBQWtCO0lBQ25DLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVoRCxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRXRDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBRWpDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUN6RCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0M7SUFFRCxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ2hDLE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCwyREFBMkQsQ0FDNUQsQ0FBQztLQUNIO0lBRUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzRCxJQUNFLE9BQU8sS0FBSyxDQUFDLFNBQVMsS0FBSyxXQUFXO1FBQ3RDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQzdEO1FBQ0EsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLHVCQUF1QixLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQzNEO0lBRUQsSUFBSSxPQUFPLEtBQUssQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFO1FBQzFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QztJQUNELG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FDbEIsS0FBa0IsRUFDbEIsWUFBb0IsRUFDcEIsV0FBbUIsRUFDbkIsV0FBb0IsRUFDcEIsWUFBcUI7SUFFckIsSUFBSSxpQkFBMEIsRUFDNUIscUJBQThCLEVBQzlCLFlBQVksR0FBRyxDQUFDLEVBQUUsa0RBQWtEO0lBQ3BFLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLFVBQVUsR0FBRyxLQUFLLEVBQ2xCLElBQVUsRUFDVixVQUFrQixFQUNsQixXQUFtQixDQUFDO0lBRXRCLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtRQUM3QyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMvQjtJQUVELEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRXBCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxxQkFBcUI7UUFDakUsaUJBQWlCLEtBQUssV0FBVyxJQUFJLGdCQUFnQixLQUFLLFdBQVcsQ0FBQyxDQUFDO0lBRXpFLElBQUksV0FBVyxFQUFFO1FBQ2YsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUVqQixJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsWUFBWSxFQUFFO2dCQUNuQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2FBQ2xCO2lCQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxZQUFZLEVBQUU7Z0JBQzVDLFlBQVksR0FBRyxDQUFDLENBQUM7YUFDbEI7aUJBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxHQUFHLFlBQVksRUFBRTtnQkFDMUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7S0FDRjtJQUVELElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtRQUN0QixPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxRCxJQUFJLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDeEMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIscUJBQXFCLEdBQUcsZ0JBQWdCLENBQUM7Z0JBRXpDLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxZQUFZLEVBQUU7b0JBQ25DLFlBQVksR0FBRyxDQUFDLENBQUM7aUJBQ2xCO3FCQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxZQUFZLEVBQUU7b0JBQzVDLFlBQVksR0FBRyxDQUFDLENBQUM7aUJBQ2xCO3FCQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxZQUFZLEVBQUU7b0JBQzFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDbkI7YUFDRjtpQkFBTTtnQkFDTCxxQkFBcUIsR0FBRyxLQUFLLENBQUM7YUFDL0I7U0FDRjtLQUNGO0lBRUQsSUFBSSxxQkFBcUIsRUFBRTtRQUN6QixxQkFBcUIsR0FBRyxTQUFTLElBQUksWUFBWSxDQUFDO0tBQ25EO0lBRUQsSUFBSSxZQUFZLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixLQUFLLFdBQVcsRUFBRTtRQUMzRCxNQUFNLElBQUksR0FDUixlQUFlLEtBQUssV0FBVyxJQUFJLGdCQUFnQixLQUFLLFdBQVcsQ0FBQztRQUN0RSxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFFcEQsV0FBVyxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUUvQyxJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDdEIsSUFDRSxDQUFDLHFCQUFxQjtnQkFDcEIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDO29CQUNwQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELGtCQUFrQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsRUFDckM7Z0JBQ0EsVUFBVSxHQUFHLElBQUksQ0FBQzthQUNuQjtpQkFBTTtnQkFDTCxJQUNFLENBQUMsaUJBQWlCLElBQUksZUFBZSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDekQsc0JBQXNCLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztvQkFDekMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUN6QztvQkFDQSxVQUFVLEdBQUcsSUFBSSxDQUFDO2lCQUNuQjtxQkFBTSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDM0IsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFFbEIsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTt3QkFDL0MsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDJDQUEyQyxDQUM1QyxDQUFDO3FCQUNIO2lCQUNGO3FCQUFNLElBQ0wsZUFBZSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsZUFBZSxLQUFLLFdBQVcsQ0FBQyxFQUNuRTtvQkFDQSxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUVsQixJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFO3dCQUN0QixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztxQkFDakI7aUJBQ0Y7Z0JBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssQ0FBQyxTQUFTLEtBQUssV0FBVyxFQUFFO29CQUNuRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2lCQUM5QzthQUNGO1NBQ0Y7YUFBTSxJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDN0IsMEZBQTBGO1lBQzFGLG1EQUFtRDtZQUNuRCxVQUFVO2dCQUNSLHFCQUFxQixJQUFJLGlCQUFpQixDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNsRTtLQUNGO0lBRUQsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRTtRQUMzQyxJQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFO1lBQ3JCLEtBQ0UsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFDNUQsU0FBUyxHQUFHLFlBQVksRUFDeEIsU0FBUyxFQUFFLEVBQ1g7Z0JBQ0EsSUFBSSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXRDLGtFQUFrRTtnQkFDbEUsbUVBQW1FO2dCQUNuRSx5Q0FBeUM7Z0JBRXpDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzlCLGdEQUFnRDtvQkFDaEQsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDNUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUU7d0JBQ25FLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7cUJBQzlDO29CQUNELE1BQU07aUJBQ1A7YUFDRjtTQUNGO2FBQU0sSUFDTCxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ3hFO1lBQ0EsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JELE9BQU8sVUFBVSxDQUNmLEtBQUssRUFDTCxnQ0FBZ0MsS0FBSyxDQUFDLEdBQUcsd0JBQXdCLElBQUksQ0FBQyxJQUFJLFdBQVcsS0FBSyxDQUFDLElBQUksR0FBRyxDQUNuRyxDQUFDO2FBQ0g7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9CLGdEQUFnRDtnQkFDaEQsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLGdDQUFnQyxLQUFLLENBQUMsR0FBRyxnQkFBZ0IsQ0FDMUQsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFBRTtvQkFDbkUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztpQkFDOUM7YUFDRjtTQUNGO2FBQU07WUFDTCxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3pEO0tBQ0Y7SUFFRCxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7UUFDN0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEM7SUFDRCxPQUFPLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsS0FBa0I7SUFDdEMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUNyQyxJQUFJLFFBQWdCLEVBQ2xCLGFBQXFCLEVBQ3JCLGFBQXVCLEVBQ3ZCLGFBQWEsR0FBRyxLQUFLLEVBQ3JCLEVBQVUsQ0FBQztJQUViLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNyQyxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUVyQixPQUFPLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxRCxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckMsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1QyxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQy9DLE1BQU07U0FDUDtRQUVELGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDckIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBRTFCLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNqQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0M7UUFFRCxhQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1RCxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBRW5CLElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxVQUFVLENBQ2YsS0FBSyxFQUNMLDhEQUE4RCxDQUMvRCxDQUFDO1NBQ0g7UUFFRCxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDZixPQUFPLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDdkIsR0FBRztvQkFDRCxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQy9DLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDakMsTUFBTTthQUNQO1lBRUQsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUFFLE1BQU07WUFFckIsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFFMUIsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNqQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0M7WUFFRCxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksRUFBRSxLQUFLLENBQUM7WUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxFQUFFO1lBQzFELGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxhQUFhLENBQUMsQ0FBQztTQUMxRTthQUFNO1lBQ0wsWUFBWSxDQUFDLEtBQUssRUFBRSwrQkFBK0IsYUFBYSxHQUFHLENBQUMsQ0FBQztTQUN0RTtLQUNGO0lBRUQsbUJBQW1CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJDLElBQ0UsS0FBSyxDQUFDLFVBQVUsS0FBSyxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTztRQUN2RCxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPO1FBQzNELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFDM0Q7UUFDQSxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztRQUNwQixtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEM7U0FBTSxJQUFJLGFBQWEsRUFBRTtRQUN4QixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztLQUM3RDtJQUVELFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pFLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVyQyxJQUNFLEtBQUssQ0FBQyxlQUFlO1FBQ3JCLDZCQUE2QixDQUFDLElBQUksQ0FDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FDakQsRUFDRDtRQUNBLFlBQVksQ0FBQyxLQUFLLEVBQUUsa0RBQWtELENBQUMsQ0FBQztLQUN6RTtJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVuQyxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN0RSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzNELEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1lBQ3BCLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU87S0FDUjtJQUVELElBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyQyxPQUFPLFVBQVUsQ0FDZixLQUFLLEVBQ0wsdURBQXVELENBQ3hELENBQUM7S0FDSDtTQUFNO1FBQ0wsT0FBTztLQUNSO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQWEsRUFBRSxPQUE0QjtJQUNoRSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0lBRXhCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEIsaUNBQWlDO1FBQ2pDLElBQ0UsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRO1lBQ3BELEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxFQUNwRDtZQUNBLEtBQUssSUFBSSxJQUFJLENBQUM7U0FDZjtRQUVELFlBQVk7UUFDWixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQ2xDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO0tBQ0Y7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFOUMsMEVBQTBFO0lBQzFFLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0lBRXBCLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDbEUsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFDdEIsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7S0FDckI7SUFFRCxPQUFPLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDeEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3JCO0lBRUQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBQ3pCLENBQUM7QUFHRCxTQUFTLFlBQVksQ0FBQyxFQUFXO0lBQy9CLE9BQU8sT0FBTyxFQUFFLEtBQUssVUFBVSxDQUFDO0FBQ2xDLENBQUM7QUFFRCxNQUFNLFVBQVUsT0FBTyxDQUNyQixLQUFhLEVBQ2IsZ0JBQW9CLEVBQ3BCLE9BQTRCO0lBRTVCLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNuQyxPQUFPLGFBQWEsQ0FBQyxLQUFLLEVBQUUsZ0JBQXNDLENBQVEsQ0FBQztLQUM1RTtJQUVELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEQsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7SUFDbEMsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN0RSxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDNUI7SUFFRCxPQUFPLEtBQUssQ0FBUSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxNQUFNLFVBQVUsSUFBSSxDQUFDLEtBQWEsRUFBRSxPQUE0QjtJQUM5RCxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWhELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FBTztLQUNSO0lBQ0QsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMxQixPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyQjtJQUNELE1BQU0sSUFBSSxTQUFTLENBQ2pCLDBEQUEwRCxDQUMzRCxDQUFDO0FBQ0osQ0FBQyJ9