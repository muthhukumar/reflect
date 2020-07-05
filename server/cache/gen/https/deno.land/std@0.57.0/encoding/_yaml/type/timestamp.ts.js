// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + // [1] year
    "-([0-9][0-9])" + // [2] month
    "-([0-9][0-9])$" // [3] day
);
const YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + // [1] year
    "-([0-9][0-9]?)" + // [2] month
    "-([0-9][0-9]?)" + // [3] day
    "(?:[Tt]|[ \\t]+)" + // ...
    "([0-9][0-9]?)" + // [4] hour
    ":([0-9][0-9])" + // [5] minute
    ":([0-9][0-9])" + // [6] second
    "(?:\\.([0-9]*))?" + // [7] fraction
    "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + // [8] tz [9] tz_sign [10] tz_hour
    "(?::([0-9][0-9]))?))?$" // [11] tz_minute
);
function resolveYamlTimestamp(data) {
    if (data === null)
        return false;
    if (YAML_DATE_REGEXP.exec(data) !== null)
        return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
        return true;
    return false;
}
function constructYamlTimestamp(data) {
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null)
        match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null)
        throw new Error("Date resolve error");
    // match: [1] year [2] month [3] day
    const year = +match[1];
    const month = +match[2] - 1; // JS month starts with 0
    const day = +match[3];
    if (!match[4]) {
        // no hour
        return new Date(Date.UTC(year, month, day));
    }
    // match: [4] hour [5] minute [6] second [7] fraction
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    let fraction = 0;
    if (match[7]) {
        let partFraction = match[7].slice(0, 3);
        while (partFraction.length < 3) {
            // milli-seconds
            partFraction += "0";
        }
        fraction = +partFraction;
    }
    // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute
    let delta = null;
    if (match[9]) {
        const tzHour = +match[10];
        const tzMinute = +(match[11] || 0);
        delta = (tzHour * 60 + tzMinute) * 60000; // delta in mili-seconds
        if (match[9] === "-")
            delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta)
        date.setTime(date.getTime() - delta);
    return date;
}
function representYamlTimestamp(date) {
    return date.toISOString();
}
export const timestamp = new Type("tag:yaml.org,2002:timestamp", {
    construct: constructYamlTimestamp,
    instanceOf: Date,
    kind: "scalar",
    represent: representYamlTimestamp,
    resolve: resolveYamlTimestamp,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9lbmNvZGluZy9feWFtbC90eXBlL3RpbWVzdGFtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUNqQyx5QkFBeUIsR0FBRyxXQUFXO0lBQ3ZDLGVBQWUsR0FBRyxZQUFZO0lBQzVCLGdCQUFnQixDQUFDLFVBQVU7Q0FDOUIsQ0FBQztBQUVGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxNQUFNLENBQ3RDLHlCQUF5QixHQUFHLFdBQVc7SUFDdkMsZ0JBQWdCLEdBQUcsWUFBWTtJQUMvQixnQkFBZ0IsR0FBRyxVQUFVO0lBQzdCLGtCQUFrQixHQUFHLE1BQU07SUFDM0IsZUFBZSxHQUFHLFdBQVc7SUFDN0IsZUFBZSxHQUFHLGFBQWE7SUFDL0IsZUFBZSxHQUFHLGFBQWE7SUFDL0Isa0JBQWtCLEdBQUcsZUFBZTtJQUNwQyxrQ0FBa0MsR0FBRyxrQ0FBa0M7SUFDckUsd0JBQXdCLENBQUMsaUJBQWlCO0NBQzdDLENBQUM7QUFFRixTQUFTLG9CQUFvQixDQUFDLElBQVk7SUFDeEMsSUFBSSxJQUFJLEtBQUssSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ2hDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN0RCxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDM0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFZ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