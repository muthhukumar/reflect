import isFunction from '../../is-function.ts';
import isString from '../../is-string.ts';
export default function (key, value) {
    if (value === false) {
        return;
    }
    if (isFunction(value)) {
        return;
    }
    if (!isString(value) || value.length === 0) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use a non-empty string.`);
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXVyaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9ydC11cmkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxRQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsTUFBTSxDQUFDLE9BQU8sV0FBVyxHQUFXLEVBQUUsS0FBYztJQUNsRCxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFDaEMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFFbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMxQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyw4QkFBOEIsR0FBRywyQkFBMkIsQ0FBQyxDQUFDO0tBQ3hGO0FBQ0gsQ0FBQztBQUFBLENBQUMifQ==