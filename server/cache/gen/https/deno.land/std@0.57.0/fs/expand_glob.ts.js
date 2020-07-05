import { SEP_PATTERN, globToRegExp, isAbsolute, isGlob, joinGlobs, normalize, } from "../path/mod.ts";
import { createWalkEntry, createWalkEntrySync, walk, walkSync, } from "./walk.ts";
import { assert } from "../_util/assert.ts";
const { cwd } = Deno;
const isWindows = Deno.build.os == "windows";
// TODO: Maybe make this public somewhere.
function split(path) {
    const s = SEP_PATTERN.source;
    const segments = path
        .replace(new RegExp(`^${s}|${s}$`, "g"), "")
        .split(SEP_PATTERN);
    const isAbsolute_ = isAbsolute(path);
    return {
        segments,
        isAbsolute: isAbsolute_,
        hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
        winRoot: isWindows && isAbsolute_ ? segments.shift() : undefined,
    };
}
function throwUnlessNotFound(error) {
    if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
    }
}
function comparePath(a, b) {
    if (a.path < b.path)
        return -1;
    if (a.path > b.path)
        return 1;
    return 0;
}
/**
 * Expand the glob string from the specified `root` directory and yield each
 * result as a `WalkEntry` object.
 */
export async function* expandGlob(glob, { root = cwd(), exclude = [], includeDirs = true, extended = false, globstar = false, } = {}) {
    const globOptions = { extended, globstar };
    const absRoot = isAbsolute(root)
        ? normalize(root)
        : joinGlobs([cwd(), root], globOptions);
    const resolveFromRoot = (path) => isAbsolute(path)
        ? normalize(path)
        : joinGlobs([absRoot, path], globOptions);
    const excludePatterns = exclude
        .map(resolveFromRoot)
        .map((s) => globToRegExp(s, globOptions));
    const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
    const { segments, hasTrailingSep, winRoot } = split(resolveFromRoot(glob));
    let fixedRoot = winRoot != undefined ? winRoot : "/";
    while (segments.length > 0 && !isGlob(segments[0])) {
        const seg = segments.shift();
        assert(seg != null);
        fixedRoot = joinGlobs([fixedRoot, seg], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = await createWalkEntry(fixedRoot);
    }
    catch (error) {
        return throwUnlessNotFound(error);
    }
    async function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        }
        else if (globSegment == "..") {
            const parentPath = joinGlobs([walkInfo.path, ".."], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield await createWalkEntry(parentPath);
                }
            }
            catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        }
        else if (globSegment == "**") {
            return yield* walk(walkInfo.path, {
                includeFiles: false,
                skip: excludePatterns,
            });
        }
        yield* walk(walkInfo.path, {
            maxDepth: 1,
            match: [
                globToRegExp(joinGlobs([walkInfo.path, globSegment], globOptions), globOptions),
            ],
            skip: excludePatterns,
        });
    }
    let currentMatches = [fixedRootInfo];
    for (const segment of segments) {
        // Advancing the list of current matches may introduce duplicates, so we
        // pass everything through this Map.
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches) {
            for await (const nextMatch of advanceMatch(currentMatch, segment)) {
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [...nextMatchMap.values()].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry) => entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
    }
    yield* currentMatches;
}
/** Synchronous version of `expandGlob()`. */
export function* expandGlobSync(glob, { root = cwd(), exclude = [], includeDirs = true, extended = false, globstar = false, } = {}) {
    const globOptions = { extended, globstar };
    const absRoot = isAbsolute(root)
        ? normalize(root)
        : joinGlobs([cwd(), root], globOptions);
    const resolveFromRoot = (path) => isAbsolute(path)
        ? normalize(path)
        : joinGlobs([absRoot, path], globOptions);
    const excludePatterns = exclude
        .map(resolveFromRoot)
        .map((s) => globToRegExp(s, globOptions));
    const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
    const { segments, hasTrailingSep, winRoot } = split(resolveFromRoot(glob));
    let fixedRoot = winRoot != undefined ? winRoot : "/";
    while (segments.length > 0 && !isGlob(segments[0])) {
        const seg = segments.shift();
        assert(seg != null);
        fixedRoot = joinGlobs([fixedRoot, seg], globOptions);
    }
    let fixedRootInfo;
    try {
        fixedRootInfo = createWalkEntrySync(fixedRoot);
    }
    catch (error) {
        return throwUnlessNotFound(error);
    }
    function* advanceMatch(walkInfo, globSegment) {
        if (!walkInfo.isDirectory) {
            return;
        }
        else if (globSegment == "..") {
            const parentPath = joinGlobs([walkInfo.path, ".."], globOptions);
            try {
                if (shouldInclude(parentPath)) {
                    return yield createWalkEntrySync(parentPath);
                }
            }
            catch (error) {
                throwUnlessNotFound(error);
            }
            return;
        }
        else if (globSegment == "**") {
            return yield* walkSync(walkInfo.path, {
                includeFiles: false,
                skip: excludePatterns,
            });
        }
        yield* walkSync(walkInfo.path, {
            maxDepth: 1,
            match: [
                globToRegExp(joinGlobs([walkInfo.path, globSegment], globOptions), globOptions),
            ],
            skip: excludePatterns,
        });
    }
    let currentMatches = [fixedRootInfo];
    for (const segment of segments) {
        // Advancing the list of current matches may introduce duplicates, so we
        // pass everything through this Map.
        const nextMatchMap = new Map();
        for (const currentMatch of currentMatches) {
            for (const nextMatch of advanceMatch(currentMatch, segment)) {
                nextMatchMap.set(nextMatch.path, nextMatch);
            }
        }
        currentMatches = [...nextMatchMap.values()].sort(comparePath);
    }
    if (hasTrailingSep) {
        currentMatches = currentMatches.filter((entry) => entry.isDirectory);
    }
    if (!includeDirs) {
        currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
    }
    yield* currentMatches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kX2dsb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2ZzL2V4cGFuZF9nbG9iLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxXQUFXLEVBQ1gsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsR0FDVixNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFFTCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLElBQUksRUFDSixRQUFRLEdBQ1QsTUFBTSxXQUFXLENBQUM7QUFDbkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFHckIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksU0FBUyxDQUFDO0FBZ0I3QywwQ0FBMEM7QUFDMUMsU0FBUyxLQUFLLENBQUMsSUFBWTtJQUN6QixNQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUk7U0FDbEIsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUMzQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEIsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLE9BQU87UUFDTCxRQUFRO1FBQ1IsVUFBVSxFQUFFLFdBQVc7UUFDdkIsY0FBYyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRCxPQUFPLEVBQUUsU0FBUyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFD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