// Documentation and interface for walk were adapted from Go
// https://golang.org/pkg/path/filepath/#Walk
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
import { assert } from "../_util/assert.ts";
import { basename, join, normalize } from "../path/mod.ts";
const { readDir, readDirSync, stat, statSync } = Deno;
export function createWalkEntrySync(path) {
    path = normalize(path);
    const name = basename(path);
    const info = statSync(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink,
    };
}
export async function createWalkEntry(path) {
    path = normalize(path);
    const name = basename(path);
    const info = await stat(path);
    return {
        path,
        name,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink,
    };
}
function include(path, exts, match, skip) {
    if (exts && !exts.some((ext) => path.endsWith(ext))) {
        return false;
    }
    if (match && !match.some((pattern) => !!path.match(pattern))) {
        return false;
    }
    if (skip && skip.some((pattern) => !!path.match(pattern))) {
        return false;
    }
    return true;
}
/** Walks the file tree rooted at root, yielding each file or directory in the
 * tree filtered according to the given options. The files are walked in lexical
 * order, which makes the output deterministic but means that for very large
 * directories walk() can be inefficient.
 *
 * Options:
 * - maxDepth?: number = Infinity;
 * - includeFiles?: boolean = true;
 * - includeDirs?: boolean = true;
 * - followSymlinks?: boolean = false;
 * - exts?: string[];
 * - match?: RegExp[];
 * - skip?: RegExp[];
 *
 *      for await (const entry of walk(".")) {
 *        console.log(entry.path);
 *        assert(entry.isFile);
 *      };
 */
export async function* walk(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, followSymlinks = false, exts = undefined, match = undefined, skip = undefined, } = {}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield await createWalkEntry(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    for await (const entry of readDir(root)) {
        if (entry.isSymlink) {
            if (followSymlinks) {
                // TODO(ry) Re-enable followSymlinks.
                throw new Error("unimplemented");
            }
            else {
                continue;
            }
        }
        assert(entry.name != null);
        const path = join(root, entry.name);
        if (entry.isFile) {
            if (includeFiles && include(path, exts, match, skip)) {
                yield { path, ...entry };
            }
        }
        else {
            yield* walk(path, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip,
            });
        }
    }
}
/** Same as walk() but uses synchronous ops */
export function* walkSync(root, { maxDepth = Infinity, includeFiles = true, includeDirs = true, followSymlinks = false, exts = undefined, match = undefined, skip = undefined, } = {}) {
    if (maxDepth < 0) {
        return;
    }
    if (includeDirs && include(root, exts, match, skip)) {
        yield createWalkEntrySync(root);
    }
    if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
        return;
    }
    for (const entry of readDirSync(root)) {
        if (entry.isSymlink) {
            if (followSymlinks) {
                throw new Error("unimplemented");
            }
            else {
                continue;
            }
        }
        assert(entry.name != null);
        const path = join(root, entry.name);
        if (entry.isFile) {
            if (includeFiles && include(path, exts, match, skip)) {
                yield { path, ...entry };
            }
        }
        else {
            yield* walkSync(path, {
                maxDepth: maxDepth - 1,
                includeFiles,
                includeDirs,
                followSymlinks,
                exts,
                match,
                skip,
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZnMvd2Fsay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw0REFBNEQ7QUFDNUQsNkNBQTZDO0FBQzdDLG1FQUFtRTtBQUNuRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0QsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztBQUV0RCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsSUFBWTtJQUM5QyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsT0FBTztRQUNMLElBQUk7UUFDSixJQUFJO1FBQ0osTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1FBQ25CLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztRQUM3QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7S0FDMUIsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLGVBQWUsQ0FBQyxJQUFZO0lBQ2hELElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLE9BQU87UUFDTCxJQUFJO1FBQ0osSUFBSTtRQUNKLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtRQUNuQixXQUFXLEVB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