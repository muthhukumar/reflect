// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log } from "./deps.ts";
import { Watcher } from "./src/watcher.ts";
import { Runner } from "./src/runner.ts";
import { Daemon } from "./src/daemon.ts";
import { printAvailableScripts, printHelp, initializeConfig, grantPermissions, upgrade, autocomplete, } from "./src/cli.ts";
import { readConfig, reConfig, } from "./src/config.ts";
import { parseArgs } from "./src/args.ts";
import { setupLog } from "./src/log.ts";
export const VERSION = "v2.2.0";
export const BRANCH = "master";
/**
 * Denon instance.
 * Holds loaded configuration and handles creation
 * of daemons with the `start(script)` method.
 */
export class Denon {
    constructor(config) {
        this.config = config;
        this.watcher = new Watcher(config.watcher);
        this.runner = new Runner(config, config.args ? config.args.cmd : []);
    }
    run(script) {
        return new Daemon(this, script);
    }
}
/**
 * CLI starts here,
 * other than the awesome `denon` cli this is an
 * example on how the library should be used if
 * included as a module.
 */
if (import.meta.main) {
    await setupLog();
    await grantPermissions();
    const args = parseArgs(Deno.args);
    let config = await readConfig(args.config);
    await setupLog(config.logger);
    autocomplete(config);
    config.args = args;
    // show help message.
    if (args.help) {
        printHelp(VERSION);
        Deno.exit(0);
    }
    // show version number.
    log.info(VERSION);
    if (args.version)
        Deno.exit(0);
    // update denon to latest release
    if (args.upgrade) {
        await upgrade(args.upgrade);
        Deno.exit(0);
    }
    // create configuration file.
    // TODO: should be made interactive.
    if (args.init) {
        await initializeConfig(args.init);
        Deno.exit(0);
    }
    // show all available scripts.
    if (args.cmd.length === 0) {
        printAvailableScripts(config);
        Deno.exit(0);
    }
    const script = args.cmd[0];
    const denon = new Denon(config);
    if (config.logger.fullscreen)
        console.clear();
    if (config.watcher.match) {
        log.info(`watching path(s): ${config.watcher.match.join(" ")}`);
    }
    if (config.watcher.exts) {
        log.info(`watching extensions: ${config.watcher.exts.join(",")}`);
    }
    // TODO(qu4k): events
    for await (let event of denon.run(script)) {
        if (event.type === "reload") {
            if (event.change.some((_) => reConfig.test(_.path) && _.path === config.configPath)) {
                config = await readConfig(args.config);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVub24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC94L2Rlbm9uQHYyLjIuMC9kZW5vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVoQyxPQUFPLEVBQUUsT0FBTyxFQUFhLE1BQU0sa0JBQWtCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE9BQU8sRUFDUCxZQUFZLEdBQ2IsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUNMLFVBQVUsRUFFVixRQUFRLEdBQ1QsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFeEMsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQztBQUNoQyxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBaUQvQjs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLEtBQUs7SUFJaEIsWUFBbUIsTUFBMkI7UUFBM0IsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FB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