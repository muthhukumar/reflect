import config from '../../config.ts';
import isFunction from '../../is-function.ts';
export default function sandboxCheck(key, value) {
    if (value === false) {
        return;
    }
    if (value === true) {
        return;
    }
    if (!Array.isArray(value)) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use an array of strings or \`true\`.`);
    }
    if (value.length === 0) {
        throw new Error(`${key} must have at least one value. To block everything, set ${key} to \`true\`.`);
    }
    value.forEach((expression) => {
        if (isFunction(expression)) {
            return;
        }
        if (config.sandboxDirectives.indexOf(expression) === -1) {
            throw new Error(`"${expression}" is not a valid ${key} directive. Remove it.`);
        }
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuZGJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNhbmRib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUM7QUFDckMsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFFOUMsTUFBTSxDQUFDLE9BQU8sVUFBVSxZQUFZLENBQUUsR0FBVyxFQUFFLEtBQWM7SUFDL0QsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO1FBQUUsT0FBTztLQUFFO0lBQ2hDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUFFLE9BQU87S0FBRTtJQUUvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyw4QkFBOEIsR0FBRyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQ3JHO0lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRywyREFBMkQsR0FBRyxlQUFlLENBQUMsQ0FBQztLQUN0RztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtRQUMzQixJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV2QyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDdkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLFVBQVUsb0JBQW9CLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztTQUNoRjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUFBLENBQUMifQ==