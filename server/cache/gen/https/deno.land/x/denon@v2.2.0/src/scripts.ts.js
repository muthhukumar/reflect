// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
/**
 * Build deno flags from ScriptOptions.
 * `{ allow: [ run, env ]}` -> `[--allow-run, --allow-env]`
 */
export function buildFlags(options) {
    let flags = [];
    if (options.allow) {
        if (Array.isArray(options.allow)) {
            options.allow.forEach((flag) => flags.push(`--allow-${flag}`));
        }
        else if (typeof options.allow === "object") {
            Object.entries(options.allow).map(([flag, value]) => {
                if (!value || (typeof value === "boolean" && value)) {
                    flags.push(`--allow-${flag}`);
                }
                else {
                    flags.push(`--allow-${flag}=${value}`);
                }
            });
        }
    }
    if (options.importmap) {
        flags.push("--importmap");
        flags.push(options.importmap);
    }
    if (options.lock) {
        flags.push("--lock");
        flags.push(options.lock);
    }
    if (options.log) {
        flags.push("--log-level");
        flags.push(options.log);
    }
    if (options.tsconfig) {
        flags.push("--config");
        flags.push(options.tsconfig);
    }
    if (options.cert) {
        flags.push("--cert");
        flags.push(options.cert);
    }
    if (options.inspect) {
        flags.push(`--inspect=${options.inspect}`);
    }
    if (options.inspectBrk) {
        flags.push(`--inspect-brk=${options.inspectBrk}`);
    }
    if (options.unstable) {
        flags.push("--unstable");
    }
    return flags;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub25AdjIuMi4wL3NyYy9zY3JpcHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtFQUErRTtBQW1JL0U7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxPQUFzQjtJQUMvQyxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDekIsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2pCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDaEU7YUFBTSxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDNUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDbEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsRUFBRTtvQkFDbkQsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQy9CO3FCQUFNO29CQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDeEM7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO0tBQ0Y7SUFDRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMvQjtJQUNELElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtRQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzFCO0lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN6QjtJQUNELElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUNwQixLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7SUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ25EO0lBQ0QsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1FBQ3BCLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDMUI7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMifQ==