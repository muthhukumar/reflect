// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** Find first index of binary pattern from a. If not found, then return -1
 * @param source source array
 * @param pat pattern to find in source array
 */
export function findIndex(source, pat) {
    const s = pat[0];
    for (let i = 0; i < source.length; i++) {
        if (source[i] !== s)
            continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
            j++;
            if (source[j] !== pat[j - pin]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin;
        }
    }
    return -1;
}
/** Find last index of binary pattern from a. If not found, then return -1.
 * @param source source array
 * @param pat pattern to find in source array
 */
export function findLastIndex(source, pat) {
    const e = pat[pat.length - 1];
    for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] !== e)
            continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
            j--;
            if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin - pat.length + 1;
        }
    }
    return -1;
}
/** Check whether binary arrays are equal to each other.
 * @param source first array to check equality
 * @param match second array to check equality
 */
export function equal(source, match) {
    if (source.length !== match.length)
        return false;
    for (let i = 0; i < match.length; i++) {
        if (source[i] !== match[i])
            return false;
    }
    return true;
}
/** Check whether binary array starts with prefix.
 * @param source srouce array
 * @param prefix prefix array to check in source
 */
export function hasPrefix(source, prefix) {
    for (let i = 0, max = prefix.length; i < max; i++) {
        if (source[i] !== prefix[i])
            return false;
    }
    return true;
}
/** Check whether binary array ends with suffix.
 * @param source source array
 * @param suffix suffix array to check in source
 */
export function hasSuffix(source, suffix) {
    for (let srci = source.length - 1, sfxi = suffix.length - 1; sfxi >= 0; srci--, sfxi--) {
        if (source[srci] !== suffix[sfxi])
            return false;
    }
    return true;
}
/** Repeat bytes. returns a new byte slice consisting of `count` copies of `b`.
 * @param origin The origin bytes
 * @param count The count you want to repeat.
 */
export function repeat(origin, count) {
    if (count === 0) {
        return new Uint8Array();
    }
    if (count < 0) {
        throw new Error("bytes: negative repeat count");
    }
    else if ((origin.length * count) / count !== origin.length) {
        throw new Error("bytes: repeat count causes overflow");
    }
    const int = Math.floor(count);
    if (int !== count) {
        throw new Error("bytes: repeat count must be an integer");
    }
    const nb = new Uint8Array(origin.length * count);
    let bp = copyBytes(origin, nb);
    for (; bp < nb.length; bp *= 2) {
        copyBytes(nb.slice(0, bp), nb, bp);
    }
    return nb;
}
/** Concatenate two binary arrays and return new one.
 * @param origin origin array to concatenate
 * @param b array to concatenate with origin
 */
export function concat(origin, b) {
    const output = new Uint8Array(origin.length + b.length);
    output.set(origin, 0);
    output.set(b, origin.length);
    return output;
}
/** Check source array contains pattern array.
 * @param source source array
 * @param pat patter array
 */
export function contains(source, pat) {
    return findIndex(source, pat) != -1;
}
/**
 * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
 * into `dst` will not be copied.
 *
 * @param src Source byte array
 * @param dst Destination byte array
 * @param off Offset into `dst` at which to begin writing values from `src`.
 * @return number of bytes copied
 */
export function copyBytes(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRTs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLE1BQWtCLEVBQUUsR0FBZTtJQUMzRCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFFLFNBQVM7UUFDOUIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE9BQU8sT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDM0IsQ0FBQyxFQUFFLENBQUM7WUFDSixJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixNQUFNO2FBQ1A7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsSUFBSSxPQUFPLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUMxQixPQUFPLEdBQUcsQ0FBQztTQUNaO0tBQ0Y7SUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ1osQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBa0IsRUFBRSxHQUFlO0lBQy9ELE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxD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