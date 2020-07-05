import crossDomain from "./deps/crossdomain/index.ts";
import csp from "./deps/csp/index.ts";
import dnsPrefetchControl from "./deps/dns-prefetch-control/index.ts";
import dontSniffMimetype from "./deps/dont-sniff-mimetype/index.ts";
import expectCt from "./deps/expect-ct/index.ts";
import featurePolicy from "./deps/feature-policy/index.ts";
import frameguard from "./deps/frameguard/index.ts";
import hidePoweredBy from "./deps/hide-powered-by/index.ts";
import hsts from "./deps/hsts/index.ts";
import ieNoOpen from "./deps/ienoopen/index.ts";
import referrerPolicy from "./deps/referrer-policy/index.ts";
import xssProtection from "./deps/x-xss-protection/index.ts";
import abc from "./frameworks/abc.ts";
import alosaur from "./frameworks/alosaur.ts";
import aqua from "./frameworks/aqua.ts";
import attain from "./frameworks/attain.ts";
import oak from "./frameworks/oak.ts";
import pogo from "./frameworks/pogo.ts";
export class Snelm {
    constructor(frameworkName, options = {}) {
        this._frameworkName = frameworkName;
        this._options = options;
        switch (this._frameworkName) {
            case "abc":
                this._fameworkLib = abc;
                break;
            case "alosaur":
                this._fameworkLib = alosaur;
                break;
            case "aqua":
                this._fameworkLib = aqua;
                break;
            case "attain":
                this._fameworkLib = attain;
                break;
            case "oak":
                this._fameworkLib = oak;
                break;
            case "pogo":
                this._fameworkLib = pogo;
                break;
        }
    }
    snelm(request, response) {
        const requestResponse = new this._fameworkLib(request, response);
        if (this._options.crossDomain !== null)
            crossDomain(requestResponse, this._options.crossDomain);
        if (this._options.csp !== null)
            csp(requestResponse, this._options.csp);
        if (this._options.dnsPrefetchControl !== null)
            dnsPrefetchControl(requestResponse, this._options.dnsPrefetchControl);
        if (this._options.dontSniffMimetype !== null)
            dontSniffMimetype(requestResponse);
        if (this._options.expectCt !== null)
            expectCt(requestResponse, this._options.expectCt);
        if (this._options.featurePolicy !== null)
            featurePolicy(requestResponse, this._options.featurePolicy);
        if (this._options.frameguard !== null)
            frameguard(requestResponse, this._options.frameguard);
        if (this._options.hidePoweredBy !== null)
            hidePoweredBy(requestResponse, this._options.hidePoweredBy);
        if (this._options.hsts !== null)
            hsts(requestResponse, this._options.hsts);
        if (this._options.ieNoOpen !== null)
            ieNoOpen(requestResponse);
        if (this._options.referrerPolicy !== null)
            referrerPolicy(requestResponse, this._options.referrerPolicy);
        if (this._options.xssProtection !== null)
            xssProtection(requestResponse, this._options.xssProtection);
        return requestResponse.response;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8sR0FBRyxNQUFNLHFCQUFxQixDQUFDO0FBQ3RDLE9BQU8sa0JBQWtCLE1BQU0sc0NBQXNDLENBQUM7QUFDdEUsT0FBTyxpQkFBaUIsTUFBTSxxQ0FBcUMsQ0FBQztBQUNwRSxPQUFPLFFBQVEsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLGFBQWEsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRCxPQUFPLGFBQWEsTUFBTSxpQ0FBaUMsQ0FBQztBQUM1RCxPQUFPLElBQUksTUFBTSxzQkFBc0IsQ0FBQztBQUN4QyxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRCxPQUFPLGNBQWMsTUFBTSxpQ0FBaUMsQ0FBQztBQUM3RCxPQUFPLGFBQWEsTUFBTSxrQ0FBa0MsQ0FBQztBQUU3RCxPQUFPLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQTtBQUNyQyxPQUFPLE9BQU8sTUFBTSx5QkFBeUIsQ0FBQTtBQUM3QyxPQUFPLElBQUksTUFBTSxzQkFBc0IsQ0FBQTtBQUN2QyxPQUFPLE1BQU0sTUFBTSx3QkFBd0IsQ0FBQTtBQUMzQyxPQUFPLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQTtBQUNyQyxPQUFPLElBQUksTUFBTSxzQkFBc0IsQ0FBQTtBQUV2QyxNQUFNLE9BQU8sS0FBSztJQU1qQixZQUFZLGFBQXFCLEVBQUUsVUFBZSxFQUFFO1FBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBRXhCLFFBQVEsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUM1QixLQUFLLEtBQUs7Z0JBQ1QsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7Z0JBQ3hCLE1BQU07WUFFUCxLQUFLLFNBQVM7Z0JBQ2IsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7Z0JBQzVCLE1BQU07WUFFUCxLQUFLLE1BQU07Z0JBQ1YsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLE1BQU07WUFFUCxLQUFLLFFBQVE7Z0JBQ1osSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQzNCLE1BQU07WUFFUCxLQUFLLEtBQUs7Z0JBQ1QsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7Z0JBQ3hCLE1BQU07WUFFUCxLQUFLLE1BQU07Z0JBQ1YsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLE1BQU07U0FDUDtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBWSxFQUFFLFFBQWE7UUFFdkMsTUFBTSxlQUFlLEdBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0RSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxLQUFLLElBQUk7WUFDckMsV0FBVyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXpELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssSUFBSTtZQUM3QixHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFekMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixLQUFLLElBQUk7WUFDNUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV2RSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEtBQUssSUFBSTtZQUMzQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVwQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLElBQUk7WUFDbEMsUUFBUSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5ELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEtBQUssSUFBSTtZQUN2QyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUE7UUFFNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsS0FBSyxJQUFJO1lBQ3BDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV2RCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxLQUFLLElBQUk7WUFDdkMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTdELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSTtZQUM5QixJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxJQUFJO1lBQ2xDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxLQUFLLElBQUk7WUFDeEMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRS9ELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEtBQUssSUFBSTtZQUN2QyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUE7UUFFNUQsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDO0lBQ2pDLENBQUM7Q0FDRCJ9