// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
const { PermissionDenied } = Deno.errors;
function getPermissionString(descriptors) {
    return descriptors.length
        ? `  ${descriptors
            .map((pd) => {
            switch (pd.name) {
                case "read":
                case "write":
                    return pd.path
                        ? `--allow-${pd.name}=${pd.path}`
                        : `--allow-${pd.name}`;
                case "net":
                    return pd.url
                        ? `--allow-${pd.name}=${pd.url}`
                        : `--allow-${pd.name}`;
                default:
                    return `--allow-${pd.name}`;
            }
        })
            .join("\n  ")}`
        : "";
}
export async function grant(descriptor, ...descriptors) {
    const result = [];
    descriptors = Array.isArray(descriptor)
        ? descriptor
        : [descriptor, ...descriptors];
    for (const descriptor of descriptors) {
        let state = (await Deno.permissions.query(descriptor)).state;
        if (state === "prompt") {
            state = (await Deno.permissions.request(descriptor)).state;
        }
        if (state === "granted") {
            result.push(descriptor);
        }
    }
    return result.length ? result : undefined;
}
export async function grantOrThrow(descriptor, ...descriptors) {
    const denied = [];
    descriptors = Array.isArray(descriptor)
        ? descriptor
        : [descriptor, ...descriptors];
    for (const descriptor of descriptors) {
        const { state } = await Deno.permissions.request(descriptor);
        if (state !== "granted") {
            denied.push(descriptor);
        }
    }
    if (denied.length) {
        throw new PermissionDenied(`The following permissions have not been granted:\n${getPermissionString(denied)}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9wZXJtaXNzaW9ucy9tb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFFekMsU0FBUyxtQkFBbUIsQ0FBQyxXQUF3QztJQUNuRSxPQUFPLFdBQVcsQ0FBQyxNQUFNO1FBQ3ZCLENBQUMsQ0FBQyxLQUFLLFdBQVc7YUFDYixHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNWLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRTtnQkFDZixLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLE9BQU87b0JBQ1YsT0FBTyxFQUFFLENBQUMsSUFBSTt3QkFDWixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUU7d0JBQ2pDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0IsS0FBSyxLQUFLO29CQUNSLE9BQU8sRUFBRSxDQUFDLEdBQUc7d0JBQ1gsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO3dCQUNoQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNCO29CQUNFLE9BQU8sV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDL0I7UUFDSCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNULENBQUM7QUFnQ0QsTUFBTSxDQUFDLEtBQUssVUFBVSxLQUFLLENBQ3pCLFVBQW1FLEVBQ25FLEdBQUcsV0FBd0M7SUFFM0MsTUFBTSxNQUFNLEdBQWdDLEVBQUUsQ0FBQztJQUMvQyxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDckMsQ0FBQyxDQUFDLFVBQVU7UUFDWixDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUNqQyxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtRQUNwQyxJQUFJLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDN0QsSUFBSSxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQ3RCLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDNUQ7UUFDRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN6QjtLQUNGO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUM1QyxDQUFDO0FBd0JELE1BQU0sQ0FBQyxLQUFLLFVBQVUsWUFBWSxDQUNoQyxVQUFtRSxFQUNuRSxHQUFHLFdBQXdDO0lBRTNDLE1BQU0sTUFBTSxHQUFnQyxFQUFFLENBQUM7SUFDL0MsV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxVQUFVO1FBQ1osQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDakMsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7UUFDcEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDekI7S0FDRjtJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNqQixNQUFNLElBQUksZ0JBQWdCLENBQ3hCLHFEQUFxRCxtQkFBbUIsQ0FDdEUsTUFBTSxDQUNQLEVBQUUsQ0FDSixDQUFDO0tBQ0g7QUFDSCxDQUFDIn0=