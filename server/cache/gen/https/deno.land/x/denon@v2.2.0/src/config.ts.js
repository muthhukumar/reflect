// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { existsSync, extname, JSON_SCHEMA, log, parseYaml, readFileStr, readJson, resolve, globToRegExp, } from "../deps.ts";
import { merge } from "./merge.ts";
import { BRANCH } from "../denon.ts";
const TS_CONFIG = "denon.config.ts";
/**
 * Possible default configuration files.
 */
export const configs = [
    "denon",
    "denon.yaml",
    "denon.yml",
    "denon.json",
    ".denon",
    ".denon.yaml",
    ".denon.yml",
    ".denon.json",
    ".denonrc",
    ".denonrc.yaml",
    ".denonrc.yml",
    ".denonrc.json",
    TS_CONFIG,
];
export const reConfig = new RegExp(configs
    .map((_) => `**/${_}`)
    .map((_) => globToRegExp(_).source)
    .join("|"));
/** The default denon configuration */
export const DEFAULT_DENON_CONFIG = {
    scripts: {},
    watcher: {
        interval: 350,
        paths: [],
        exts: ["ts", "tsx", "js", "jsx", "json"],
        match: ["*.*"],
        skip: ["**/.git/**"],
    },
    logger: {},
    configPath: "",
};
/**
 * Read YAML config, throws if YAML format is not valid
 */
async function readYaml(file) {
    const source = await readFileStr(file);
    return parseYaml(source, {
        schema: JSON_SCHEMA,
        json: true,
    });
}
/**
 * Safe import a TypeScript file
 */
async function importConfig(file) {
    try {
        const configRaw = await import(`file://${resolve(file)}`);
        return configRaw.default;
    }
    catch (error) {
        log.error(error.message ?? "Error opening ts config config");
        return;
    }
}
/**
 * Clean config from malformed strings
 */
function cleanConfig(config, file) {
    if (config.watcher && config.watcher.exts) {
        config.watcher.exts = config.watcher.exts.map((_) => _.startsWith(".") ? _.substr(0) : _);
    }
    if (file) {
        config.configPath = resolve(file);
    }
    return config;
}
/**
 * Returns, if exists, the config filename
 */
export function getConfigFilename() {
    return configs.find((filename) => {
        return existsSync(filename) && Deno.statSync(filename).isFile;
    });
}
/**
 * Reads the denon config from a file
 */
export async function readConfig(file = getConfigFilename()) {
    let config = DEFAULT_DENON_CONFIG;
    if (!config.watcher.paths)
        config.watcher.paths = [];
    config.watcher.paths.push(Deno.cwd());
    if (file) {
        if (file === TS_CONFIG) {
            const parsed = await importConfig(TS_CONFIG);
            if (parsed) {
                config = merge(config, cleanConfig(parsed, file));
            }
        }
        else {
            try {
                const extension = extname(file);
                if (/^\.ya?ml$/.test(extension)) {
                    const parsed = await readYaml(file);
                    config = merge(config, cleanConfig(parsed, file));
                }
                else if (/^\.json$/.test(extension)) {
                    const parsed = await readJson(file);
                    config = merge(config, cleanConfig(parsed, file));
                }
                else {
                    try {
                        const parsed = await readJson(file);
                        config = merge(config, cleanConfig(parsed, file));
                    }
                    catch {
                        const parsed = await readYaml(file);
                        config = merge(config, cleanConfig(parsed, file));
                    }
                }
            }
            catch {
                log.warning(`unsupported configuration \`${file}\``);
            }
        }
    }
    return config;
}
/**
 * Reads the denon config from a file
 */
