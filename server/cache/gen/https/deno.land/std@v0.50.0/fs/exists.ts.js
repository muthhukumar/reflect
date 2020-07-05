// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { lstat, lstatSync } = Deno;
/**
 * Test whether or not the given path exists by checking with the file system
 */
export async function exists(filePath) {
    try {
        await lstat(filePath);
        return true;
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
/**
 * Test whether or not the given path exists by checking with the file system
 */
export function existsSync(filePath) {
    try {
        lstatSync(filePath);
        return true;
    }
    catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXhpc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNsQzs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsTUFBTSxDQUFDLFFBQWdCO0lBQzNDLElBQUk7UUFDRixNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQztLQUNiO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxVQUFVLENBQUMsUUFBZ0I7SUFDekMsSUFBSTtRQUNGLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztLQUNiO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUN2QyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUMifQ==