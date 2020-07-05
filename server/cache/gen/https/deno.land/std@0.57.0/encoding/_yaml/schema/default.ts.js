// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { binary, merge, omap, pairs, set, timestamp } from "../type/mod.ts";
import { core } from "./core.ts";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
export const def = new Schema({
    explicit: [binary, omap, pairs, set],
    implicit: [timestamp, merge],
    include: [core],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZW5jb2RpbmcvX3lhbWwvc2NoZW1hL2RlZmF1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVqQyxvREFBb0Q7QUFDcEQsaURBQWlEO0FBQ2pELE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUM1QixRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDcEMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztJQUM1QixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7Q0FDaEIsQ0FBQyxDQUFDIn0=