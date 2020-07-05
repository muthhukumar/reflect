// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { bool, float, int, nil } from "../type/mod.ts";
import { failsafe } from "./failsafe.ts";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
export const json = new Schema({
    implicit: [nil, bool, int, float],
    include: [failsafe],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZW5jb2RpbmcvX3lhbWwvc2NoZW1hL2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsK0JBQStCO0FBQy9CLG1EQUFtRDtBQUNuRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDN0IsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO0lBQ2pDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztDQUNwQixDQUFDLENBQUMifQ==