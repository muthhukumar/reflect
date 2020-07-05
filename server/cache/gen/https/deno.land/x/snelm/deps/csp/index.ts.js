import camelize from './lib/camelize/index.js';
import cspBuilder from './lib/content-security-policy-builder/index.ts';
import Bowser from './lib/bowser/src/bowser.js';
import isFunction from './lib/is-function.ts';
import checkOptions from './lib/check-options/index.ts';
import containsFunction from './lib/contains-function.ts';
import getHeaderKeysForBrowser from './lib/get-header-keys-for-browser.ts';
import transformDirectivesForBrowser from './lib/transform-directives-for-browser.ts';
import parseDynamicDirectives from './lib/parse-dynamic-directives.ts';
import config from './lib/config.ts';
export default function csp(requestResponse, options) {
    if (options === undefined) {
        return;
    }
    checkOptions(options);
    const originalDirectives = camelize(options.directives || {});
    const directivesAreDynamic = containsFunction(originalDirectives);
    const shouldBrowserSniff = options.browserSniff !== false;
    if (shouldBrowserSniff) {
        const userAgent = requestResponse.getRequestHeader('user-agent');
        let browser;
        if (userAgent) {
            browser = Bowser.getParser(userAgent);
        }
        else {
            browser = undefined;
        }
        let headerKeys;
        if (options.setAllHeaders || !userAgent) {
            headerKeys = config.allHeaders;
        }
        else {
            headerKeys = getHeaderKeysForBrowser(browser, options);
        }
        if (headerKeys.length === 0) {
            return;
        }
        let directives = transformDirectivesForBrowser(browser, originalDirectives);
        if (directivesAreDynamic) {
            directives = parseDynamicDirectives(directives, [requestResponse]);
        }
        const policyString = cspBuilder({ directives: directives });
        headerKeys.forEach((headerKey) => {
            if (isFunction(options.reportOnly) && options.reportOnly(requestResponse) ||
                !isFunction(options.reportOnly) && options.reportOnly) {
                headerKey += '-Report-Only';
            }
            requestResponse.setResponseHeader(headerKey, policyString);
        });
    }
    else {
        const headerKeys = options.setAllHeaders ? config.allHeaders : ['Content-Security-Policy'];
        const directives = parseDynamicDirectives(originalDirectives, [requestResponse]);
        const policyString = cspBuilder({ directives });
        if (isFunction(options.reportOnly) && options.reportOnly(requestResponse) ||
            !isFunction(options.reportOnly) && options.reportOnly) {
            headerKeys.forEach((headerKey) => {
                requestResponse.setResponseHeader(`${headerKey}-Report-Only`, policyString);
            });
        }
        else {
            headerKeys.forEach((headerKey) => {
                requestResponse.setResponseHeader(headerKey, policyString);
            });
        }
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFFBQVEsTUFBTSx5QkFBeUIsQ0FBQztBQUMvQyxPQUFPLFVBQVUsTUFBTSxnREFBZ0QsQ0FBQztBQUN4RSxPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQztBQUdoRCxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUN4RCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sdUJBQXVCLE1BQU0sc0NBQXNDLENBQUM7QUFDM0UsT0FBTyw2QkFBNkIsTUFBTSwyQ0FBMkMsQ0FBQztBQUN0RixPQUFPLHNCQUFzQixNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFDO0FBR3JDLE1BQU0sQ0FBQyxPQUFPLFVBQVUsR0FBRyxDQUFFLGVBQXlDLEVBQUUsT0FBbUI7SUFDekYsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQ3pCLE9BQU87S0FDUjtJQUNELFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV0QixNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlELE1BQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNsRSxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxZQUFZLEtBQUssS0FBSyxDQUFDO0lBRTFELElBQUksa0JBQWtCLEVBQUU7UUFDdEIsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWpFLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSSxTQUFTLEVBQUU7WUFDYixPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN2QzthQUFNO1lBQ0wsT0FBTyxHQUFHLFNBQVMsQ0FBQztTQUNyQjtRQUVELElBQUksVUFBb0IsQ0FBQztRQUN6QixJQUFJLE9BQU8sQ0FBQyxhQUFhLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDdkMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7U0FDaEM7YUFBTTtZQUNMLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEQ7UUFFRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE9BQU87U0FDUjtRQUVELElBQUksVUFBVSxHQUFHLDZCQUE2QixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVFLElBQUksb0JBQW9CLEVBQUU7WUFDeEIsVUFBVSxHQUFHLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7U0FDcEU7UUFFRCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBOEIsRUFBRSxDQUFDLENBQUM7UUFFaEYsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQy9CLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztnQkFDckUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pELFNBQVMsSUFBSSxjQUFjLENBQUM7YUFDN0I7WUFDRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO0tBRUo7U0FBTTtRQUNMLE1BQU0sVUFBVSxHQUFzQixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFOUcsTUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFaEQsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBQ3JFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3pELFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDL0IsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsU0FBUyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDOUUsQ0FBQyxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUMvQixlQUFlLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzdELENBQUMsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtBQUNILENBQUM7QUFBQSxDQUFDIn0=