export async function writeConfigTemplate(template) {
    const templates = `https://deno.land/x/denon@${BRANCH}/templates`;
    const url = `${templates}/${template}`;
    log.info(`fetching template from ${url}`);
    let res;
    try {
        res = await fetch(url);
    }
    catch (e) {
        log.error(`${url} cannot be fetched`);
    }
    if (res) {
        if (res.status === 200) {
            try {
                log.info(`writing template to \`${template}\``);
                await Deno.writeTextFile(resolve(Deno.cwd(), template), await res.text());
                log.info(`\`${template}\` created in current working directory`);
            }
            catch (e) {
                log.error(`\`${template}\` cannot be saved in current working directory`);
            }
        }
        else {
            log.error(`\`${template}\` is not a denon template. All templates are available on ${templates}/`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQveC9kZW5vbkB2Mi4yLjAvc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUNMLFVBQVUsRUFDVixPQUFPLEVBQ1AsV0FBVyxFQUNYLEdBQUcsRUFDSCxTQUFTLEVBQ1QsV0FBVyxFQUNYLFFBQVEsRUFFUixPQUFPLEVBQ1AsWUFBWSxHQUNiLE1BQU0sWUFBWSxDQUFDO0FBTXBCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFbkMsT0FBTyxFQUFFLE1BQU0sRUFBVyxNQUFNLGFBQWEsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztBQUVwQzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRztJQUNyQixPQUFPO0lBQ1AsWUFBWTtJQUNaLFdBQVc7SUFDWCxZQUFZO0lBRVosUUFBUTtJQUNSLGFBQWE7SUFDYixZQUFZO0lBQ1osYUFBYTtJQUViLFVBQVU7SUFDVixlQUFlO0lBQ2YsY0FBYztJQUNkLGVBQWU7SUFFZixTQUFTO0NBQ1YsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FDaEMsT0FBTztLQUNKLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztLQUNyQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUNiLENBQUM7QUF5QkYsc0NBQXNDO0FBQ3RDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUF3QjtJQUN2RCxPQUFPLEVBQUUsRUFBRTtJQUNYLE9BQU8sRUFBRTtRQUNQLFFBQVEsRUFBRSxHQUFHO1FBQ2IsS0FBSyxFQUFFLEVBQUU7UUFDVCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO1FBQ3hDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQztLQUNyQjtJQUNELE1BQU0sRUFBRSxFQUFFO0lBQ1YsVUFBVSxFQUFFLEVBQUU7Q0FDZixDQUFDO0FBRUY7O0dBRUc7QUFDSCxLQUFLLFVBQVUsUUFBUSxDQUFDLElBQVk7SUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsT0FBTyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLE1BQU0sRUFBRSxXQUFXO1FBQ25CLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLFlBQVksQ0FDekIsSUFBWTtJQUVaLElBQUk7UUFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxVQUFVLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUQsT0FBTyxTQUFTLENBQUMsT0FBK0IsQ0FBQztLQUNsRDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLGdDQUFnQyxDQUFDLENBQUM7UUFDN0QsT0FBTztLQUNSO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxXQUFXLENBQ2xCLE1BQTRCLEVBQzVCLElBQWE7SUFFYixJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDekMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDbEQsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0tBQ0g7SUFDRCxJQUFJLElBQUksRUFBRTtRQUNSLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQjtJQUMvQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtRQUMvQixPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoRSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsVUFBVSxDQUM5QixPQUEyQixpQkFBaUIsRUFBRTtJQUU5QyxJQUFJLE1BQU0sR0FBd0Isb0JBQW9CLENBQUM7SUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSztRQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFdEMsSUFBSSxJQUFJLEVBQUU7UUFDUixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0MsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsTUFBTSxHQUFHLEtBQUssQ0FDWixNQUFNLEVBQ04sV0FBVyxDQUFDLE1BQThCLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUM7YUFDSDtTQUNGO2FBQU07WUFDTCxJQUFJO2dCQUNGLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsTUFBTSxHQUFHLEtBQUssQ0FDWixNQUFNLEVBQ04sV0FBVyxDQUFDLE1BQThCLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUM7aUJBQ0g7cUJBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNyQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsTUFBTSxHQUFHLEtBQUssQ0FDWixNQUFNLEVBQ04sV0FBVyxDQUFDLE1BQThCLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUM7aUJBQ0g7cUJBQU07b0JBQ0wsSUFBSTt3QkFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEMsTUFBTSxHQUFHLEtBQUssQ0FDWixNQUFNLEVBQ04sV0FBVyxDQUFDLE1BQThCLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUM7cUJBQ0g7b0JBQUMsTUFBTTt3QkFDTixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEMsTUFBTSxHQUFHLEtBQUssQ0FDWixNQUFNLEVBQ04sV0FBVyxDQUFDLE1BQThCLEVBQUUsSUFBSSxDQUFDLENBQ2xELENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjtZQUFDLE1BQU07Z0JBQ04sR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsSUFBSSxJQUFJLENBQUMsQ0FBQzthQUN0RDtTQUNGO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLFFBQWdCO0lBQ3hELE1BQU0sU0FBUyxHQUFHLDZCQUE2QixNQUFNLFlBQVksQ0FBQztJQUNsRSxNQUFNLEdBQUcsR0FBRyxHQUFHLFNBQVMsSUFBSSxRQUFRLEVBQUUsQ0FBQztJQUN2QyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRTFDLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSTtRQUNGLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN4QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztLQUN2QztJQUVELElBQUksR0FBRyxFQUFFO1FBQ1AsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtZQUN0QixJQUFJO2dCQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLFFBQVEsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFDN0IsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQ2pCLENBQUM7Z0JBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEseUNBQXlDLENBQUMsQ0FBQzthQUNsRTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLEdBQUcsQ0FBQyxLQUFLLENBQ1AsS0FBSyxRQUFRLGlEQUFpRCxDQUMvRCxDQUFDO2FBQ0g7U0FDRjthQUFNO1lBQ0wsR0FBRyxDQUFDLEtBQUssQ0FDUCxLQUFLLFFBQVEsOERBQThELFNBQVMsR0FBRyxDQUN4RixDQUFDO1NBQ0g7S0FDRjtBQUNILENBQUMifQ==