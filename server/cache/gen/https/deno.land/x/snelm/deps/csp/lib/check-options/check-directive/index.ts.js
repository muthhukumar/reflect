import config from '../../config.ts';
import boolean from './boolean.ts';
import pluginTypes from './plugin-types.ts';
import reportUri from './report-uri.ts';
import requireSriFor from './require-sri-for.ts';
import sandbox from './sandbox.ts';
import sourceList from './source-list.ts';
const checkers = {
    boolean,
    pluginTypes,
    reportUri,
    requireSriFor,
    sandbox,
    sourceList,
};
export default function checkDirective(key, value, options) {
    if (options.loose) {
        return;
    }
    if (!Object.prototype.hasOwnProperty.call(config.directives, key)) {
        throw new Error(`"${key}" is an invalid directive. See the documentation for the supported list. Force this by enabling loose mode.`);
    }
    // This cast is safe thanks to the above check.
    const directiveType = config.directives[key].type;
    checkers[directiveType](key, value);
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQztBQUVyQyxPQUFPLE9BQU8sTUFBTSxjQUFjLENBQUM7QUFDbkMsT0FBTyxXQUFXLE1BQU0sbUJBQW1CLENBQUM7QUFDNUMsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUM7QUFDeEMsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxPQUFPLE1BQU0sY0FBYyxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBUTFDLE1BQU0sUUFBUSxHQUFhO0lBQ3pCLE9BQU87SUFDUCxXQUFXO0lBQ1gsU0FBUztJQUNULGFBQWE7SUFDYixPQUFPO0lBQ1AsVUFBVTtDQUNYLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWMsQ0FBRSxHQUFXLEVBQUUsS0FBYyxFQUFFLE9BQW1CO0lBQ3RGLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUFFLE9BQU87S0FBRTtJQUU5QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUU7UUFDakUsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsNkdBQTZHLENBQUMsQ0FBQztLQUN2STtJQUVELCtDQUErQztJQUMvQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQXFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDcEYsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBQUEsQ0FBQyJ9