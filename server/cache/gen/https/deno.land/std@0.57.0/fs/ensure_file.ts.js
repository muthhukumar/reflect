// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import * as path from "../path/mod.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType } from "./_util.ts";
const { lstat, lstatSync, writeFile, writeFileSync } = Deno;
/**
 * Ensures that the file exists.
 * If the file that is requested to be created is in directories that do not
 * exist.
 * these directories are created. If the file already exists,
 * it is NOTMODIFIED.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export async function ensureFile(filePath) {
    try {
        // if file exists
        const stat = await lstat(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    }
    catch (err) {
        // if file not exists
        if (err instanceof Deno.errors.NotFound) {
            // ensure dir exists
            await ensureDir(path.dirname(filePath));
            // create file
            await writeFile(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
/**
 * Ensures that the file exists.
 * If the file that is requested to be created is in directories that do not
 * exist,
 * these directories are created. If the file already exists,
 * it is NOT MODIFIED.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export function ensureFileSync(filePath) {
    try {
        // if file exists
        const stat = lstatSync(filePath);
        if (!stat.isFile) {
            throw new Error(`Ensure path exists, expected 'file', got '${getFileInfoType(stat)}'`);
        }
    }
    catch (err) {
        // if file not exists
        if (err instanceof Deno.errors.NotFound) {
            // ensure dir exists
            ensureDirSync(path.dirname(filePath));
            // create file
            writeFileSync(filePath, new Uint8Array());
            return;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5zdXJlX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2ZzL2Vuc3VyZV9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLEtBQUssSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM3QyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRTVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxRQUFnQjtJQUMvQyxJQUFJO1FBQ0YsaUJBQWlCO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkNBQTZDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUN0RSxDQUFDO1NBQ0g7S0FDRjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1oscUJBQXFCO1FBQ3JCLElBQUksR0FBRyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLG9CQUFvQjtZQUNwQixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDeEMsY0FBYztZQUNkLE1BQU0sU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDNUMsT0FBTztTQUNSO1FBRUQsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxRQUFnQjtJQUM3QyxJQUFJO1FBQ0YsaUJBQWlCO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUNiLDZDQUE2QyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDdEUsQ0FBQztTQUNIO0tBQ0Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLHFCQUFxQjtRQUNyQixJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxvQkFBb0I7WUFDcEIsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0QyxjQUFjO1lBQ2QsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDMUMsT0FBTztTQUNSO1FBQ0QsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUMifQ==