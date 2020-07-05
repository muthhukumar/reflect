// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
// This was inspired by https://github.com/suryagh/tsscmp which provides a
// timing safe string comparison to avoid timing attacks as described in
// https://codahale.com/a-lesson-in-timing-attacks/.
import { assert, HmacSha256 } from "./deps.ts";
function compareArrayBuffer(a, b) {
    assert(a.byteLength === b.byteLength, "ArrayBuffer lengths must match.");
    const va = new DataView(a);
    const vb = new DataView(b);
    const length = va.byteLength;
    let out = 0;
    let i = -1;
    while (++i < length) {
        out |= va.getUint8(i) ^ vb.getUint8(i);
    }
    return out === 0;
}
/** Compare two strings, Uint8Arrays, ArrayBuffers, or arrays of numbers in a
 * way that avoids timing based attacks on the comparisons on the values.
 *
 * The function will return `true` if the values match, or `false`, if they
 * do not match. */
export function compare(a, b) {
    const key = new Uint8Array(32);
    globalThis.crypto.getRandomValues(key);
    const ah = (new HmacSha256(key)).update(a).arrayBuffer();
    const bh = (new HmacSha256(key)).update(b).arrayBuffer();
    return compareArrayBuffer(ah, bh);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNzQ29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRzc0NvbXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBRXpFLDBFQUEwRTtBQUMxRSx3RUFBd0U7QUFDeEUsb0RBQW9EO0FBRXBELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9DLFNBQVMsa0JBQWtCLENBQUMsQ0FBYyxFQUFFLENBQWM7SUFDeEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLFVBQVUsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7SUFDN0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDWCxPQUFPLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRTtRQUNuQixHQUFHLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7OzttQkFJbUI7QUFDbkIsTUFBTSxVQUFVLE9BQU8sQ0FDckIsQ0FBK0MsRUFDL0MsQ0FBK0M7SUFFL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6RCxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pELE9BQU8sa0JBQWtCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUMifQ==