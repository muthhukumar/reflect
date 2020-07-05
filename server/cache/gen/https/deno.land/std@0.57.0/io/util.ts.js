// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { mkdir, open } = Deno;
import * as path from "../path/mod.ts";
/**
 * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
 * into `dst` will not be copied.
 *
 * @param src Source byte array
 * @param dst Destination byte array
 * @param off Offset into `dst` at which to begin writing values from `src`.
 * @return number of bytes copied
 */
export function copyBytes(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
export function charCode(s) {
    return s.charCodeAt(0);
}
/** Create or open a temporal file at specified directory with prefix and
 *  postfix
 * */
export async function tempFile(dir, opts = { prefix: "", postfix: "" }) {
    const r = Math.floor(Math.random() * 1000000);
    const filepath = path.resolve(`${dir}/${opts.prefix || ""}${r}${opts.postfix || ""}`);
    await mkdir(path.dirname(filepath), { recursive: true });
    const file = await open(filepath, {
        create: true,
        read: true,
        write: true,
        append: true,
    });
    return { file, filepath };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjU3LjAvaW8vdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFHN0IsT0FBTyxLQUFLLElBQUksTUFBTSxnQkFBZ0IsQ0FBQztBQUV2Qzs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQUMsR0FBZSxFQUFFLEdBQWUsRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUNqRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDakQsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztJQUMvQyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLEVBQUU7UUFDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7S0FDMUM7SUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUM7QUFDeEIsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUMsQ0FBUztJQUNoQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOztLQUVLO0FBQ0wsTUFBTSxDQUFDLEtBQUssVUFBVSxRQUFRLENBQzVCLEdBQVcsRUFDWCxPQUdJLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO0lBRS9CLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQzNCLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxDQUN2RCxDQUFDO0lBQ0YsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNoQyxNQUFNLEVBQUUsSUFBSTtRQUNaLElBQUksRUFBRSxJQUFJO1FBQ1YsS0FBSyxFQUFFLElBQUk7UUFDWCxNQUFNLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztJQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUM7QUFDNUIsQ0FBQyJ9