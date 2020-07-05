// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
function resolveYamlNull(data) {
    const max = data.length;
    return ((max === 1 && data === "~") ||
        (max === 4 && (data === "null" || data === "Null" || data === "NULL")));
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return object === null;
}
export const nil = new Type("tag:yaml.org,2002:null", {
    construct: constructYamlNull,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isNull,
    represent: {
        canonical() {
            return "~";
        },
        lowercase() {
            return "null";
        },
        uppercase() {
            return "NULL";
        },
        camelcase() {
            return "Null";
        },
    },
    resolve: resolveYamlNull,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC90eXBlL25pbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxTQUFTLGVBQWUsQ0FBQyxJQUFZO0lBQ25DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFFeEIsT0FBTyxDQUNMLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDO1FBQzNCLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FDdkUsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGlCQUFpQjtJQUN4QixPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFlO0lBQzdCLE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQztBQUN6QixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0lBQ3BELFNBQVMsRUFBRSxpQkFBaUI7SUFDNUIsWUFBWSxFQUFFLFdBQVc7SUFDekIsSUFBSSxFQUFFLFFBQVE7SUFDZCxTQUFTLEVBQUUsTUFBTTtJQUNqQixTQUFTLEVBQUU7UUFDVCxTQUFTO1lBQ1AsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsU0FBUztZQUNQLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxTQUFTO1lBQ1AsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNELFNBQVM7WUFDUCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQ0Y7SUFDRCxPQUFPLEVBQUUsZUFBZTtDQUN6QixDQUFDLENBQUMifQ==