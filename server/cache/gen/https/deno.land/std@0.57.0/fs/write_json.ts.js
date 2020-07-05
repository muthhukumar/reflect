/* Writes an object to a JSON file. */
export async function writeJson(filePath, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
object, options = {}) {
    let contentRaw = "";
    try {
        contentRaw = JSON.stringify(object, options.replacer, options.spaces);
    }
    catch (err) {
        err.message = `${filePath}: ${err.message}`;
        throw err;
    }
    await Deno.writeFile(filePath, new TextEncoder().encode(contentRaw));
}
/* Writes an object to a JSON file. */
export function writeJsonSync(filePath, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
object, options = {}) {
    let contentRaw = "";
    try {
        contentRaw = JSON.stringify(object, options.replacer, options.spaces);
    }
    catch (err) {
        err.message = `${filePath}: ${err.message}`;
        throw err;
    }
    Deno.writeFileSync(filePath, new TextEncoder().encode(contentRaw));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfanNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvZnMvd3JpdGVfanNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxzQ0FBc0M7QUFDdEMsTUFBTSxDQUFDLEtBQUssVUFBVSxTQUFTLENBQzdCLFFBQWdCO0FBQ2hCLDhEQUE4RDtBQUM5RCxNQUFXLEVBQ1gsVUFBNEIsRUFBRTtJQUU5QixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFFcEIsSUFBSTtRQUNGLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUN6QixNQUFNLEVBQ04sT0FBTyxDQUFDLFFBQW9CLEVBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQ2YsQ0FBQztLQUNIO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsUUFBUSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEdBQUcsQ0FBQztLQUNYO0lBRUQsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFFRCxzQ0FBc0M7QUFDdEMsTUFBTSxVQUFVLGFBQWEsQ0FDM0IsUUFBZ0I7QUFDaEIsOERBQThEO0FBQzlELE1BQVcsRUFDWCxVQUE0QixFQUFFO0lBRTlCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUVwQixJQUFJO1FBQ0YsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQ3pCLE1BQU0sRUFDTixPQUFPLENBQUMsUUFBb0IsRUFDNUIsT0FBTyxDQUFDLE1BQU0sQ0FDZixDQUFDO0tBQ0g7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxRQUFRLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVDLE1BQU0sR0FBRyxDQUFDO0tBQ1g7SUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMifQ==