function transformDirectivesForPreCsp1Firefox(directives, basePolicy) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = Object.assign({}, basePolicy);
    // Copy `connectSrc` to `xhrSrc`
    const { connectSrc } = directives;
    if (connectSrc) {
        result.xhrSrc = connectSrc;
    }
    // Copy everything else
    Object.keys(directives).forEach((key) => {
        if (key !== 'connectSrc') {
            result[key] = directives[key];
        }
    });
    // Rename `scriptSrc` values `unsafe-inline` and `unsafe-eval`
    const { scriptSrc } = directives;
    if (scriptSrc) {
        const optionsValues = [];
        if (scriptSrc.indexOf("'unsafe-inline'") !== -1) {
            optionsValues.push('inline-script');
        }
        if (scriptSrc.indexOf("'unsafe-eval'") !== -1) {
            optionsValues.push('eval-script');
        }
        if (optionsValues.length !== 0) {
            result.options = optionsValues;
        }
    }
    return result;
}
export default function transformDirectivesForBrowser(browser, directives) {
    // For now, Firefox is the only browser that needs to be transformed.
    if (!browser || browser.getBrowserName() !== 'Firefox') {
        return directives;
    }
    const osName = browser.getOSName();
    if (osName === 'iOS') {
        return directives;
    }
    const browserVersion = parseFloat(browser.getBrowserVersion());
    if (osName === 'Android' && browserVersion < 25 ||
        browser.getPlatformType(true) === 'mobile' && browserVersion < 32) {
        return transformDirectivesForPreCsp1Firefox(directives, { defaultSrc: ['*'] });
    }
    else if (browserVersion >= 4 && browserVersion < 23) {
        const basePolicy = {};
        if (browserVersion < 5) {
            basePolicy.allow = ['*'];
            if (directives.defaultSrc) {
                basePolicy.allow = directives.defaultSrc;
                directives = Object.assign({}, directives);
                delete directives.defaultSrc;
            }
        }
        else {
            basePolicy.defaultSrc = ['*'];
        }
        return transformDirectivesForPreCsp1Firefox(directives, basePolicy);
    }
    else {
        return directives;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLWRpcmVjdGl2ZXMtZm9yLWJyb3dzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm0tZGlyZWN0aXZlcy1mb3ItYnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLG9DQUFvQyxDQUFFLFVBQXNCLEVBQUUsVUFBc0I7SUFDM0YsOERBQThEO0lBQzlELE1BQU0sTUFBTSxHQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRWxELGdDQUFnQztJQUNoQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLElBQUksVUFBVSxFQUFFO1FBQ2QsTUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7S0FDNUI7SUFFRCx1QkFBdUI7SUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUN0QyxJQUFJLEdBQUcsS0FBSyxZQUFZLEVBQUU7WUFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUF1QixDQUFDLENBQUM7U0FDbkQ7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILDhEQUE4RDtJQUM5RCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLElBQUksU0FBUyxFQUFFO1FBQ2IsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBRXpCLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQy9DLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDN0MsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNuQztRQUVELElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7U0FDaEM7S0FDRjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLDZCQUE2QixDQUNuRCxPQUFZLEVBQ1osVUFBc0I7SUFFdEIscUVBQXFFO0lBQ3JFLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRSxLQUFLLFNBQVMsRUFBRTtRQUN0RCxPQUFPLFVBQVUsQ0FBQztLQUNuQjtJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUVuQyxJQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUU7UUFDcEIsT0FBTyxVQUFVLENBQUM7S0FDbkI7SUFFRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUUvRCxJQUNFLE1BQU0sS0FBSyxTQUFTLElBQUksY0FBYyxHQUFHLEVBQUU7UUFDM0MsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksY0FBYyxHQUFHLEVBQUUsRUFDakU7UUFDQSxPQUFPLG9DQUFvQyxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNoRjtTQUFNLElBQUksY0FBYyxJQUFJLENBQUMsSUFBSSxjQUFjLEdBQUcsRUFBRSxFQUFFO1FBQ3JELE1BQU0sVUFBVSxHQUFlLEVBQUUsQ0FBQztRQUNsQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEVBQUU7WUFDdEIsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXpCLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtnQkFDekIsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO2dCQUN6QyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzNDLE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQzthQUM5QjtTQUNGO2FBQU07WUFDTCxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDL0I7UUFFRCxPQUFPLG9DQUFvQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNyRTtTQUFNO1FBQ0wsT0FBTyxVQUFVLENBQUM7S0FDbkI7QUFDSCxDQUFDIn0=