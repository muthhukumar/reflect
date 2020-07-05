// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/* Resolves after the given number of milliseconds. */
export function delay(ms) {
    return new Promise((res) => setTimeout(() => {
        res();
    }, ms));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsc0RBQXNEO0FBQ3RELE1BQU0sVUFBVSxLQUFLLENBQUMsRUFBVTtJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFVLEVBQUUsQ0FDakMsVUFBVSxDQUFDLEdBQVMsRUFBRTtRQUNwQixHQUFHLEVBQUUsQ0FBQztJQUNSLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDUCxDQUFDO0FBQ0osQ0FBQyJ9