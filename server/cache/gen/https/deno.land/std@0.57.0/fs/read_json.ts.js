// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** Reads a JSON file and then parses it into an object */
export async function readJson(filePath) {
    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(await Deno.readFile(filePath));
    try {
        return JSON.parse(content);
    }
    catch (err) {
        err.message = `${filePath}: ${err.message}`;
        throw err;
    }
}
/** Reads a JSON file and then parses it into an object */
export function readJsonSync(filePath) {
    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(Deno.readFileSync(filePath));
    try {
        return JSON.parse(content);
    }
    catch (err) {
        err.message = `${filePath}: ${err.message}`;
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZF9qc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9mcy9yZWFkX2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLDBEQUEwRDtBQUMxRCxNQUFNLENBQUMsS0FBSyxVQUFVLFFBQVEsQ0FBQyxRQUFnQjtJQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV6QyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRTlELElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUI7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxRQUFRLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVDLE1BQU0sR0FBRyxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sVUFBVSxZQUFZLENBQUMsUUFBZ0I7SUFDM0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFekMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFNUQsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1QjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLFFBQVEsS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUMsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUMifQ==