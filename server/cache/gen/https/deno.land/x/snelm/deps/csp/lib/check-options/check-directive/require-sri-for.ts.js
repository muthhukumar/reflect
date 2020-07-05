import config from '../../config.ts';
import isFunction from '../../is-function.ts';
export default function requireSriForCheck(key, value) {
    if (!Array.isArray(value)) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use an array of strings.`);
    }
    if (value.length === 0) {
        throw new Error(`${key} must have at least one value. To require nothing, omit the directive.`);
    }
    value.forEach((expression) => {
        if (isFunction(expression)) {
            return;
        }
        if (config.requireSriForValues.indexOf(expression) === -1) {
            throw new Error(`"${expression}" is not a valid ${key} value. Remove it.`);
        }
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZS1zcmktZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVxdWlyZS1zcmktZm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFDO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFDO0FBRTlDLE1BQU0sQ0FBQyxPQUFPLFVBQVUsa0JBQWtCLENBQUUsR0FBVyxFQUFFLEtBQWM7SUFDckUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOEJBQThCLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztLQUN6RjtJQUVELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsd0VBQXdFLENBQUMsQ0FBQztLQUNqRztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtRQUMzQixJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV2QyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLFVBQVUsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztTQUM1RTtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUFBLENBQUMifQ==