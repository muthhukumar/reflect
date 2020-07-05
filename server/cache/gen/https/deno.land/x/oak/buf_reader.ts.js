// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
import { assert } from "./deps.ts";
import { stripEol } from "./util.ts";
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const MAX_CONSECUTIVE_EMPTY_READS = 100;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
export class BufferFullError extends Error {
    constructor(partial) {
        super("Buffer full");
        this.partial = partial;
        this.name = "BufferFullError";
    }
}
/** BufReader implements buffering for a Reader object. */
export class BufReader {
    constructor(rd, size = DEFAULT_BUF_SIZE) {
        this.#posRead = 0;
        this.#posWrite = 0;
        this.#eof = false;
        // Reads a new chunk into the buffer.
        this.#fill = async () => {
            // Slide existing data to beginning.
            if (this.#posRead > 0) {
                this.#buffer.copyWithin(0, this.#posRead, this.#posWrite);
                this.#posWrite -= this.#posRead;
                this.#posRead = 0;
            }
            if (this.#posWrite >= this.#buffer.byteLength) {
                throw Error("bufio: tried to fill full buffer");
            }
            // Read new data: try a limited number of times.
            for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
                const rr = await this.#reader.read(this.#buffer.subarray(this.#posWrite));
                if (rr === null) {
                    this.#eof = true;
                    return;
                }
                assert(rr >= 0, "negative read");
                this.#posWrite += rr;
                if (rr > 0) {
                    return;
                }
            }
            throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
        };
        this.#reset = (buffer, reader) => {
            this.#buffer = buffer;
            this.#reader = reader;
            this.#eof = false;
        };
        if (size < MIN_BUF_SIZE) {
            size = MIN_BUF_SIZE;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    #buffer;
    #reader;
    #posRead;
    #posWrite;
    #eof;
    // Reads a new chunk into the buffer.
    #fill;
    #reset;
    buffered() {
        return this.#posWrite - this.#posRead;
    }
    async readLine(strip = true) {
        let line;
        try {
            line = await this.readSlice(LF);
        }
        catch (err) {
            let { partial } = err;
            assert(partial instanceof Uint8Array, "Caught error from `readSlice()` without `partial` property");
            // Don't throw if `readSlice()` failed with `BufferFullError`, instead we
            // just return whatever is available and set the `more` flag.
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            // Handle the case where "\r\n" straddles the buffer.
            if (!this.#eof &&
                partial.byteLength > 0 &&
                partial[partial.byteLength - 1] === CR) {
                // Put the '\r' back on buf and drop it from line.
                // Let the next call to ReadLine check for "\r\n".
                assert(this.#posRead > 0, "Tried to rewind past start of buffer");
                this.#posRead--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            return { bytes: partial, eol: this.#eof };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return { bytes: line, eol: true };
        }
        if (strip) {
            line = stripEol(line);
        }
        return { bytes: line, eol: true };
    }
    async readSlice(delim) {
        let s = 0; // search start index
        let slice;
        while (true) {
            // Search buffer.
            let i = this.#buffer.subarray(this.#posRead + s, this.#posWrite).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.#buffer.subarray(this.#posRead, this.#posRead + i + 1);
                this.#posRead += i + 1;
                break;
            }
            // EOF?
            if (this.#eof) {
                if (this.#posRead === this.#posWrite) {
                    return null;
                }
                slice = this.#buffer.subarray(this.#posRead, this.#posWrite);
                this.#posRead = this.#posWrite;
                break;
            }
            // Buffer full?
            if (this.buffered() >= this.#buffer.byteLength) {
                this.#posRead = this.#posWrite;
                // #4521 The internal buffer should not be reused across reads because it causes corruption of data.
                const oldbuf = this.#buffer;
                const newbuf = this.#buffer.slice(0);
                this.#buffer = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.#posWrite - this.#posRead; // do not rescan area we scanned before
            // Buffer is not full.
            try {
                await this.#fill();
            }
            catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmX3JlYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1Zl9yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBRXpFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDbkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQU9yQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM5QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUM7QUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sT0FBTyxlQUFnQixTQUFRLEtBQUs7SUFFeEMsWUFBbUIsT0FBbUI7UUFDcEMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBREosWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUR0QyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7SUFHekIsQ0FBQztDQUNGO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sT0FBTyxTQUFTO0lBNkNwQixZQUFZLEVBQWUsRUFBRSxPQUFlLGdCQUFnQjtRQTFDNUQsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxTQUFJLEdBQUcsS0FBSyxDQUFDO1FBRWIscUNBQXFDO1FBQ3JDLFVBQUssR0FBRyxLQUFLLElBQW1CLEVBQUU7WUFDaEMsb0NBQW9DO1lBQ3BDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNuQjtZQUVELElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDN0MsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQzthQUNqRDtZQUVELGdEQUFnRDtZQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLDJCQUEyQixFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDakIsT0FBTztpQkFDUjtnQkFDRCxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixPQUFPO2lCQUNSO2FBQ0Y7WUFFRCxNQUFNLElBQUksS0FBSyxDQUNiLHFCQUFxQiwyQkFBMkIsZUFBZSxDQUNoRSxDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRUYsV0FBTSxHQUFHLENBQUMsTUFBa0IsRUFBRSxNQUFtQixFQUFRLEVBQUU7WUFDekQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQyxDQUFDO1FBR0EsSUFBSSxJQUFJLEdBQUcsWUFBWSxFQUFFO1lBQ3ZCLElBQUksR0FBRyxZQUFZLENBQUM7U0FDckI7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFqREQsT0FBTyxDQUFjO0lBQ3JCLE9BQU8sQ0FBZTtJQUN0QixRQUFRLENBQUs7SUFDYixTQUFTLENBQUs7SUFDZCxJQUFJLENBQVM7SUFFYixxQ0FBcUM7SUFDckMsS0FBSyxDQTZCSDtJQUVGLE1BQU0sQ0FJSjtJQVNGLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN4QyxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FDWixLQUFLLEdBQUcsSUFBSTtRQUVaLElBQUksSUFBdUIsQ0FBQztRQUU1QixJQUFJO1lBQ0YsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNqQztRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUN0QixNQUFNLENBQ0osT0FBTyxZQUFZLFVBQVUsRUFDN0IsNERBQTRELENBQzdELENBQUM7WUFFRix5RUFBeUU7WUFDekUsNkRBQTZEO1lBQzdELElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxlQUFlLENBQUMsRUFBRTtnQkFDckMsTUFBTSxHQUFHLENBQUM7YUFDWDtZQUVELHFEQUFxRDtZQUNyRCxJQUNFLENBQUMsSUFBSSxDQUFDLElBQUk7Z0JBQ1YsT0FBTyxDQUFDLFVBQVUsR0FBRyxDQUFDO2dCQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQ3RDO2dCQUNBLGtEQUFrRDtnQkFDbEQsa0RBQWtEO2dCQUNsRCxNQUFNLENBQ0osSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQ2pCLHNDQUFzQyxDQUN2QyxDQUFDO2dCQUNGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDdkQ7WUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzNDO1FBRUQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUNuQztRQUVELElBQUksS0FBSyxFQUFFO1lBQ1QsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFhO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtRQUNoQyxJQUFJLEtBQTZCLENBQUM7UUFFbEMsT0FBTyxJQUFJLEVBQUU7WUFDWCxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FDdEUsS0FBSyxDQUNOLENBQUM7WUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ1YsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixNQUFNO2FBQ1A7WUFFRCxPQUFPO1lBQ1AsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNiLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNwQyxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDL0IsTUFBTTthQUNQO1lBRUQsZUFBZTtZQUNmLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQy9CLG9HQUFvRztnQkFDcEcsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO2dCQUN0QixNQUFNLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25DO1lBRUQsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLHVDQUF1QztZQUUzRSxzQkFBc0I7WUFDdEIsSUFBSTtnQkFDRixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNwQjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixNQUFNLEdBQUcsQ0FBQzthQUNYO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FDRiJ9