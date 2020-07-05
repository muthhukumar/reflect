export { callbackify } from "./_util/_util_callbackify.ts";
export function isArray(value) {
    return Array.isArray(value);
}
export function isBoolean(value) {
    return typeof value === "boolean" || value instanceof Boolean;
}
export function isNull(value) {
    return value === null;
}
export function isNullOrUndefined(value) {
    return value === null || value === undefined;
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
export function isPrimitive(value) {
    return (value === null || (typeof value !== "object" && typeof value !== "function"));
}
export function validateIntegerRange(value, name, min = -2147483648, max = 2147483647) {
    // The defaults for min and max correspond to the limits of 32-bit integers.
    if (!Number.isInteger(value)) {
        throw new Error(`${name} must be 'an integer' but was ${value}`);
    }
    if (value < min || value > max) {
        throw new Error(`${name} must be >= ${min} && <= ${max}.  Value was ${value}`);
    }
}
import { _TextDecoder, _TextEncoder } from "./_utils.ts";
export const TextDecoder = _TextDecoder;
export const TextEncoder = _TextEncoder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjUzLjAvbm9kZS91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUzRCxNQUFNLFVBQVUsT0FBTyxDQUFDLEtBQWM7SUFDcEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLEtBQWM7SUFDdEMsT0FBTyxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxZQUFZLE9BQU8sQ0FBQztBQUNoRSxDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FBQyxLQUFjO0lBQ25DLE9BQU8sS0FBSyxLQUFLLElBQUksQ0FBQztBQUN4QixDQUFDO0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQWM7SUFDOUMsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDL0MsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUMsS0FBYztJQUNyQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLFlBQVksTUFBTSxDQUFDO0FBQzlELENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQWM7SUFDckMsT0FBTyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxZQUFZLE1BQU0sQ0FBQztBQUM5RCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxLQUFjO0lBQ3JDLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLEtBQWM7SUFDeEMsT0FBTyxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQzdCLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQWM7SUFDckMsT0FBTyxLQUFLLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNyRCxDQUFDO0FBRUQsTUFBTSxVQUFVLE9BQU8sQ0FBQyxDQUFVO0lBQ2hDLE9BQU8sQ0FBQyxZQUFZLEtBQUssQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFBTSxVQUFVLFVBQVUsQ0FBQyxLQUFjO0lBQ3ZDLE9BQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3JDLENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQWM7SUFDckMsT0FBTyxLQUFLLFlBQVksTUFBTSxDQUFDO0FBQ2pDLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLEtBQWM7SUFDeEMsT0FBTyxDQUNMLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDLENBQzdFLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUNsQyxLQUFhLEVBQ2IsSUFBWSxFQUNaLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFDakIsR0FBRyxHQUFHLFVBQVU7SUFFaEIsNEVBQTRFO0lBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLGlDQUFpQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ2xFO0lBQ0QsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUU7UUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FDYixHQUFHLElBQUksZUFBZSxHQUFHLFVBQVUsR0FBRyxnQkFBZ0IsS0FBSyxFQUFFLENBQzlELENBQUM7S0FDSDtBQUNILENBQUM7QUFFRCxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUl6RCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBSXhDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMifQ==