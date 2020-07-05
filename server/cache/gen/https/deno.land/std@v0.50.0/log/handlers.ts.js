// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { open, openSync, close, renameSync, statSync } = Deno;
import { getLevelByName, LogLevels } from "./levels.ts";
import { red, yellow, blue, bold } from "../fmt/colors.ts";
import { existsSync, exists } from "../fs/exists.ts";
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
        this.#encoder = new TextEncoder();
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
    #encoder;
    async setup() {
        this._file = await open(this._filename, this._openOptions);
        this._writer = this._file;
    }
    log(msg) {
        Deno.writeSync(this._file.rid, this.#encoder.encode(msg + "\n"));
    }
    destroy() {
        this._file.close();
        return Promise.resolve();
    }
}
export class RotatingFileHandler extends FileHandler {
    constructor(levelName, options) {
        super(levelName, options);
        this.#maxBytes = options.maxBytes;
        this.#maxBackupCount = options.maxBackupCount;
    }
    #maxBytes;
    #maxBackupCount;
    async setup() {
        if (this.#maxBytes < 1) {
            throw new Error("maxBytes cannot be less than 1");
        }
        if (this.#maxBackupCount < 1) {
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
                    Deno.close(this._file.rid);
                    throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i + " already exists");
                }
            }
        }
    }
    handle(logRecord) {
        if (this.level > logRecord.level)
            return;
        const msg = this.format(logRecord);
        const currentFileSize = statSync(this._filename).size;
        if (currentFileSize + msg.length > this.#maxBytes) {
            this.rotateLogFiles();
        }
        return this.log(msg);
    }
    rotateLogFiles() {
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJoYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFJN0QsT0FBTyxFQUFFLGNBQWMsRUFBYSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFbkUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzNELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFckQsTUFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQztBQVE5QyxNQUFNLE9BQU8sV0FBVztJQUt0QixZQUFZLFNBQW9CLEVBQUUsVUFBMEIsRUFBRTtRQUM1RCxJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUM7SUFDMUQsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUFvQjtRQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRXpDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsU0FBb0I7UUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLFFBQVEsRUFBRTtZQUN0QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQVUsRUFBRTtZQUM5RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBcUIsQ0FBQyxDQUFDO1lBRS9DLG9DQUFvQztZQUNwQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxHQUFHLENBQUMsSUFBWSxJQUFTLENBQUM7SUFDMUIsS0FBSyxDQUFDLEtBQUssS0FBbUIsQ0FBQztJQUMvQixLQUFLLENBQUMsT0FBTyxLQUFtQixDQUFDO0NBQ2xDO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxXQUFXO0lBQzdDLE1BQU0sQ0FBQyxTQUFvQjtRQUN6QixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWxDLFFBQVEsU0FBUyxDQUFDLEtBQUssRUFBRTtZQUN2QixLQUFLLFNBQVMsQ0FBQyxJQUFJO2dCQUNqQixHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixNQUFNO1lBQ1IsS0FBSyxTQUFTLENBQUMsT0FBTztnQkFDcEIsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsTUFBTTtZQUNSLEtBQUssU0FBUyxDQUFDLEtBQUs7Z0JBQ2xCLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2YsTUFBTTtZQUNSLEtBQUssU0FBUyxDQUFDLFFBQVE7Z0JBQ3JCLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07WUFDUjtnQkFDRSxNQUFNO1NBQ1Q7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBVztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFnQixhQUFjLFNBQVEsV0FBVztJQUF2RDs7UUFFRSxhQUFRLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUcvQixDQUFDO0lBSEMsUUFBUSxDQUFxQjtDQUc5QjtBQU9ELE1BQU0sT0FBTyxXQUFZLFNBQVEsYUFBYTtJQU81QyxZQUFZLFNBQW9CLEVBQUUsT0FBMkI7UUFDM0QsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUg1QixhQUFRLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUkzQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDbEMscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUc7WUFDbEIsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRztZQUM3QixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSyxHQUFHO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUc7WUFDMUIsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRztZQUM1QixLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7SUFDSixDQUFDO0lBZEQsUUFBUSxDQUFxQjtJQWdCN0IsS0FBSyxDQUFDLEtBQUs7UUFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBRUQsR0FBRyxDQUFDLEdBQVc7UUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUFPRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsV0FBVztJQUlsRCxZQUFZLFNBQW9CLEVBQUUsT0FBbUM7UUFDbkUsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDbEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO0lBQ2hELENBQUM7SUFQRCxTQUFTLENBQVM7SUFDbEIsZUFBZSxDQUFTO0lBUXhCLEtBQUssQ0FBQyxLQUFLO1FBQ1QsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDbkQ7UUFDRCxJQUFJLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUN6RDtRQUNELE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxHQUFHLEVBQUU7WUFDdEIsd0VBQXdFO1lBQ3hFLDRCQUE0QjtZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDMUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUM3QzthQUNGO1NBQ0Y7YUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRyxFQUFFO1lBQzdCLGtDQUFrQztZQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMzQixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQ2pDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxpQkFBaUIsQ0FDbEUsQ0FBQztpQkFDSDthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQW9CO1FBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSztZQUFFLE9BQU87UUFFekMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN0RCxJQUFJLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxjQUFjO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU1QyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdEIsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMxQjtTQUNGO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzVCLENBQUM7Q0FDRiJ9