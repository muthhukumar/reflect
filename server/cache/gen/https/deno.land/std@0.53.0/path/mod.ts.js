// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
import * as _win32 from "./win32.ts";
import * as _posix from "./posix.ts";
const isWindows = Deno.build.os == "windows";
const path = isWindows ? _win32 : _posix;
export const win32 = _win32;
export const posix = _posix;
export const { basename, delimiter, dirname, extname, format, fromFileUrl, isAbsolute, join, normalize, parse, relative, resolve, sep, toNamespacedPath, } = path;
export * from "./common.ts";
export { SEP, SEP_PATTERN } from "./separator.ts";
export * from "./interface.ts";
export * from "./glob.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTMuMC9wYXRoL21vZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQsb0VBQW9FO0FBRXBFLE9BQU8sS0FBSyxNQUFNLE1BQU0sWUFBWSxDQUFDO0FBQ3JDLE9BQU8sS0FBSyxNQUFNLE1BQU0sWUFBWSxDQUFDO0FBRXJDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLFNBQVMsQ0FBQztBQUU3QyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBRXpDLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDNUIsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUM1QixNQUFNLENBQUMsTUFBTSxFQUNYLFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFVBQVUsRUFDVixJQUFJLEVBQ0osU0FBUyxFQUNULEtBQUssRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLEdBQUcsRUFDSCxnQkFBZ0IsR0FDakIsR0FBRyxJQUFJLENBQUM7QUFFVCxjQUFjLGFBQWEsQ0FBQztBQUM1QixPQUFPLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xELGNBQWMsZ0JBQWdCLENBQUM7QUFDL0IsY0FBYyxXQUFXLENBQUMifQ==