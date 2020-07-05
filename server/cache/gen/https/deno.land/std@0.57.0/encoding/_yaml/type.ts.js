// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const DEFAULT_RESOLVE = () => true;
const DEFAULT_CONSTRUCT = (data) => data;
function checkTagFormat(tag) {
    return tag;
}
export class Type {
    constructor(tag, options) {
        this.kind = null;
        this.resolve = () => true;
        this.construct = (data) => data;
        this.tag = checkTagFormat(tag);
        if (options) {
            this.kind = options.kind;
            this.resolve = options.resolve || DEFAULT_RESOLVE;
            this.construct = options.construct || DEFAULT_CONSTRUCT;
            this.instanceOf = options.instanceOf;
            this.predicate = options.predicate;
            this.represent = options.represent;
            this.defaultStyle = options.defaultStyle;
            this.styleAliases = options.styleAliases;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZW5jb2RpbmcvX3lhbWwvdHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFRMUUsTUFBTSxlQUFlLEdBQUcsR0FBWSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQzVDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFTLEVBQU8sRUFBRSxDQUFDLElBQUksQ0FBQztBQWFuRCxTQUFTLGNBQWMsQ0FBQyxHQUFXO0lBQ2pDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELE1BQU0sT0FBTyxJQUFJO0lBVWYsWUFBWSxHQUFXLEVBQUUsT0FBcUI7UUFSdkMsU0FBSSxHQUFvQixJQUFJLENBQUM7UUFxQjdCLFlBQU8sR0FBNEIsR0FBWSxFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ3ZELGNBQVMsR0FBd0IsQ0FBQyxJQUFJLEVBQU8sRUFBRSxDQUFDLElBQUksQ0FBQztRQWIxRCxJQUFJLENBQUMsR0FBRyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQztZQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDekMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO1NBQzFDO0lBQ0gsQ0FBQztDQUdGIn0=