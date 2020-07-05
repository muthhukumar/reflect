import dasherize from './dasherize/index.js';
import checkDirective from './check-directive/index.ts';
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
export default function (options) {
    if (!isObject(options)) {
        throw new Error('csp must be called with an object argument. See the documentation.');
    }
    const { directives } = options;
    if (!isObject(directives) || Object.keys(directives).length === 0) {
        throw new Error('csp must have at least one directive under the "directives" key. See the documentation.');
    }
    Object.keys(directives).forEach((directiveKey) => {
        const typedKey = directiveKey;
        checkDirective(dasherize(directiveKey), directives[typedKey], options);
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxzQkFBc0IsQ0FBQztBQUU3QyxPQUFPLGNBQWMsTUFBTSw0QkFBNEIsQ0FBQztBQUd4RCxTQUFTLFFBQVEsQ0FBRSxLQUFjO0lBQy9CLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0FBQ3JFLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxXQUFXLE9BQW1CO0lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO0tBQ3ZGO0lBRUQsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUUvQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqRSxNQUFNLElBQUksS0FBSyxDQUFDLHlGQUF5RixDQUFDLENBQUM7S0FDNUc7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFO1FBQy9DLE1BQU0sUUFBUSxHQUFHLFlBQW1DLENBQUM7UUFDckQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekUsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBQUEsQ0FBQyJ9