// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
/** This module is browser compatible. */
import { isWindows } from "./_constants.ts";
import * as _win32 from "./win32.ts";
import * as _posix from "./posix.ts";
const path = isWindows ? _win32 : _posix;
export const win32 = _win32;
export const posix = _posix;
export const { basename, delimiter, dirname, extname, format, fromFileUrl, isAbsolute, join, normalize, parse, relative, resolve, sep, toNamespacedPath, } = path;
export * from "./common.ts";
export { SEP, SEP_PATTERN } from "./separator.ts";
export * from "./_interface.ts";
export * from "./glob.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9wYXRoL21vZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQsb0VBQW9FO0FBQ3BFLHlDQUF5QztBQUV6QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxLQUFLLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFDckMsT0FBTyxLQUFLLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFFckMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUV6QyxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQzVCLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDNUIsTUFBTSxDQUFDLE1BQU0sRUFDWCxRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sRUFDUCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFdBQVcsRUFDWCxVQUFVLEVBQ1YsSUFBSSxFQUNKLFNBQVMsRUFDVCxLQUFLLEVBQ0wsUUFBUSxFQUNSLE9BQU8sRUFDUCxHQUFHLEVBQ0gsZ0JBQWdCLEdBQ2pCLEdBQUcsSUFBSSxDQUFDO0FBRVQsY0FBYyxhQUFhLENBQUM7QUFDNUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxjQUFjLGlCQUFpQixDQUFDO0FBQ2hDLGNBQWMsV0FBVyxDQUFDIn0=