// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
import { isNegativeZero } from "../utils.ts";
const YAML_FLOAT_PATTERN = new RegExp(
// 2.5e4, 2.5 and integers
"^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" +
    // .2e4, .2
    // special case, seems not from spec
    "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" +
    // 20:59
    "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" +
    // .inf
    "|[-+]?\\.(?:inf|Inf|INF)" +
    // .nan
    "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
    if (!YAML_FLOAT_PATTERN.test(data) ||
        // Quick hack to not allow integers end with `_`
        // Probably should update regexp & check speed
        data[data.length - 1] === "_") {
        return false;
    }
    return true;
}
function constructYamlFloat(data) {
    let value = data.replace(/_/g, "").toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    const digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
    }
    if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (value === ".nan") {
        return NaN;
    }
    if (value.indexOf(":") >= 0) {
        value.split(":").forEach((v) => {
            digits.unshift(parseFloat(v));
        });
        let valueNb = 0.0;
        let base = 1;
        digits.forEach((d) => {
            valueNb += d * base;
            base *= 60;
        });
        return sign * valueNb;
    }
    return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
    if (isNaN(object)) {
        switch (style) {
            case "lowercase":
                return ".nan";
            case "uppercase":
                return ".NAN";
            case "camelcase":
                return ".NaN";
        }
    }
    else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
            case "lowercase":
                return ".inf";
            case "uppercase":
                return ".INF";
            case "camelcase":
                return ".Inf";
        }
    }
    else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
            case "lowercase":
                return "-.inf";
            case "uppercase":
                return "-.INF";
            case "camelcase":
                return "-.Inf";
        }
    }
    else if (isNegativeZero(object)) {
        return "-0.0";
    }
    const res = object.toString(10);
    // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
    return (Object.prototype.toString.call(object) === "[object Number]" &&
        (object % 1 !== 0 || isNegativeZero(object)));
}
export const float = new Type("tag:yaml.org,2002:float", {
    construct: constructYamlFloat,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isFloat,
    represent: representYamlFloat,
    resolve: resolveYamlFloat,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvYXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41Ny4wL2VuY29kaW5nL195YW1sL3R5cGUvZmxvYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLE9BQU8sRUFBZ0IsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxjQUFjLEVBQU8sTUFBTSxhQUFhLENBQUM7QUFFbEQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLE1BQU07QUFDbkMsMEJBQTBCO0FBQzFCLGdFQUFnRTtJQUM5RCxXQUFXO0lBQ1gsb0NBQW9DO0lBQ3BDLGlDQUFpQztJQUNqQyxRQUFRO0lBQ1IsK0NBQStDO0lBQy9DLE9BQU87SUFDUCwwQkFBMEI7SUFDMUIsT0FBTztJQUNQLHVCQUF1QixDQUMxQixDQUFDO0FBRUYsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFZO0lBQ3BDLElBQ0UsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzlCLGdEQUFnRDtRQUNoRCw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUM3QjtRQUNBLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQVk7SUFDdEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDakQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxNQUFNLE1BQU0sR0FBYSxF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