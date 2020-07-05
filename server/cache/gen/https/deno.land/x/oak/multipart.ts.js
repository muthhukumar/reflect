// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { BufReader } from "./buf_reader.ts";
import { getFilename } from "./content_disposition.ts";
import { equal, extension } from "./deps.ts";
import { readHeaders, toParamRegExp, unquote } from "./headers.ts";
import { httpErrors } from "./httpError.ts";
import { getRandomFilename, skipLWSPChar, stripEol } from "./util.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const BOUNDARY_PARAM_REGEX = toParamRegExp("boundary", "i");
const DEFAULT_BUFFER_SIZE = 1048576; // 1mb
const DEFAULT_MAX_FILE_SIZE = 10485760; // 10mb
const DEFAULT_MAX_SIZE = 0; // all files written to disc
const NAME_PARAM_REGEX = toParamRegExp("name", "i");
function append(a, b) {
    const ab = new Uint8Array(a.length + b.length);
    ab.set(a, 0);
    ab.set(b, a.length);
    return ab;
}
function isEqual(a, b) {
    return equal(skipLWSPChar(a), b);
}
async function readToStartOrEnd(body, start, end) {
    let lineResult;
    while ((lineResult = await body.readLine())) {
        if (isEqual(lineResult.bytes, start)) {
            return true;
        }
        if (isEqual(lineResult.bytes, end)) {
            return false;
        }
    }
    throw new httpErrors.BadRequest("Unable to find multi-part boundary.");
}
/** Yield up individual parts by reading the body and parsing out the ford
 * data values. */
async function* parts({ body, final, part, maxFileSize, maxSize, outPath, prefix }) {
    async function getFile(contentType) {
        const ext = extension(contentType);
        if (!ext) {
            throw new httpErrors.BadRequest(`Invalid media type for part: ${ext}`);
        }
        if (!outPath) {
            outPath = await Deno.makeTempDir();
        }
        const filename = `${outPath}/${getRandomFilename(prefix, ext)}`;
        const file = await Deno.open(filename, { write: true, createNew: true });
        return [filename, file];
    }
    while (true) {
        const headers = await readHeaders(body);
        const contentType = headers.get("content-type");
        const contentDisposition = headers.get("content-disposition");
        if (!contentDisposition) {
            throw new httpErrors.BadRequest("Form data part missing content-disposition header");
        }
        if (!contentDisposition.match(/^form-data;/i)) {
            throw new httpErrors.BadRequest(`Unexpected content-disposition header: "${contentDisposition}"`);
        }
        const matches = NAME_PARAM_REGEX.exec(contentDisposition);
        if (!matches) {
            throw new httpErrors.BadRequest(`Unable to determine name of form body part`);
        }
        let [, name] = matches;
        name = unquote(name);
        if (contentType) {
            const originalName = getFilename(contentDisposition);
            let byteLength = 0;
            let file;
            let filename;
            let buf;
            if (maxSize) {
                buf = new Uint8Array();
            }
            else {
                const result = await getFile(contentType);
                filename = result[0];
                file = result[1];
            }
            while (true) {
                const readResult = await body.readLine(false);
                if (!readResult) {
                    throw new httpErrors.BadRequest("Unexpected EOF reached");
                }
                let { bytes } = readResult;
                const strippedBytes = stripEol(bytes);
                if (isEqual(strippedBytes, part) || isEqual(strippedBytes, final)) {
                    if (file) {
                        file.close();
                    }
                    yield [
                        name,
                        {
                            content: buf,
                            contentType,
                            name,
                            filename,
                            originalName,
                        },
                    ];
                    if (isEqual(strippedBytes, final)) {
                        return;
                    }
                    break;
                }
                byteLength += bytes.byteLength;
                if (byteLength > maxFileSize) {
                    if (file) {
                        file.close();
                    }
                    throw new httpErrors.RequestEntityTooLarge(`File size exceeds limit of ${maxFileSize} bytes.`);
                }
                if (buf) {
                    if (byteLength > maxSize) {
                        const result = await getFile(contentType);
                        filename = result[0];
                        file = result[1];
                        await Deno.writeAll(file, buf);
                        buf = undefined;
                    }
                    else {
                        buf = append(buf, bytes);
                    }
                }
                if (file) {
                    await Deno.writeAll(file, bytes);
                }
            }
        }
        else {
            const lines = [];
            while (true) {
                const readResult = await body.readLine();
                if (!readResult) {
                    throw new httpErrors.BadRequest("Unexpected EOF reached");
                }
                const { bytes } = readResult;
                if (isEqual(bytes, part) || isEqual(bytes, final)) {
                    yield [name, lines.join("\n")];
                    if (isEqual(bytes, final)) {
                        return;
                    }
                    break;
                }
                lines.push(decoder.decode(bytes));
            }
        }
    }
}
/** A class which provides an interface to access the fields of a
 * `multipart/form-data` body. */
