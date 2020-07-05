// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
/**
 * Regex to test if string matches version format
 */
const reVersion = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;
/**
 * Parse Deno.args into a flag map (`Args`)
 * to be handled by th CLI.
 */
export function parseArgs(args = Deno.args) {
    if (args[0] === "--") {
        args = args.slice(1);
    }
    const flags = {
        help: false,
        version: false,
        init: undefined,
        upgrade: undefined,
        config: undefined,
        cmd: [],
    };
    if ((args.includes("--config") || args.includes("-c")) &&
        args.length > 1) {
        flags.config = args[1];
        args = args.slice(2);
    }
    if (args.includes("--help") || args.includes("-h")) {
        flags.help = true;
        args = args.slice(1);
    }
    if (args.includes("--version") || args.includes("-v")) {
        flags.version = true;
        args = args.slice(1);
    }
    if (args.includes("--init") || args.includes("-i")) {
        const index = args.includes("--init")
            ? args.indexOf("--init")
            : args.indexOf("-i");
        const next = args[index + 1];
        if (next) {
            flags.init = next;
            args = args.slice(2);
        }
        else {
            flags.init = "denon.json";
            args = args.slice(1);
        }
    }
    if (args.includes("--upgrade") || args.includes("-u")) {
        const index = args.includes("--upgrade")
            ? args.indexOf("--upgrade")
            : args.indexOf("-u");
        const next = args[index + 1];
        if (next && (next === "master" || reVersion.test(next))) {
            flags.upgrade = !next.startsWith("v") || next !== "master"
                ? "v" + next
                : next;
            args = args.slice(2);
        }
        else {
            flags.upgrade = "master";
            args = args.slice(1);
        }
    }
    flags.cmd = args;
    return flags;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub25AdjIuMi4wL3NyYy9hcmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtFQUErRTtBQUkvRTs7R0FFRztBQUNILE1BQU0sU0FBUyxHQUFHLDRCQUE0QixDQUFDO0FBaUIvQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLE9BQWlCLElBQUksQ0FBQyxJQUFJO0lBQ2xELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNwQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QjtJQUVELE1BQU0sS0FBSyxHQUFTO1FBQ2xCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLEdBQUcsRUFBRSxFQUFFO0tBQ1IsQ0FBQztJQUVGLElBQ0UsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2Y7UUFDQSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QjtJQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xELEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3RCO0lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDckQsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEI7SUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNsRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUU3QixJQUFJLElBQUksRUFBRTtZQUNSLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RCO2FBQU07WUFDTCxLQUFLLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztZQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QjtLQUNGO0lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDckQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDdEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUN2RCxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssUUFBUTtnQkFDeEQsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJO2dCQUNaLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QjthQUFNO1lBQ0wsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEI7S0FDRjtJQUVELEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2pCLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyJ9