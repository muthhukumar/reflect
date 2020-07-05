// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { State } from "../state.ts";
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function compileStyleMap(schema, map) {
    if (typeof map === "undefined" || map === null)
        return {};
    let type;
    const result = {};
    const keys = Object.keys(map);
    let tag, style;
    for (let index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map[tag]);
        if (tag.slice(0, 2) === "!!") {
            tag = `tag:yaml.org,2002:${tag.slice(2)}`;
        }
        type = schema.compiledTypeMap.fallback[tag];
        if (type &&
            typeof type.styleAliases !== "undefined" &&
            _hasOwnProperty.call(type.styleAliases, style)) {
            style = type.styleAliases[style];
        }
        result[tag] = style;
    }
    return result;
}
export class DumperState extends State {
    constructor({ schema, indent = 2, noArrayIndent = false, skipInvalid = false, flowLevel = -1, styles = null, sortKeys = false, lineWidth = 80, noRefs = false, noCompatMode = false, condenseFlow = false, }) {
        super(schema);
        this.tag = null;
        this.result = "";
        this.duplicates = [];
        this.usedDuplicates = []; // changed from null to []
        this.indent = Math.max(1, indent);
        this.noArrayIndent = noArrayIndent;
        this.skipInvalid = skipInvalid;
        this.flowLevel = flowLevel;
        this.styleMap = compileStyleMap(this.schema, styles);
        this.sortKeys = sortKeys;
        this.lineWidth = lineWidth;
        this.noRefs = noRefs;
        this.noCompatMode = noCompatMode;
        this.condenseFlow = condenseFlow;
        this.implicitTypes = this.schema.compiledImplicit;
        this.explicitTypes = this.schema.compiledExplicit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcGVyX3N0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC9kdW1wZXIvZHVtcGVyX3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUcxRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXBDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBRXhELFNBQVMsZUFBZSxDQUN0QixNQUFjLEVBQ2QsR0FBc0M7SUFFdEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLElBQUksR0FBRyxLQUFLLElBQUk7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUUxRCxJQUFJLElBQVUsQ0FBQztJQUNmLE1BQU0sTUFBTSxHQUE4QixFQUFFLENBQUM7SUFDN0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixJQUFJLEdBQVcsRUFBRSxLQUFtQixDQUFDO0lBQ3JDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNwRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFpQixDQUFDO1FBQ3pDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzVCLEdBQUcsR0FBRyxxQkFBcUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLElBQ0UsSUFBSTtZQUNKLE9BQU8sSUFBSSxDQUFDLFlBQVksS0FBSyxXQUFXO1lBQ3hDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFDOUM7WUFDQSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7S0FDckI7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBbURELE1BQU0sT0FBTyxXQUFZLFNBQVEsS0FBSztJQW1CcEMsWUFBWSxFQUNWLE1BQU0sRUFDTixNQUFNLEdBQUcsQ0FBQyxFQUNWLGFBQWEsR0FBRyxLQUFLLEVBQ3JCLFdBQVcsR0FBRyxLQUFLLEVBQ25CLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFDZCxNQUFNLEdBQUcsSUFBSSxFQUNiLFFBQVEsR0FBRyxLQUFLLEVBQ2hCLFNBQVMsR0FBRyxFQUFFLEVBQ2QsTUFBTSxHQUFHLEtBQUssRUFDZCxZQUFZLEdBQUcsS0FBSyxFQUNwQixZQUFZLEdBQUcsS0FBSyxHQUNEO1FBQ25CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQXBCVCxRQUFHLEdBQWtCLElBQUksQ0FBQztRQUMxQixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osZUFBVSxHQUFVLEVBQUUsQ0FBQztRQUN2QixtQkFBYyxHQUFVLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtRQWtCM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUVqQyxJQUFJLENBQUMsYUFBYSxHQUFJLElBQUksQ0FBQyxNQUFpQixDQUFDLGdCQUFnQixDQUFDO1FBQzlELElBQUksQ0FBQyxhQUFhLEdBQUksSUFBSSxDQUFDLE1BQWlCLENBQUMsZ0JBQWdCLENBQUM7SUFDaEUsQ0FBQztDQUNGIn0=