// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { getFileInfoType } from "./_util.ts";
const { lstat, lstatSync, mkdir, mkdirSync } = Deno;
/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export async function ensureDir(dir) {
    try {
        const fileInfo = await lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            // if dir not exists. then create it.
            await mkdir(dir, { recursive: true });
            return;
        }
        throw err;
    }
}
/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export function ensureDirSync(dir) {
    try {
        const fileInfo = lstatSync(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            // if dir not exists. then create it.
            mkdirSync(dir, { recursive: true });
            return;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5zdXJlX2Rpci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZnMvZW5zdXJlX2Rpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM3QyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRXBEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxHQUFXO0lBQ3pDLElBQUk7UUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUNiLDRDQUE0QyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDekUsQ0FBQztTQUNIO0tBQ0Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLElBQUksR0FBRyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLHFDQUFxQztZQUNyQyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0QyxPQUFPO1NBQ1I7UUFDRCxNQUFNLEdBQUcsQ0FBQztLQUNYO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQVc7SUFDdkMsSUFBSTtRQUNGLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUNiLDRDQUE0QyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDekUsQ0FBQztTQUNIO0tBQ0Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLElBQUksR0FBRyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLHFDQUFxQztZQUNyQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDcEMsT0FBTztTQUNSO1FBQ0QsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUMifQ==