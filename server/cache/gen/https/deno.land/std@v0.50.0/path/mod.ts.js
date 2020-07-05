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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCxvRUFBb0U7QUFFcEUsT0FBTyxLQUFLLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFDckMsT0FBTyxLQUFLLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFFckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksU0FBUyxDQUFDO0FBRTdDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFFekMsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUM1QixNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQzVCLE1BQU0sQ0FBQyxNQUFNLEVBQ1gsUUFBUSxFQUNSLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE1BQU0sRUFDTixXQUFXLEVBQ1gsVUFBVSxFQUNWLElBQUksRUFDSixTQUFTLEVBQ1QsS0FBSyxFQUNMLFFBQVEsRUFDUixPQUFPLEVBQ1AsR0FBRyxFQUNILGdCQUFnQixHQUNqQixHQUFHLElBQUksQ0FBQztBQUVULGNBQWMsYUFBYSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEQsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLFdBQVcsQ0FBQyJ9