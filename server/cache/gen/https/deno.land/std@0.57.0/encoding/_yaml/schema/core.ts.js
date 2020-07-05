// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { json } from "./json.ts";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
export const core = new Schema({
    include: [json],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZW5jb2RpbmcvX3lhbWwvc2NoZW1hL2NvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVqQywrQkFBK0I7QUFDL0IsbURBQW1EO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUM3QixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7Q0FDaEIsQ0FBQyxDQUFDIn0=