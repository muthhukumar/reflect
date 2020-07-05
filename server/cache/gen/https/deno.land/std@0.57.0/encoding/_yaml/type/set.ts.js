// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
    if (data === null)
        return true;
    for (const key in data) {
        if (_hasOwnProperty.call(data, key)) {
            if (data[key] !== null)
                return false;
        }
    }
    return true;
}
function constructYamlSet(data) {
    return data !== null ? data : {};
}
export const set = new Type("tag:yaml.org,2002:set", {
    construct: constructYamlSet,
    kind: "mapping",
    resolve: resolveYamlSet,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC90eXBlL3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUdsQyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUV4RCxTQUFTLGNBQWMsQ0FBQyxJQUFTO0lBQy9CLElBQUksSUFBSSxLQUFLLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUUvQixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtRQUN0QixJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUk7Z0JBQUUsT0FBTyxLQUFLLENBQUM7U0FDdEM7S0FDRjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBWTtJQUNwQyxPQUFPLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7SUFDbkQsU0FBUyxFQUFFLGdCQUFnQjtJQUMzQixJQUFJLEVBQUUsU0FBUztJQUNmLE9BQU8sRUFBRSxjQUFjO0NBQ3hCLENBQUMsQ0FBQyJ9