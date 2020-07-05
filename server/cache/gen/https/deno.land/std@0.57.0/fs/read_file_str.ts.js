// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/**
 * Read file synchronously and output it as a string.
 *
 * @param filename File to read
 * @param opts Read options
 */
export function readFileStrSync(filename, opts = {}) {
    const decoder = new TextDecoder(opts.encoding);
    return decoder.decode(Deno.readFileSync(filename));
}
/**
 * Read file and output it as a string.
 *
 * @param filename File to read
 * @param opts Read options
 */
export async function readFileStr(filename, opts = {}) {
    const decoder = new TextDecoder(opts.encoding);
    return decoder.decode(await Deno.readFile(filename));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZF9maWxlX3N0ci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZnMvcmVhZF9maWxlX3N0ci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFNMUU7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUM3QixRQUFnQixFQUNoQixPQUFvQixFQUFFO0lBRXRCLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVyxDQUMvQixRQUFnQixFQUNoQixPQUFvQixFQUFFO0lBRXRCLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDdkQsQ0FBQyJ9