import * as colors from './colors.ts';
const DEFAULT_MAX_AGE = 180 * 24 * 60 * 60;
function alwaysTrue() {
    return true;
}
export default function hsts(requestResponse, options = {}) {
    if ('includeSubdomains' in options) {
        console.log(colors.red('The "includeSubdomains" parameter is deprecated. Use "includeSubDomains" (with a capital D) instead.'));
    }
    if ('setIf' in options) {
        console.log(colors.red('The "setIf" parameter is deprecated. Refer to the documentation to see how to set the header conditionally.'));
    }
    if (Object.prototype.hasOwnProperty.call(options, 'maxage')) {
        throw new Error('maxage is not a supported property. Did you mean to pass "maxAge" instead of "maxage"?');
    }
    const maxAge = options.maxAge !== null && options.maxAge !== undefined ? options.maxAge : DEFAULT_MAX_AGE;
    if (typeof maxAge !== 'number') {
        throw new TypeError('HSTS must be passed a numeric maxAge parameter.');
    }
    if (maxAge < 0) {
        throw new RangeError('HSTS maxAge must be nonnegative.');
    }
    const { setIf = alwaysTrue } = options;
    if (typeof setIf !== 'function') {
        throw new TypeError('setIf must be a function.');
    }
    if (Object.prototype.hasOwnProperty.call(options, 'includeSubDomains') &&
        Object.prototype.hasOwnProperty.call(options, 'includeSubdomains')) {
        throw new Error('includeSubDomains and includeSubdomains cannot both be specified.');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const includeSubDomains = options.includeSubDomains !== false && options.includeSubdomains !== false;
    let header = `max-age=${Math.round(maxAge)}`;
    if (includeSubDomains) {
        header += '; includeSubDomains';
    }
    if (options.preload) {
        header += '; preload';
    }
    if (setIf(requestResponse)) {
        requestResponse.setResponseHeader('Strict-Transport-Security', header);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEtBQUssTUFBTSxNQUFNLGFBQWEsQ0FBQztBQUV0QyxNQUFNLGVBQWUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFTM0MsU0FBUyxVQUFVO0lBQ2pCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUsSUFBSSxDQUFFLGVBQXlDLEVBQUUsVUFBdUIsRUFBRTtJQUNoRyxJQUFJLG1CQUFtQixJQUFJLE9BQU8sRUFBRTtRQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsc0dBQXNHLENBQUMsQ0FBQyxDQUFDO0tBQ2pJO0lBRUQsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2R0FBNkcsQ0FBQyxDQUFDLENBQUM7S0FDeEk7SUFFRCxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7UUFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx3RkFBd0YsQ0FBQyxDQUFDO0tBQzNHO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztJQUMxRyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUM5QixNQUFNLElBQUksU0FBUyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7S0FDeEU7SUFDRCxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDZCxNQUFNLElBQUksVUFBVSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDMUQ7SUFFRCxNQUFNLEVBQUUsS0FBSyxHQUFHLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUN2QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRTtRQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLDJCQUEyQixDQUFDLENBQUM7S0FDbEQ7SUFFRCxJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUM7UUFDbEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxFQUNsRTtRQUNBLE1BQU0sSUFBSSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQztLQUN0RjtJQUVELDhEQUE4RDtJQUM5RCxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsS0FBSyxLQUFLLElBQUssT0FBZSxDQUFDLGlCQUFpQixLQUFLLEtBQUssQ0FBQztJQUU5RyxJQUFJLE1BQU0sR0FBRyxXQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUM3QyxJQUFJLGlCQUFpQixFQUFFO1FBQ3JCLE1BQU0sSUFBSSxxQkFBcUIsQ0FBQztLQUNqQztJQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNuQixNQUFNLElBQUksV0FBVyxDQUFDO0tBQ3ZCO0lBRUQsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDMUIsZUFBZSxDQUFDLGlCQUFpQixDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hFO0FBQ0gsQ0FBQyJ9