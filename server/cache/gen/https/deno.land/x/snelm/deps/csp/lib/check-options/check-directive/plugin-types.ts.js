import config from '../../config.ts';
import isFunction from '../../is-function.ts';
const notAllowed = ['self', "'self'"].concat(config.unsafes);
export default function pluginTypesCheck(key, value) {
    if (!Array.isArray(value)) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use an array of strings.`);
    }
    if (value.length === 0) {
        throw new Error(`${key} must have at least one value. To block everything, set ${key} to ["'none'"].`);
    }
    value.forEach((pluginType) => {
        if (!pluginType) {
            throw new Error(`"${pluginType}" is not a valid plugin type. Only non-empty strings are allowed.`);
        }
        if (isFunction(pluginType)) {
            return;
        }
        pluginType = pluginType.valueOf();
        if (typeof pluginType !== 'string' || pluginType.length === 0) {
            throw new Error(`"${pluginType}" is not a valid plugin type. Only non-empty strings are allowed.`);
        }
        if (notAllowed.indexOf(pluginType) !== -1) {
            throw new Error(`"${pluginType}" does not make sense in ${key}. Remove it.`);
        }
        if (config.mustQuote.indexOf(pluginType) !== -1) {
            throw new Error(`"${pluginType}" must be quoted in ${key}. Change it to "'${pluginType}'" in your source list. Force this by enabling loose mode.`);
        }
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLXR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGx1Z2luLXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFDO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFDO0FBRTlDLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFN0QsTUFBTSxDQUFDLE9BQU8sVUFBVSxnQkFBZ0IsQ0FBRSxHQUFXLEVBQUUsS0FBYztJQUNuRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyw4QkFBOEIsR0FBRyw0QkFBNEIsQ0FBQyxDQUFDO0tBQ3pGO0lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRywyREFBMkQsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3hHO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1FBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksVUFBVSxtRUFBbUUsQ0FBQyxDQUFDO1NBQ3BHO1FBRUQsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdkMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVsQyxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3RCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksVUFBVSxtRUFBbUUsQ0FBQyxDQUFDO1NBQ3BHO1FBRUQsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxVQUFVLDRCQUE0QixHQUFHLGNBQWMsQ0FBQyxDQUFDO1NBQzlFO1FBRUQsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksVUFBVSx1QkFBdUIsR0FBRyxvQkFBb0IsVUFBVSw0REFBNEQsQ0FBQyxDQUFDO1NBQ3JKO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBQUEsQ0FBQyJ9