// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { join } from "../path/mod.ts";
const { readDir, readDirSync, mkdir, mkdirSync, remove, removeSync } = Deno;
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export async function emptyDir(dir) {
    try {
        const items = [];
        for await (const dirEntry of readDir(dir)) {
            items.push(dirEntry);
        }
        while (items.length) {
            const item = items.shift();
            if (item && item.name) {
                const filepath = join(dir, item.name);
                await remove(filepath, { recursive: true });
            }
        }
    }
    catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        // if not exist. then create it
        await mkdir(dir, { recursive: true });
    }
}
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 */
export function emptyDirSync(dir) {
    try {
        const items = [...readDirSync(dir)];
        // If the directory exists, remove all entries inside it.
        while (items.length) {
            const item = items.shift();
            if (item && item.name) {
                const filepath = join(dir, item.name);
                removeSync(filepath, { recursive: true });
            }
        }
    }
    catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        // if not exist. then create it
        mkdirSync(dir, { recursive: true });
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlfZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9mcy9lbXB0eV9kaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDNUU7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxRQUFRLENBQUMsR0FBVztJQUN4QyxJQUFJO1FBQ0YsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksS0FBSyxFQUFFLE1BQU0sUUFBUSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RCO1FBRUQsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNyQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDN0M7U0FDRjtLQUNGO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQyxNQUFNLEdBQUcsQ0FBQztTQUNYO1FBRUQsK0JBQStCO1FBQy9CLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsR0FBVztJQUN0QyxJQUFJO1FBQ0YsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXBDLHlEQUF5RDtRQUN6RCxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDM0M7U0FDRjtLQUNGO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQyxNQUFNLEdBQUcsQ0FBQztTQUNYO1FBQ0QsK0JBQStCO1FBQy9CLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPO0tBQ1I7QUFDSCxDQUFDIn0=