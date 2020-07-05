// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { State } from "../state.ts";
export class LoaderState extends State {
    constructor(input, { filename, schema, onWarning, legacy = false, json = false, listener = null, }) {
        super(schema);
        this.input = input;
        this.documents = [];
        this.lineIndent = 0;
        this.lineStart = 0;
        this.position = 0;
        this.line = 0;
        this.result = "";
        this.filename = filename;
        this.onWarning = onWarning;
        this.legacy = legacy;
        this.json = json;
        this.listener = listener;
        this.implicitTypes = this.schema.compiledImplicit;
        this.typeMap = this.schema.compiledTypeMap;
        this.length = input.length;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyX3N0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC9sb2FkZXIvbG9hZGVyX3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUkxRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBbUJwQyxNQUFNLE9BQU8sV0FBWSxTQUFRLEtBQUs7SUF3QnBDLFlBQ1MsS0FBYSxFQUNwQixFQUNFLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULE1BQU0sR0FBRyxLQUFLLEVBQ2QsSUFBSSxHQUFHLEtBQUssRUFDWixRQUFRLEdBQUcsSUFBSSxHQUNJO1FBRXJCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQVZQLFVBQUssR0FBTCxLQUFLLENBQVE7UUF4QmYsY0FBUyxHQUFVLEVBQUUsQ0FBQztRQUV0QixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDYixTQUFJLEdBQUcsQ0FBQyxDQUFDO1FBZ0JULFdBQU0sR0FBc0IsRUFBRSxDQUFDO1FBY3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLElBQUksQ0FBQyxhQUFhLEdBQUksSUFBSSxDQUFDLE1BQWlCLENBQUMsZ0JBQWdCLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sR0FBSSxJQUFJLENBQUMsTUFBaUIsQ0FBQyxlQUFlLENBQUM7UUFFdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQzdCLENBQUM7Q0FDRiJ9