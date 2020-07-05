// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log, reset, bold, blue, yellow, red, LogLevels, BaseHandler, } from "../deps.ts";
/**
 * Logger tag
 */
const TAG = "[denon]";
const DEBUG_LEVEL = "DEBUG";
const QUIET_LEVEL = "ERROR";
const DEFAULT_LEVEL = "INFO";
const DEFAULT_HANDLER = "format_fn";
/**
 * Deno logger, but slightly better.
 */
export class ConsoleHandler extends BaseHandler {
    format(record) {
        let msg = "";
        switch (record.level) {
            case LogLevels.INFO:
                msg += blue(TAG);
                break;
            case LogLevels.WARNING:
                msg += yellow(TAG);
                break;
            case LogLevels.ERROR:
                msg += red(TAG);
                break;
            case LogLevels.CRITICAL:
                msg += bold(red(TAG));
                break;
            default:
                break;
        }
        msg += ` ${reset(record.msg)}`;
        for (const arg of record.args) {
            if (arg instanceof Object) {
                msg += ` ${JSON.stringify(arg)}`;
            }
            else {
                msg += ` ${String(arg)}`;
            }
        }
        return msg;
    }
    log(msg) {
        console.log(msg);
    }
}
/**
 * Determines the log level based on configuration
 * preferences.
 */
function logLevel(config) {
    let level = DEFAULT_LEVEL;
    if (config.debug)
        level = DEBUG_LEVEL;
    if (config.quiet)
        level = QUIET_LEVEL;
    return level;
}
/**
 * Modify default deno logger with configurable
 * log level.
 */
export async function setupLog(config = {}) {
    const level = config ? logLevel(config) : DEBUG_LEVEL;
    await log.setup({
        handlers: {
            [DEFAULT_HANDLER]: new ConsoleHandler(DEBUG_LEVEL),
        },
        loggers: {
            default: {
                level,
                handlers: [DEFAULT_HANDLER],
            },
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQveC9kZW5vbkB2Mi4yLjAvc3JjL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFFL0UsT0FBTyxFQUNMLEdBQUcsRUFDSCxLQUFLLEVBQ0wsSUFBSSxFQUNKLElBQUksRUFDSixNQUFNLEVBQ04sR0FBRyxFQUVILFNBQVMsRUFDVCxXQUFXLEdBRVosTUFBTSxZQUFZLENBQUM7QUFtQnBCOztHQUVHO0FBQ0gsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDO0FBRXRCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQztBQUM1QixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7QUFDNUIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDO0FBRTdCLE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQztBQUVwQzs7R0FFRztBQUNILE1BQU0sT0FBTyxjQUFlLFNBQVEsV0FBVztJQUM3QyxNQUFNLENBQUMsTUFBaUI7UUFDdEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsUUFBUSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ3BCLEtBQUssU0FBUyxDQUFDLElBQUk7Z0JBQ2pCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLE1BQU07WUFDUixLQUFLLFNBQVMsQ0FBQyxPQUFPO2dCQUNwQixHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNO1lBQ1IsS0FBSyxTQUFTLENBQUMsS0FBSztnQkFDbEIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsTUFBTTtZQUNSLEtBQUssU0FBUyxDQUFDLFFBQVE7Z0JBQ3JCLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDUjtnQkFDRSxNQUFNO1NBQ1Q7UUFFRCxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFFL0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQzdCLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtnQkFDekIsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQ2xDO2lCQUFNO2dCQUNMLEdBQUcsSUFBSSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQzFCO1NBQ0Y7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBVztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxRQUFRLENBQUMsTUFBaUI7SUFDakMsSUFBSSxLQUFLLEdBQWlCLGFBQWEsQ0FBQztJQUN4QyxJQUFJLE1BQU0sQ0FBQyxLQUFLO1FBQUUsS0FBSyxHQUFHLFdBQVcsQ0FBQztJQUN0QyxJQUFJLE1BQU0sQ0FBQyxLQUFLO1FBQUUsS0FBSyxHQUFHLFdBQVcsQ0FBQztJQUN0QyxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFFBQVEsQ0FBQyxTQUFvQixFQUFFO0lBQ25ELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDdEQsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ2QsUUFBUSxFQUFFO1lBQ1IsQ0FBQyxlQUFlLENBQUMsRUFBRSxJQUFJLGNBQWMsQ0FBQyxXQUFXLENBQUM7U0FDbkQ7UUFDRCxPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUU7Z0JBQ1AsS0FBSztnQkFDTCxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7YUFDNUI7U0FDRjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMifQ==