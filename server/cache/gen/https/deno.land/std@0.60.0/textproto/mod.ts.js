// Based on https://github.com/golang/go/tree/master/src/net/textproto
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { concat } from "../bytes/mod.ts";
import { decode } from "../encoding/utf8.ts";
// FROM https://github.com/denoland/deno/blob/b34628a26ab0187a827aa4ebe256e23178e25d39/cli/js/web/headers.ts#L9
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str(buf) {
    if (buf == null) {
        return "";
    }
    else {
        return decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
export class TextProtoReader {
    constructor(r) {
        this.r = r;
    }
    /** readLine() reads a single line from the TextProtoReader,
     * eliding the final \n or \r\n from the returned string.
     */
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null)
            return null;
        return str(s);
    }
    /** ReadMIMEHeader reads a MIME-style header from r.
     * The header is a sequence of possibly continued Key: Value lines
     * ending in a blank line.
     * The returned map m maps CanonicalMIMEHeaderKey(key) to a
     * sequence of values in the same order encountered in the input.
     *
     * For example, consider this input:
     *
     *	My-Key: Value 1
     *	Long-Key: Even
     *	       Longer Value
     *	My-Key: Value 2
     *
     * Given that input, ReadMIMEHeader returns the map:
     *
     *	map[string][]string{
     *		"My-Key": {"Value 1", "Value 2"},
     *		"Long-Key": {"Even Longer Value"},
     *	}
     */
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        // The first line cannot start with a leading space.
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        }
        else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = (await this.readLineSlice());
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        }
        else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
        }
        while (true) {
            const kv = await this.readLineSlice(); // readContinuedLineSlice
            if (kv === null)
                throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0)
                return m;
            // Key ends at first colon
            let i = kv.indexOf(charCode(":"));
            if (i < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
            }
            //let key = canonicalMIMEHeaderKey(kv.subarray(0, endKey));
            const key = str(kv.subarray(0, i));
            // As per RFC 7230 field-name is a token,
            // tokens consist of one or more chars.
            // We could throw `Deno.errors.InvalidData` here,
            // but better to be liberal in what we
            // accept, so if we get an empty key, skip it.
            if (key == "") {
                continue;
            }
            // Skip initial spaces in value.
            i++; // skip colon
            while (i < kv.byteLength &&
                (kv[i] == charCode(" ") || kv[i] == charCode("\t"))) {
                i++;
            }
            const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
            // In case of invalid header we swallow the error
            // example: "Audio Mode" => invalid due to space in the key
            try {
                m.append(key, value);
            }
            catch {
                // Pass
            }
        }
    }
    async readLineSlice() {
        // this.closeDot();
        let line;
        while (true) {
            const r = await this.r.readLine();
            if (r === null)
                return null;
            const { line: l, more } = r;
            // Avoid the copy if the first call produced a full line.
            if (!line && !more) {
                // TODO(ry):
                // This skipSpace() is definitely misplaced, but I don't know where it
                // comes from nor how to fix it.
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for (let i = 0; i < l.length; i++) {
            if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHNFQUFzRTtBQUN0RSxzREFBc0Q7QUFDdEQscURBQXFEO0FBQ3JELGlEQUFpRDtBQUdqRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTdDLCtHQUErRztBQUMvRyxNQUFNLHNCQUFzQixHQUFHLDBCQUEwQixDQUFDO0FBRTFELFNBQVMsR0FBRyxDQUFDLEdBQWtDO0lBQzdDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtRQUNmLE9BQU8sRUFBRSxDQUFDO0tBQ1g7U0FBTTtRQUNMLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLENBQVM7SUFDekIsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRCxNQUFNLE9BQU8sZUFBZTtJQUMxQixZQUFxQixDQUFZO1FBQVosTUFBQyxHQUFELENBQUMsQ0FBVztJQUFHLENBQUM7SUFFckM7O09BRUc7SUFDSCxLQUFLLENBQUMsUUFBUTtRQUNaLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM1QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQkc7SUFDSCxLQUFLLENBQUMsY0FBYztRQUNsQixNQUFNLENBQUMsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLElBQUksSUFBNEIsQ0FBQztRQUVqQyxvREFBb0Q7UUFDcEQsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENB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