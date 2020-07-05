// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
// provide better logging, see src/log.ts
export * as log from "https://deno.land/std@0.57.0/log/mod.ts";
export { LogRecord } from "https://deno.land/std@0.57.0/log/logger.ts";
export { LogLevels, } from "https://deno.land/std@0.57.0/log/levels.ts";
export { BaseHandler } from "https://deno.land/std@0.57.0/log/handlers.ts";
// colors for a pretty cli
export { setColorEnabled, reset, bold, blue, yellow, red, gray, } from "https://deno.land/std@0.57.0/fmt/colors.ts";
// configuration reading
export { exists, existsSync, readFileStr, walk, } from "https://deno.land/std@0.57.0/fs/mod.ts";
// configuration parsing (YAML)
export { JSON_SCHEMA, parse as parseYaml, } from "https://deno.land/std@0.57.0/encoding/yaml.ts";
// file watching and directory matching
export { relative, dirname, extname, resolve, globToRegExp, } from "https://deno.land/std@0.57.0/path/mod.ts";
// configuration parsing and writing (JSON)
export { readJson } from "https://deno.land/std@0.57.0/fs/read_json.ts";
export { writeJson } from "https://deno.land/std@0.57.0/fs/write_json.ts";
// event control
export { deferred, delay } from "https://deno.land/std@0.57.0/async/mod.ts";
// permission management
export { grant } from "https://deno.land/std@0.57.0/permissions/mod.ts";
// autocomplete
export * as omelette from "https://deno.land/x/omelette/omelette.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub25AdjIuMi4wL2RlcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0VBQStFO0FBRS9FLHlDQUF5QztBQUN6QyxPQUFPLEtBQUssR0FBRyxNQUFNLHlDQUF5QyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsU0FBUyxHQUVWLE1BQU0sNENBQTRDLENBQUM7QUFDcEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBRTNFLDBCQUEwQjtBQUMxQixPQUFPLEVBQ0wsZUFBZSxFQUNmLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxFQUNKLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxHQUNMLE1BQU0sNENBQTRDLENBQUM7QUFFcEQsd0JBQXdCO0FBQ3hCLE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFdBQVcsRUFDWCxJQUFJLEdBQ0wsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRCwrQkFBK0I7QUFDL0IsT0FBTyxFQUNMLFdBQVcsRUFDWCxLQUFLLElBQUksU0FBUyxHQUNuQixNQUFNLCtDQUErQyxDQUFDO0FBRXZELHVDQUF1QztBQUN2QyxPQUFPLEVBQ0wsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFlBQVksR0FDYixNQUFNLDBDQUEwQyxDQUFDO0FBRWxELDJDQUEyQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDeEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBRTFFLGdCQUFnQjtBQUNoQixPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRTVFLHdCQUF3QjtBQUN4QixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saURBQWlELENBQUM7QUFFeEUsZUFBZTtBQUNmLE9BQU8sS0FBSyxRQUFRLE1BQU0sMENBQTBDLENBQUMifQ==