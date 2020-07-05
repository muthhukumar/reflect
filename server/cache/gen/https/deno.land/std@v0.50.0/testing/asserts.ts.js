// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { red, green, white, gray, bold } from "../fmt/colors.ts";
import diff, { DiffType } from "./diff.ts";
const CAN_NOT_DISPLAY = "[Cannot display]";
export class AssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = "AssertionError";
    }
}
function format(v) {
    let string = Deno.inspect(v);
    if (typeof v == "string") {
        string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
    }
    return string;
}
function createColor(diffType) {
    switch (diffType) {
        case DiffType.added:
            return (s) => green(bold(s));
        case DiffType.removed:
            return (s) => red(bold(s));
        default:
            return white;
    }
}
function createSign(diffType) {
    switch (diffType) {
        case DiffType.added:
            return "+   ";
        case DiffType.removed:
            return "-   ";
        default:
            return "    ";
    }
}
function buildMessage(diffResult) {
    const messages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`);
    messages.push("");
    messages.push("");
    diffResult.forEach((result) => {
        const c = createColor(result.type);
        messages.push(c(`${createSign(result.type)}${result.value}`));
    });
    messages.push("");
    return messages;
}
function isKeyedCollection(x) {
    return [Symbol.iterator, "size"].every((k) => k in x);
}
export function equal(c, d) {
    const seen = new Map();
    return (function compare(a, b) {
        // Have to render RegExp & Date for string comparison
        // unless it's mistreated as object
        if (a &&
            b &&
            ((a instanceof RegExp && b instanceof RegExp) ||
                (a instanceof Date && b instanceof Date))) {
            return String(a) === String(b);
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                return false;
            }
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()) {
                    for (const [bKey, bValue] of b.entries()) {
                        /* Given that Map keys can be references, we need
                         * to ensure that they are also deeply equal */
                        if ((aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                            (compare(aKey, bKey) && compare(aValue, bValue))) {
                            unmatchedEntries--;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = { ...a, ...b };
            for (const key in merged) {
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
            }
            seen.set(a, b);
            return true;
        }
        return false;
    })(c, d);
}
/** Make an assertion, if not `true`, then throw. */
export function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` and `expected` are equal, deeply. If not
 * deeply equal, then throw.
 */
export function assertEquals(actual, expected, msg) {
    if (equal(actual, expected)) {
        return;
    }
    let message = "";
    const actualString = format(actual);
    const expectedString = format(expected);
    try {
        const diffResult = diff(actualString.split("\n"), expectedString.split("\n"));
        message = buildMessage(diffResult).join("\n");
    }
    catch (e) {
        message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
    }
    if (msg) {
        message = msg;
    }
    throw new AssertionError(message);
}
/**
 * Make an assertion that `actual` and `expected` are not equal, deeply.
 * If not then throw.
 */
export function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    }
    catch (e) {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    }
    catch (e) {
        expectedString = "[Cannot display]";
    }
    if (!msg) {
        msg = `actual: ${actualString} expected: ${expectedString}`;
    }
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `actual` and `expected` are strictly equal.  If
 * not then throw.
 */
export function assertStrictEq(actual, expected, msg) {
    if (actual !== expected) {
        let actualString;
        let expectedString;
        try {
            actualString = String(actual);
        }
        catch (e) {
            actualString = "[Cannot display]";
        }
        try {
            expectedString = String(expected);
        }
        catch (e) {
            expectedString = "[Cannot display]";
        }
        if (!msg) {
            msg = `actual: ${actualString} expected: ${expectedString}`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that actual contains expected. If not
 * then thrown.
 */
export function assertStrContains(actual, expected, msg) {
    if (!actual.includes(expected)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to contains: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` contains the `expected` values
 * If not then thrown.
 */
export function assertArrayContains(actual, expected, msg) {
    const missing = [];
    for (let i = 0; i < expected.length; i++) {
        let found = false;
        for (let j = 0; j < actual.length; j++) {
            if (equal(expected[i], actual[j])) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(expected[i]);
        }
    }
    if (missing.length === 0) {
        return;
    }
    if (!msg) {
        msg = `actual: "${actual}" expected to contains: "${expected}"`;
        msg += "\n";
        msg += `missing: ${missing}`;
    }
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `actual` match RegExp `expected`. If not
 * then thrown
 */
export function assertMatch(actual, expected, msg) {
    if (!expected.test(actual)) {
        if (!msg) {
            msg = `actual: "${actual}" expected to match: "${expected}"`;
        }
        throw new AssertionError(msg);
    }
}
/**
 * Forcefully throws a failed assertion
 */
export function fail(msg) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
}
/** Executes a function, expecting it to throw.  If it does not, then it
 * throws.  An error class and a string that should be included in the
 * error message can also be asserted.
 */
export function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
    let doesThrow = false;
    let error = null;
    try {
        fn();
    }
    catch (e) {
        if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
            msg = `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        if (msgIncludes && !e.message.includes(msgIncludes)) {
            msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    return error;
}
export async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
    let doesThrow = false;
    let error = null;
    try {
        await fn();
    }
    catch (e) {
        if (ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)) {
            msg = `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        if (msgIncludes && !e.message.includes(msgIncludes)) {
            msg = `Expected error message to include "${msgIncludes}", but got "${e.message}"${msg ? `: ${msg}` : "."}`;
            throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
    }
    return error;
}
/** Use this to stub out methods that will throw when invoked. */
export function unimplemented(msg) {
    throw new AssertionError(msg || "unimplemented");
}
/** Use this to assert unreachable code. */
export function unreachable() {
    throw new AssertionError("unreachable");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFzc2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakUsT0FBTyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQWMsTUFBTSxXQUFXLENBQUM7QUFFdkQsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7QUFPM0MsTUFBTSxPQUFPLGNBQWUsU0FBUSxLQUFLO0lBQ3ZDLFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7Q0FDRjtBQUVELFNBQVMsTUFBTSxDQUFDLENBQVU7SUFDeEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QixJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRTtRQUN4QixNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQ3BEO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLFFBQWtCO0lBQ3JDLFFBQVEsUUFBUSxFQUFFO1FBQ2hCLEtBQUssUUFBUSxDQUFDLEtBQUs7WUFDakIsT0FBTyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLEtBQUssUUFBUSxDQUFDLE9BQU87WUFDbkIsT0FBTyxDQUFDLENBQVMsRUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDO1lBQ0UsT0FBTyxL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