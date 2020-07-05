// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/**
 * Write the string to file synchronously.
 *
 * @param filename File to write
 * @param content The content write to file
 * @returns void
 */
export function writeFileStrSync(filename, content) {
    const encoder = new TextEncoder();
    Deno.writeFileSync(filename, encoder.encode(content));
}
/**
 * Write the string to file.
 *
 * @param filename File to write
 * @param content The content write to file
 * @returns Promise<void>
 */
export async function writeFileStr(filename, content) {
    const encoder = new TextEncoder();
    await Deno.writeFile(filename, encoder.encode(content));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfZmlsZV9zdHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2ZzL3dyaXRlX2ZpbGVfc3RyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRTs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxPQUFlO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7SUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFlBQVksQ0FDaEMsUUFBZ0IsRUFDaEIsT0FBZTtJQUVmLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7SUFDbEMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQyJ9