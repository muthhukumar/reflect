// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log } from "../deps.ts";
/**
 * Daemon instance.
 * Returned by Denon instance when
 * `start(script)` is called. It can be used in a for
 * loop to listen to DenonEvents.
 */
export class Daemon {
    constructor(denon, script) {
        this.#processes = {};
        this.#denon = denon;
        this.#script = script;
        this.#config = denon.config; // just as a shortcut
    }
    #denon;
    #script;
    #config;
    #processes;
    /**
     * Restart current process.
     */
    async reload() {
        if (this.#config.logger && this.#config.logger.fullscreen) {
            log.debug("clearing screen");
            console.clear();
        }
        if (this.#config.watcher.match) {
            log.info(`watching path(s): ${this.#config.watcher.match.join(" ")}`);
        }
        if (this.#config.watcher.exts) {
            log.info(`watching extensions: ${this.#config.watcher.exts.join(",")}`);
        }
        log.info("restarting due to changes...");
        this.killAll();
        await this.start();
    }
    start() {
        const command = this.#denon.runner.build(this.#script);
        const process = command.exe();
        log.debug(`S: starting process with pid ${process.pid}`);
        this.#processes[process.pid] = (process);
        this.monitor(process);
        return command;
    }
    killAll() {
        log.debug(`K: killing ${Object.keys(this.#processes).length} process[es]`);
        // kill all processes spawned
        let pcopy = Object.assign({}, this.#processes);
        this.#processes = {};
        for (let id in pcopy) {
            const p = pcopy[id];
            if (Deno.build.os === "windows") {
                log.debug(`K: closing (windows) process with pid ${p.pid}`);
                p.close();
            }
            else {
                log.debug(`K: killing (unix) process with pid ${p.pid}`);
                Deno.kill(p.pid, Deno.Signal.SIGKILL);
            }
        }
    }
    async monitor(process) {
        log.debug(`M: monitoring status of process with pid ${process.pid}`);
        const pid = process.pid;
        let s;
        try {
            s = await process.status();
            log.debug(`M: got status of process with pid ${process.pid}`);
        }
        catch (error) {
            log.debug(`M: error getting status of process with pid ${process.pid}`);
        }
        let p = this.#processes[pid];
        if (p) {
            log.debug(`M: process with pid ${process.pid} exited on its own`);
            // process exited on its own, so we should wait a reload
            // remove it from processes array as it is already dead
            delete this.#processes[pid];
            if (s) {
                // log status status
                if (s.success) {
                    log.info("clean exit - waiting for changes before restart");
                }
                else {
                    log.info("app crashed - waiting for file changes before starting ...");
                }
            }
        }
        else {
            log.debug(`M: process with pid ${process.pid} was killed`);
        }
    }
    async onExit() {
        if (Deno.build.os !== "windows") {
            const signs = [
                Deno.Signal.SIGHUP,
                Deno.Signal.SIGINT,
                Deno.Signal.SIGTERM,
                Deno.Signal.SIGTSTP,
            ];
            signs.forEach((s) => {
                (async () => {
                    await Deno.signal(s);
                    this.killAll();
                    Deno.exit(0);
                })();
            });
        }
    }
    async *iterate() {
        yield {
            type: "start",
        };
        const command = this.start();
        this.onExit();
        if (command.options.watch) {
            for await (const watchE of this.#denon.watcher) {
                if (watchE.some((_) => _.type.includes("modify"))) {
                    log.debug(`R: reload event detected, starting the reload procedure...`);
                    yield {
                        type: "reload",
                        change: watchE,
                    };
                    await this.reload();
                }
            }
        }
        yield {
            type: "exit",
        };
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFlbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQveC9kZW5vbkB2Mi4yLjAvc3JjL2RhZW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUtqQzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxNQUFNO0lBTWpCLFlBQVksS0FBWSxFQUFFLE1BQWM7UUFGeEMsZUFBVSxHQUFvQyxFQUFFLENBQUM7UUFHL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMscUJBQXFCO0lBQ3BELENBQUM7SUFURCxNQUFNLENBQVE7SUFDZCxPQUFPLENBQVM7SUFDaEIsT0FBTyxDQUFzQjtJQUM3QixVQUFVLENBQXVDO0lBUWpEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLE1BQU07UUFDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDekQsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNqQjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDN0IsR0FBRyxDQUFD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