// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { LogLevels, getLevelByName, getLevelName, } from "./levels.ts";
export class LogRecord {
    constructor(msg, args, level) {
        this.msg = msg;
        this.#args = [...args];
        this.level = level;
        this.#datetime = new Date();
        this.levelName = getLevelName(level);
    }
    #args;
    #datetime;
    get args() {
        return [...this.#args];
    }
    get datetime() {
        return new Date(this.#datetime.getTime());
    }
}
export class Logger {
    constructor(levelName, handlers) {
        this.level = getLevelByName(levelName);
        this.levelName = levelName;
        this.handlers = handlers || [];
    }
    /** If the level of the logger is greater than the level to log, then nothing
     * is logged, otherwise a log record is passed to each log handler.  `msg` data
     * passed in is returned.  If a function is passed in, it is only evaluated
     * if the msg will be logged and the return value will be the result of the
     * function, not the function itself, unless the function isn't called, in which
     * case undefined is returned.  All types are coerced to strings for logging.
     */
    _log(level, msg, ...args) {
        if (this.level > level) {
            return msg instanceof Function ? undefined : msg;
        }
        let fnResult;
        let logMessage;
        if (msg instanceof Function) {
            fnResult = msg();
            logMessage = this.asString(fnResult);
        }
        else {
            logMessage = this.asString(msg);
        }
        const record = new LogRecord(logMessage, args, level);
        this.handlers.forEach((handler) => {
            handler.handle(record);
        });
        return msg instanceof Function ? fnResult : msg;
    }
    asString(data) {
        if (typeof data === "string") {
            return data;
        }
        else if (data === null ||
            typeof data === "number" ||
            typeof data === "bigint" ||
            typeof data === "boolean" ||
            typeof data === "undefined" ||
            typeof data === "symbol") {
            return String(data);
        }
        else if (typeof data === "object") {
            return JSON.stringify(data);
        }
        return "undefined";
    }
    debug(msg, ...args) {
        return this._log(LogLevels.DEBUG, msg, ...args);
    }
    info(msg, ...args) {
        return this._log(LogLevels.INFO, msg, ...args);
    }
    warning(msg, ...args) {
        return this._log(LogLevels.WARNING, msg, ...args);
    }
    error(msg, ...args) {
        return this._log(LogLevels.ERROR, msg, ...args);
    }
    critical(msg, ...args) {
        return this._log(LogLevels.CRITICAL, msg, ...args);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9sb2cvbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxPQUFPLEVBQ0wsU0FBUyxFQUNULGNBQWMsRUFDZCxZQUFZLEdBRWIsTUFBTSxhQUFhLENBQUM7QUFHckIsTUFBTSxPQUFPLFNBQVM7SUFPcEIsWUFBWSxHQUFXLEVBQUUsSUFBZSxFQUFFLEtBQWE7UUFDckQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQVhELEtBQUssQ0FBWTtJQUNqQixTQUFTLENBQU87SUFXaEIsSUFBSSxJQUFJO1FBQ04sT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQU8sTUFBTTtJQU1qQixZQUFZLFNBQW9CLEVBQUUsUUFBd0I7UUFDeEQsSUFBSSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJ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