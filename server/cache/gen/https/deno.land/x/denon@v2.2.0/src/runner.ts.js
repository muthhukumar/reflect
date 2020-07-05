// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log } from "../deps.ts";
import { buildFlags } from "./scripts.ts";
import { merge } from "./merge.ts";
const reDenoAction = new RegExp(/^(deno +\w+) *(.*)$/);
const reCompact = new RegExp(/^'(?:\\'|.)*?\.(ts|js)'|^"(?:\\"|.)*?\.(ts|js)"|^(?:\\\ |\S)+\.(ts|js)$/);
const reCliCompact = new RegExp(/^(run|test|fmt) *(.*)$/);
/**
 * Handle all the things related to process management.
 * Scripts are built into executable commands that are
 * executed by `Deno.run()` and managed in an `Executable`
 * object to make available process events.
 */
export class Runner {
    constructor(config, args = []) {
        this.#config = config;
        this.#args = args;
    }
    #config;
    #args;
    /**
     * Build the script, in whatever form it is declared in,
     * to be compatible with `Deno.run()`.
     * This function add flags, arguments and actions.
     */
    build(script) {
        // global options
        const g = Object.assign({
            watch: true,
        }, this.#config);
        delete g.scripts;
        const s = this.#config.scripts[script];
        if (!s && this.#args) {
            const cmd = this.#args.join(" ");
            let out = [];
            if (reCompact.test(cmd)) {
                out = ["deno", "run"];
                out = out.concat(stdCmd(cmd));
            }
            else if (reCliCompact.test(cmd)) {
                out = ["deno"];
                out = out.concat(stdCmd(cmd));
            }
            else {
                out = stdCmd(cmd);
            }
            const command = {
                cmd: out,
                options: g,
                exe: () => {
                    return this.execute(command);
                },
            };
            return command;
        }
        let o;
        let cmd;
        if (typeof s === "string") {
            o = g;
            cmd = s;
        }
        else {
            o = Object.assign({}, merge(g, s));
            cmd = s.cmd;
        }
        let out = [];
        let denoAction = reDenoAction.exec(cmd);
        if (denoAction && denoAction.length === 3) {
            const action = denoAction[1];
            const args = denoAction[2];
            out = out.concat(stdCmd(action));
            out = out.concat(buildFlags(o));
            if (args)
                out = out.concat(stdCmd(args));
        }
        else if (reCompact.test(cmd)) {
            out = ["deno", "run"];
            out = out.concat(buildFlags(o));
            out = out.concat(stdCmd(cmd));
        }
        else {
            out = stdCmd(cmd);
        }
        const command = {
            cmd: out,
            options: o,
            exe: () => {
                return this.execute(command);
            },
        };
        return command;
    }
    /**
     * Create an `Execution` object to handle the lifetime
     * of the process that is executed.
     */
    execute(command) {
        log.info(`starting \`${command.cmd.join(" ")}\``);
        const options = {
            cmd: command.cmd,
            env: command.options.env ?? {},
            stdin: command.options.stdin ?? "inherit",
            stdout: command.options.stdout ?? "inherit",
            stderr: command.options.stderr ?? "inherit",
        };
        return Deno.run(options);
    }
}
function stdCmd(cmd) {
    return cmd.trim().replace(/\s\s+/g, " ").split(" ");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQveC9kZW5vbkB2Mi4yLjAvc3JjL3J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVqQyxPQUFPLEVBQTBCLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVsRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBWW5DLE1BQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQzFCLHlFQUF5RSxDQUMxRSxDQUFDO0FBQ0YsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUUxRDs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxNQUFNO0lBSWpCLFlBQVksTUFBb0IsRUFBRSxPQUFpQixFQUFFO1FBQ25ELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFORCxPQUFPLENBQWU7SUFDdEIsS0FBSyxDQUFXO0lBT2hCOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsTUFBYztRQUNsQixpQkFBaUI7UUFDakIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN0QixLQUFLLEVBQUUsSUFBSTtTQUNaLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUVqQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFD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