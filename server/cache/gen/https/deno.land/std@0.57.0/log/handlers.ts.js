// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { open, openSync, close, renameSync, stat } = Deno;
import { getLevelByName, LogLevels } from "./levels.ts";
import { red, yellow, blue, bold } from "../fmt/colors.ts";
import { existsSync, exists } from "../fs/exists.ts";
import { BufWriterSync } from "../io/bufio.ts";
const DEFAULT_FORMATTER = "{levelName} {msg}";
export class BaseHandler {
    constructor(levelName, options = {}) {
        this.level = getLevelByName(levelName);
        this.levelName = levelName;
        this.formatter = options.formatter || DEFAULT_FORMATTER;
    }
    handle(logRecord) {
        if (this.level > logRecord.level)
            return;
        const msg = this.format(logRecord);
        return this.log(msg);
    }
    format(logRecord) {
        if (this.formatter instanceof Function) {
            return this.formatter(logRecord);
        }
        return this.formatter.replace(/{(\S+)}/g, (match, p1) => {
            const value = logRecord[p1];
            // do not interpolate missing values
            if (!value) {
                return match;
            }
            return String(value);
        });
    }
    log(_msg) { }
    async setup() { }
    async destroy() { }
}
export class ConsoleHandler extends BaseHandler {
    format(logRecord) {
        let msg = super.format(logRecord);
        switch (logRecord.level) {
            case LogLevels.INFO:
                msg = blue(msg);
                break;
            case LogLevels.WARNING:
                msg = yellow(msg);
                break;
            case LogLevels.ERROR:
                msg = red(msg);
                break;
            case LogLevels.CRITICAL:
                msg = bold(red(msg));
                break;
            default:
                break;
        }
        return msg;
    }
    log(msg) {
        console.log(msg);
    }
}
export class WriterHandler extends BaseHandler {
    constructor() {
        super(...arguments);
        this.#encoder = new TextEncoder();
    }
    #encoder;
}
export class FileHandler extends WriterHandler {
    constructor(levelName, options) {
        super(levelName, options);
        this._encoder = new TextEncoder();
        this.#unloadCallback = () => this.destroy();
        this._filename = options.filename;
        // default to append mode, write only
        this._mode = options.mode ? options.mode : "a";
        this._openOptions = {
            createNew: this._mode === "x",
            create: this._mode !== "x",
            append: this._mode === "a",
            truncate: this._mode !== "a",
            write: true,
        };
    }
    #unloadCallback;
    async setup() {
        this._file = await open(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
        addEventListener("unload", this.#unloadCallback);
    }
    handle(logRecord) {
        super.handle(logRecord);
        // Immediately flush if log level is higher than ERROR
        if (logRecord.level > LogLevels.ERROR) {
            this.flush();
        }
    }
    log(msg) {
        this._buf.writeSync(this._encoder.encode(msg + "\n"));
    }
    flush() {
        if (this._buf?.buffered() > 0) {
            this._buf.flush();
        }
    }
    destroy() {
        this.flush();
        this._file?.close();
        this._file = undefined;
        removeEventListener("unload", this.#unloadCallback);
        return Promise.resolve();
    }
}
export class RotatingFileHandler extends FileHandler {
    constructor(levelName, options) {
        super(levelName, options);
        this.#currentFileSize = 0;
        this.#maxBytes = options.maxBytes;
        this.#maxBackupCount = options.maxBackupCount;
    }
    #maxBytes;
    #maxBackupCount;
    #currentFileSize;
    async setup() {
        if (this.#maxBytes < 1) {
            this.destroy();
            throw new Error("maxBytes cannot be less than 1");
        }
        if (this.#maxBackupCount < 1) {
            this.destroy();
            throw new Error("maxBackupCount cannot be less than 1");
        }
        await super.setup();
        if (this._mode === "w") {
            // Remove old backups too as it doesn't make sense to start with a clean
            // log file, but old backups
            for (let i = 1; i <= this.#maxBackupCount; i++) {
                if (await exists(this._filename + "." + i)) {
                    await Deno.remove(this._filename + "." + i);
                }
            }
        }
        else if (this._mode === "x") {
            // Throw if any backups also exist
            for (let i = 1; i <= this.#maxBackupCount; i++) {
                if (await exists(this._filename + "." + i)) {
                    this.destroy();
                    throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i + " already exists");
                }
            }
        }
        else {
            this.#currentFileSize = (await stat(this._filename)).size;
        }
    }
    log(msg) {
        const msgByteLength = this._encoder.encode(msg).byteLength + 1;
        if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
            this.rotateLogFiles();
            this.#currentFileSize = 0;
        }
        this._buf.writeSync(this._encoder.encode(msg + "\n"));
        this.#currentFileSize += msgByteLength;
    }
    rotateLogFiles() {
        this._buf.flush();
        close(this._file.rid);
        for (let i = this.#maxBackupCount - 1; i >= 0; i--) {
            const source = this._filename + (i === 0 ? "" : "." + i);
            const dest = this._filename + "." + (i + 1);
            if (existsSync(source)) {
                renameSync(source, dest);
            }
        }
        this._file = openSync(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2xvZy9oYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFJekQsT0FBTyxFQUFFLGNBQWMsRUFBYSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFbkUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzNELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDckQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9DLE1BQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7QUFROUMsTUFBTSxPQUFPLFdBQVc7SUFLdEIsWUFBWSxTQUFvQixFQUFFLFVBQTBCLEVBQUU7UUFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLGlCQUFpQixDQUFDO0lBQzFELENBQUM7SUFFRCxNQUFNLENBQUMsU0FBb0I7UUFDekIsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUV6QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQW9C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