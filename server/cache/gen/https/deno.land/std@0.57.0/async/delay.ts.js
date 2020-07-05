// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/* Resolves after the given number of milliseconds. */
export function delay(ms) {
    return new Promise((res) => setTimeout(() => {
        res();
    }, ms));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2FzeW5jL2RlbGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxzREFBc0Q7QUFDdEQsTUFBTSxVQUFVLEtBQUssQ0FBQyxFQUFVO0lBQzlCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQVUsRUFBRSxDQUNqQyxVQUFVLENBQUMsR0FBUyxFQUFFO1FBQ3BCLEdBQUcsRUFBRSxDQUFDO0lBQ1IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNQLENBQUM7QUFDSixDQUFDIn0=