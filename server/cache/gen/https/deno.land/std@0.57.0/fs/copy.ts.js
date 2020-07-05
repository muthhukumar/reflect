// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import * as path from "../path/mod.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { isSubdir, getFileInfoType } from "./_util.ts";
import { assert } from "../_util/assert.ts";
const isWindows = Deno.build.os === "windows";
async function ensureValidCopy(src, dest, options, isCopyFolder = false) {
    let destStat;
    try {
        destStat = await Deno.lstat(dest);
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (isCopyFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
function ensureValidCopySync(src, dest, options, isCopyFolder = false) {
    let destStat;
    try {
        destStat = Deno.lstatSync(dest);
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return;
        }
        throw err;
    }
    if (isCopyFolder && !destStat.isDirectory) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
    }
    if (!options.overwrite) {
        throw new Error(`'${dest}' already exists.`);
    }
    return destStat;
}
/* copy file to dest */
async function copyFile(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    await Deno.copyFile(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = await Deno.stat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
/* copy file to dest synchronously */
function copyFileSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    Deno.copyFileSync(src, dest);
    if (options.preserveTimestamps) {
        const statInfo = Deno.statSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
/* copy symlink to dest */
async function copySymLink(src, dest, options) {
    await ensureValidCopy(src, dest, options);
    const originSrcFilePath = await Deno.readLink(src);
    const type = getFileInfoType(await Deno.lstat(src));
    if (isWindows) {
        await Deno.symlink(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file",
        });
    }
    else {
        await Deno.symlink(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = await Deno.lstat(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, statInfo.atime, statInfo.mtime);
    }
}
/* copy symlink to dest synchronously */
function copySymlinkSync(src, dest, options) {
    ensureValidCopySync(src, dest, options);
    const originSrcFilePath = Deno.readLinkSync(src);
    const type = getFileInfoType(Deno.lstatSync(src));
    if (isWindows) {
        Deno.symlinkSync(originSrcFilePath, dest, {
            type: type === "dir" ? "dir" : "file",
        });
    }
    else {
        Deno.symlinkSync(originSrcFilePath, dest);
    }
    if (options.preserveTimestamps) {
        const statInfo = Deno.lstatSync(src);
        assert(statInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(statInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, statInfo.atime, statInfo.mtime);
    }
}
/* copy folder from src to dest. */
async function copyDir(src, dest, options) {
    const destStat = await ensureValidCopy(src, dest, options, true);
    if (!destStat) {
        await ensureDir(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = await Deno.stat(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        await Deno.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for await (const entry of Deno.readDir(src)) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, path.basename(srcPath));
        if (entry.isSymlink) {
            await copySymLink(srcPath, destPath, options);
        }
        else if (entry.isDirectory) {
            await copyDir(srcPath, destPath, options);
        }
        else if (entry.isFile) {
            await copyFile(srcPath, destPath, options);
        }
    }
}
/* copy folder from src to dest synchronously */
function copyDirSync(src, dest, options) {
    const destStat = ensureValidCopySync(src, dest, options, true);
    if (!destStat) {
        ensureDirSync(dest);
    }
    if (options.preserveTimestamps) {
        const srcStatInfo = Deno.statSync(src);
        assert(srcStatInfo.atime instanceof Date, `statInfo.atime is unavailable`);
        assert(srcStatInfo.mtime instanceof Date, `statInfo.mtime is unavailable`);
        Deno.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
    }
    for (const entry of Deno.readDirSync(src)) {
        assert(entry.name != null, "file.name must be set");
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, path.basename(srcPath));
        if (entry.isSymlink) {
            copySymlinkSync(srcPath, destPath, options);
        }
        else if (entry.isDirectory) {
            copyDirSync(srcPath, destPath, options);
        }
        else if (entry.isFile) {
            copyFileSync(srcPath, destPath, options);
        }
    }
}
/**
 * Copy a file or directory. The directory can have contents. Like `cp -r`.
 * Requires the `--allow-read` and `--allow-write` flag.
 * @param src the file/directory path.
 *            Note that if `src` is a directory it will copy everything inside
 *            of this directory, not the entire directory itself
 * @param dest the destination path. Note that if `src` is a file, `dest` cannot
 *             be a directory
 * @param options
 */
export async function copy(src, dest, options = {}) {
    src = path.resolve(src);
    dest = path.resolve(dest);
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = await Deno.lstat(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        await copySymLink(src, dest, options);
    }
    else if (srcStat.isDirectory) {
        await copyDir(src, dest, options);
    }
    else if (srcStat.isFile) {
        await copyFile(src, dest, options);
    }
}
/**
 * Copy a file or directory. The directory can have contents. Like `cp -r`.
 * Requires the `--allow-read` and `--allow-write` flag.
 * @param src the file/directory path.
 *            Note that if `src` is a directory it will copy everything inside
 *            of this directory, not the entire directory itself
 * @param dest the destination path. Note that if `src` is a file, `dest` cannot
 *             be a directory
 * @param options
 */
export function copySync(src, dest, options = {}) {
    src = path.resolve(src);
    dest = path.resolve(dest);
    if (src === dest) {
        throw new Error("Source and destination cannot be the same.");
    }
    const srcStat = Deno.lstatSync(src);
    if (srcStat.isDirectory && isSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
    }
    if (srcStat.isSymlink) {
        copySymlinkSync(src, dest, options);
    }
    else if (srcStat.isDirectory) {
        copyDirSync(src, dest, options);
    }
    else if (srcStat.isFile) {
        copyFileSync(src, dest, options);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZnMvY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsT0FBTyxLQUFLLElBQUksTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUU1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxTQUFTLENBQUM7QUFnQjlDLEtBQUssVUFBVSxlQUFlLENBQzVCLEdBQVcsRUFDWCxJQUFZLEVBQ1osT0FBb0IsRUFDcEIsWUFBWSxHQUFHLEtBQUs7SUFFcEIsSUFBSSxRQUF1QixDQUFDO0lBRTVCLElBQUk7UUFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPO1NBQ1I7UUFDRCxNQUFNLEdBQUcsQ0FBQztLQUNYO0lBRUQsSUFBSSxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQ2IsbUNBQW1DLElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUNwRSxDQUFDO0tBQ0g7SUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FB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