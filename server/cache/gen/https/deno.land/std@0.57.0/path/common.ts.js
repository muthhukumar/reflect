// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** This module is browser compatible. */
import { SEP } from "./separator.ts";
/** Determines the common path from a set of paths, using an optional separator,
 * which defaults to the OS default separator.
 *
 *       import { common } from "https://deno.land/std/path/mod.ts";
 *       const p = common([
 *         "./deno/std/path/mod.ts",
 *         "./deno/std/fs/mod.ts",
 *       ]);
 *       console.log(p); // "./deno/std/"
 *
 */
export function common(paths, sep = SEP) {
    const [first = "", ...remaining] = paths;
    if (first === "" || remaining.length === 0) {
        return first.substring(0, first.lastIndexOf(sep) + 1);
    }
    const parts = first.split(sep);
    let endOfPrefix = parts.length;
    for (const path of remaining) {
        const compare = path.split(sep);
        for (let i = 0; i < endOfPrefix; i++) {
            if (compare[i] !== parts[i]) {
                endOfPrefix = i;
            }
        }
        if (endOfPrefix === 0) {
            return "";
        }
    }
    const prefix = parts.slice(0, endOfPrefix).join(sep);
    return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9wYXRoL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUseUNBQXlDO0FBRXpDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQzs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLE1BQU0sQ0FBQyxLQUFlLEVBQUUsR0FBRyxHQUFHLEdBQUc7SUFDL0MsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDekMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzFDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2RDtJQUNELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFL0IsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUMvQixLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsRUFBRTtRQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzQixXQUFXLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Y7UUFFRCxJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUU7WUFDckIsT0FBTyxFQUFFLENBQUM7U0FDWDtLQUNGO0lBQ0QsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUMzRCxDQUFDIn0=