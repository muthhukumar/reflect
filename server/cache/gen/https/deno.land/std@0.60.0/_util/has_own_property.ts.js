// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/**
 * Determines whether an object has a property with the specified name.
 * Avoid calling prototype builtin `hasOwnProperty` for two reasons:
 *
 * 1. `hasOwnProperty` is defined on the object as something else:
 *
 *      const options = {
 *        ending: 'utf8',
 *        hasOwnProperty: 'foo'
 *      };
 *      options.hasOwnProperty('ending') // throws a TypeError
 *
 * 2. The object doesn't inherit from `Object.prototype`:
 *
 *       const options = Object.create(null);
 *       options.ending = 'utf8';
 *       options.hasOwnProperty('ending'); // throws a TypeError
 *
 * @param obj A Object.
 * @param v A property name.
 * @see https://eslint.org/docs/rules/no-prototype-builtins
 */
export function hasOwnProperty(obj, v) {
    if (obj == null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(obj, v);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzX293bl9wcm9wZXJ0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhhc19vd25fcHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFJLEdBQU0sRUFBRSxDQUFjO0lBQ3RELElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtRQUNmLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyJ9