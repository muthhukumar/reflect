import isFunction from './is-function.ts';
import isString from './is-string.ts';
export default function parseDynamicDirectives(directives, functionArgs) {
    const result = {};
    Object.keys(directives).forEach((key) => {
        const typedKey = key;
        const value = directives[typedKey];
        if (Array.isArray(value)) {
            result[typedKey] = value.map((element) => {
                if (isFunction(element)) {
                    return element(...functionArgs);
                }
                else {
                    return element;
                }
            });
        }
        else if (isFunction(value)) {
            result[typedKey] = value(...functionArgs);
        }
        else if (value === true || isString(value)) {
            result[typedKey] = value;
        }
    });
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtZHluYW1pYy1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFyc2UtZHluYW1pYy1kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBR3RDLE1BQU0sQ0FBQyxPQUFPLFVBQVUsc0JBQXNCLENBQUUsVUFBK0IsRUFBRSxZQUF3QztJQUN2SCxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO0lBRXBDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdEMsTUFBTSxRQUFRLEdBQUcsR0FBZ0MsQ0FBQztRQUNsRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbkMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN2QixPQUFPLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO2lCQUNqQztxQkFBTTtvQkFDTCxPQUFPLE9BQU8sQ0FBQztpQkFDaEI7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU0sSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO1NBQzNDO2FBQU0sSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIn0=