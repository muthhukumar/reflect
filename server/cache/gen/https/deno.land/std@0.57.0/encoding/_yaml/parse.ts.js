// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { load, loadAll } from "./loader/loader.ts";
/**
 * Parses `content` as single YAML document.
 *
 * Returns a JavaScript object or throws `YAMLException` on error.
 * By default, does not support regexps, functions and undefined. This method is safe for untrusted data.
 *
 */
export function parse(content, options) {
    return load(content, options);
}
/**
 * Same as `parse()`, but understands multi-document sources.
 * Applies iterator to each document if specified, or returns array of documents.
 */
export function parseAll(content, iterator, options) {
    return loadAll(content, iterator, options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2VuY29kaW5nL195YW1sL3BhcnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxPQUFPLEVBQWMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBSy9EOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxLQUFLLENBQUMsT0FBZSxFQUFFLE9BQXNCO0lBQzNELE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FDdEIsT0FBZSxFQUNmLFFBQXFCLEVBQ3JCLE9BQXNCO0lBRXRCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDN0MsQ0FBQyJ9