export class FormDataReader {
    constructor(contentType, body) {
        this.#reading = false;
        const matches = contentType.match(BOUNDARY_PARAM_REGEX);
        if (!matches) {
            throw new httpErrors.BadRequest(`Content type "${contentType}" does not contain a valid boundary.`);
        }
        let [, boundary] = matches;
        boundary = unquote(boundary);
        this.#boundaryPart = encoder.encode(`--${boundary}`);
        this.#boundaryFinal = encoder.encode(`--${boundary}--`);
        this.#body = body;
    }
    #body;
    #boundaryFinal;
    #boundaryPart;
    #reading;
    /** Reads the multipart body of the response and resolves with an object which
     * contains fields and files that were part of the response.
     *
     * *Note*: this method handles multiple files with the same `name` attribute
     * in the request, but by design it does not handle multiple fields that share
     * the same `name`.  If you expect the request body to contain multiple form
     * data fields with the same name, it is better to use the `.stream()` method
     * which will iterate over each form data field individually. */
    async read(options = {}) {
        if (this.#reading) {
            throw new Error("Body is already being read.");
        }
        this.#reading = true;
        const { outPath, maxFileSize = DEFAULT_MAX_FILE_SIZE, maxSize = DEFAULT_MAX_SIZE, bufferSize = DEFAULT_BUFFER_SIZE, } = options;
        const body = new BufReader(this.#body, bufferSize);
        const result = { fields: {} };
        if (!(await readToStartOrEnd(body, this.#boundaryPart, this.#boundaryFinal))) {
            return result;
        }
        try {
            for await (const part of parts({
                body,
                part: this.#boundaryPart,
                final: this.#boundaryFinal,
                maxFileSize,
                maxSize,
                outPath,
            })) {
                const [key, value] = part;
                if (typeof value === "string") {
                    result.fields[key] = value;
                }
                else {
                    if (!result.files) {
                        result.files = [];
                    }
                    result.files.push(value);
                }
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.PermissionDenied) {
                console.error(err.stack ? err.stack : `${err.name}: ${err.message}`);
            }
            else {
                throw err;
            }
        }
        return result;
    }
    /** Returns an iterator which will asynchronously yield each part of the form
     * data.  The yielded value is a tuple, where the first element is the name
     * of the part and the second element is a `string` or a `FormDataFile`
     * object. */
    async *stream(options = {}) {
        if (this.#reading) {
            throw new Error("Body is already being read.");
        }
        this.#reading = true;
        const { outPath, maxFileSize = DEFAULT_MAX_FILE_SIZE, maxSize = DEFAULT_MAX_SIZE, bufferSize = 32000, } = options;
        const body = new BufReader(this.#body, bufferSize);
        if (!(await readToStartOrEnd(body, this.#boundaryPart, this.#boundaryFinal))) {
            return;
        }
        try {
            for await (const part of parts({
                body,
                part: this.#boundaryPart,
                final: this.#boundaryFinal,
                maxFileSize,
                maxSize,
                outPath,
            })) {
                yield part;
            }
        }
        catch (err) {
            if (err instanceof Deno.errors.PermissionDenied) {
                console.error(err.stack ? err.stack : `${err.name}: ${err.message}`);
            }
            else {
                throw err;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlwYXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibXVsdGlwYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHlFQUF5RTtBQUV6RSxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDbkUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXRFLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7QUFDbEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUVsQyxNQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxNQUFNO0FBQzNDLE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLENBQUMsT0FBTztBQUMvQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtBQUN4RCxNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7QUE0RXBELFNBQVMsTUFBTSxDQUFDLENBQWEsRUFBRSxDQUFhO0lBQzFDLE1BQU0sRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFF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