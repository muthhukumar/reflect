import * as path from "../path/mod.ts";
/**
 * Test whether or not `dest` is a sub-directory of `src`
 * @param src src file path
 * @param dest dest file path
 * @param sep path separator
 */
export function isSubdir(src, dest, sep = path.sep) {
    if (src === dest) {
        return false;
    }
    const srcArray = src.split(sep);
    const destArray = dest.split(sep);
    return srcArray.every((current, i) => destArray[i] === current);
}
/**
 * Get a human readable file type string.
 *
 * @param fileInfo A FileInfo describes a file and is returned by `stat`,
 *                 `lstat`
 */
export function getFileInfoType(fileInfo) {
    return fileInfo.isFile
        ? "file"
        : fileInfo.isDirectory
            ? "dir"
            : fileInfo.isSymlink
                ? "symlink"
                : undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2ZzL191dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxJQUFJLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsUUFBUSxDQUN0QixHQUFXLEVBQ1gsSUFBWSxFQUNaLE1BQWMsSUFBSSxDQUFDLEdBQUc7SUFFdEIsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEMsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFJRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsUUFBdUI7SUFDckQsT0FBTyxRQUFRLENBQUMsTUFBTTtRQUNwQixDQUFDLENBQUMsTUFBTTtRQUNSLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVztZQUN0QixDQUFDLENBQUMsS0FBSztZQUNQLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUztnQkFDcEIsQ0FBQyxDQUFDLFNBQVM7Z0JBQ1gsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNoQixDQUFDIn0=