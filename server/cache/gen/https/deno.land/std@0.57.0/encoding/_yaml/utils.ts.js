// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
export function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isBoolean(value) {
    return typeof value === "boolean" || value instanceof Boolean;
}
export function isNull(value) {
    return value === null;
}
export function isNumber(value) {
    return typeof value === "number" || value instanceof Number;
}
export function isString(value) {
    return typeof value === "string" || value instanceof String;
}
export function isSymbol(value) {
    return typeof value === "symbol";
}
export function isUndefined(value) {
    return value === undefined;
}
export function isObject(value) {
    return value !== null && typeof value === "object";
}
export function isError(e) {
    return e instanceof Error;
}
export function isFunction(value) {
    return typeof value === "function";
}
export function isRegExp(value) {
    return value instanceof RegExp;
}
export function toArray(sequence) {
    if (isArray(sequence))
        return sequence;
    if (isNothing(sequence))
        return [];
    return [sequence];
}
export function repeat(str, count) {
    let result = "";
    for (let cycle = 0; cycle < count; cycle++) {
        result += str;
    }
    return result;
}
export function isNegativeZero(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2VuY29kaW5nL195YW1sL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUsxRSxNQUFNLFVBQVUsU0FBUyxDQUFDLE9BQWdCO0lBQ3hDLE9BQU8sT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUM7QUFDNUQsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQUMsS0FBYztJQUNwQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBYztJQUN0QyxPQUFPLE9BQU8sS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLFlBQVksT0FBTyxDQUFDO0FBQ2hFLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQWM7SUFDbkMsT0FBTyxLQUFLLEtBQUssSUFBSSxDQUFDO0FBQ3hCLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQWM7SUFDckMsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxZQUFZLE1BQU0sQ0FBQztBQUM5RCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUFjO0lBQ3JDLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssWUFBWSxNQUFNLENBQUM7QUFDOUQsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUMsS0FBYztJQUNyQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxLQUFjO0lBQ3hDLE9BQU8sS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUM3QixDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUFjO0lBQ3JDLE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7QUFDckQsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBVTtJQUNoQyxPQUFPLENBQUMsWUFBWSxLQUFLLENBQUM7QUFDNUIsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsS0FBYztJQUN2QyxPQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUFjO0lBQ3JDLE9BQU8sS0FBSyxZQUFZLE1BQU0sQ0FBQztBQUNqQyxDQUFDO0FBRUQsTUFBTSxVQUFVLE9BQU8sQ0FBSSxRQUFXO0lBQ3BDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUFFLE9BQU8sUUFBUSxDQUFDO0lBQ3ZDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUFFLE9BQU8sRUFBRSxDQUFDO0lBRW5DLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FBQyxHQUFXLEVBQUUsS0FBYTtJQUMvQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFFaEIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMxQyxNQUFNLElBQUksR0FBRyxDQUFDO0tBQ2Y7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxDQUFTO0lBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2RCxDQUFDIn0=