// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log, yellow, bold, gray, blue, reset, setColorEnabled, grant, exists, omelette, } from "../deps.ts";
import { writeConfigTemplate, getConfigFilename, } from "./config.ts";
import { Runner } from "./runner.ts";
import { VERSION } from "../denon.ts";
import { Watcher } from "./watcher.ts";
/**
 * These are the permissions required for a clean run
 * of `denon`. If not provided through installation they
 * will be asked on every run by the `grant()` std function.
 *
 * The permissions required are:
 * - *read*, used to correctly load a configuration file and
 * to monitor for filesystem changes in the directory `denon`
 * is executed to reload scripts.
 * - *write*, write configuration templates.
 * - *run*, used to run scripts as child processes.
 * - *write*, download configuration templates and import
 * `denon.config.ts` file.
 */
export const PERMISSIONS = [
    { name: "read" },
    { name: "write" },
    { name: "run" },
    { name: "net" },
];
/**
 * These permissions are required on specific situations,
 * `denon` should not be installed with this permissions
 * but you should be granting them when they are required.
 */
export const PERMISSION_OPTIONAL = {
    initializeConfig: [{ name: "write" }, { name: "net" }],
    upgradeExe: [{ name: "net" }],
};
export async function grantPermissions() {
    // @see PERMISSIONS .
    let permissions = await grant([...PERMISSIONS]);
    if (!permissions || permissions.length < PERMISSIONS.length) {
        log.critical("Required permissions `read` and `run` not granted");
        Deno.exit(1);
    }
}
/**
 * Create configuration file in the root of current work directory.
 * // TODO: make it interactive
 */
export async function initializeConfig(template) {
    let permissions = await grant(PERMISSION_OPTIONAL.initializeConfig);
    if (!permissions ||
        permissions.length < PERMISSION_OPTIONAL.initializeConfig.length) {
        log.critical("Required permissions for this operation not granted");
        Deno.exit(1);
    }
    if (!await exists(template)) {
        await writeConfigTemplate(template);
    }
    else {
        log.error(`\`${template}\` already exists in root dir`);
    }
}
/**
 * Grab a fresh copy of denon
 */
export async function upgrade(version) {
    const url = `https://deno.land/x/denon${version ? `@${version}` : ""}/denon.ts`;
    if (version === VERSION) {
        log.info(`Version ${version} already installed`);
        Deno.exit(0);
    }
    let permissions = await grant(PERMISSION_OPTIONAL.upgradeExe);
    if (!permissions ||
        permissions.length < PERMISSION_OPTIONAL.upgradeExe.length) {
        log.critical("Required permissions for this operation not granted");
        Deno.exit(1);
    }
    log.debug(`Checking if ${url} exists`);
    if ((await fetch(url)).status !== 200) {
        log.critical(`Upgrade url ${url} does not exist`);
        Deno.exit(1);
    }
    log.info(`Running \`deno install -Af --unstable ${url}\``);
    await Deno.run({
        cmd: [
            "deno",
            "install",
            "--allow-read",
            "--allow-run",
            "--allow-write",
            "-f",
            "--unstable",
            url,
        ],
        stdout: undefined,
    }).status();
    Deno.exit(0);
}
/**
 * Generate autocomplete suggestions
 */
export function autocomplete(config) {
    // Write your CLI template.
    const completion = omelette.default(`denon <script>`);
    // Bind events for every template part.
    completion.on("script", function ({ reply }) {
        const watcher = new Watcher(config.watcher);
        const auto = Object.keys(config.scripts);
        for (const file of Deno.readDirSync(Deno.cwd())) {
            if (file.isFile && watcher.isWatched(file.name)) {
                auto.push(file.name);
            }
            else {
                // auto.push(file.name);
            }
        }
        reply(auto);
    });
    completion.init();
}
/**
 * List all available scripts declared in the config file.
 * // TODO: make it interactive
 */
export function printAvailableScripts(config) {
    if (Object.keys(config.scripts).length) {
        log.info("available scripts:");
        const runner = new Runner(config);
        for (const name of Object.keys(config.scripts)) {
            const script = config.scripts[name];
            console.log();
            console.log(` - ${yellow(bold(name))}`);
            if (typeof script === "object" && script.desc) {
                console.log(`   ${script.desc}`);
            }
            console.log(gray(`   $ ${runner.build(name).cmd.join(" ")}`));
        }
        console.log();
        console.log(`You can run scripts with \`${blue("denon")} ${yellow("<script>")}\``);
    }
    else {
        log.error("It looks like you don't have any scripts...");
        const config = getConfigFilename();
        if (config) {
            log.info(`You can add scripts to your \`${config}\` file. Check the docs.`);
        }
        else {
            log.info(`You can create a config to add scripts to with \`${blue("denon")} ${yellow("--init")}${reset("\`.")}`);
        }
    }
}
/**
 * Help message to be shown if `denon`
 * is run with `--help` flag.
 */
export function printHelp(version) {
    setColorEnabled(true);
    console.log(`${blue("DENON")} - ${version}
Monitor any changes in your Deno application and automatically restart.

Usage:
    ${blue("denon")} ${yellow("<script name>")}     ${gray("-- eg: denon start")}
    ${blue("denon")} ${yellow("<command>")}         ${gray("-- eg: denon run helloworld.ts")}
    ${blue("denon")} [options]         ${gray("-- eg: denon --help")}

Options:
    -h --help               Show this screen.
    -v --version            Show version.
    -i --init               Create config file in current working dir.
    -u --upgrade <version>  Upgrade to latest version. (default: master)
    -c --config <file>      Use specific file as configuration.
`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQveC9kZW5vbkB2Mi4yLjAvc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUNMLEdBQUcsRUFDSCxNQUFNLEVBQ04sSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLGVBQWUsRUFDZixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsR0FDVCxNQUFNLFlBQVksQ0FBQztBQUVwQixPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLGlCQUFpQixHQUVsQixNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV2Qzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFnQztJQUN0RCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDaEIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0lBQ2pCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtJQUNmLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtDQUNoQixDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUU1QjtJQUNGLGdCQUFnQixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdEQsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7Q0FDOUIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxLQUFLLFVBQVUsZ0JBQWdCO0lBQ3BDLHFCQUFxQjtJQUNyQixJQUFJLFdBQVcsR0FBRyxNQUFNLEtB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