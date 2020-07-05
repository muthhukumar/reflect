import config from './config.ts';
function goodBrowser() {
    return ['Content-Security-Policy'];
}
const handlersByBrowserName = {
    'Android Browser'(browser) {
        const osVersionName = browser.getOS().versionName;
        if (osVersionName && parseFloat(osVersionName) < 4.4) {
            return [];
        }
        return ['Content-Security-Policy'];
    },
    Chrome(browser) {
        const browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 14 && browserVersion < 25) {
            return ['X-WebKit-CSP'];
        }
        else if (browserVersion >= 25) {
            return ['Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    'Chrome Mobile'(browser, options) {
        if (browser.getOSName() === 'iOS') {
            return ['Content-Security-Policy'];
        }
        else {
            return handlersByBrowserName['Android Browser'](browser, options);
        }
    },
    Firefox(browser) {
        const osName = browser.getOSName();
        if (osName === 'iOS') {
            return ['Content-Security-Policy'];
        }
        const browserVersion = parseFloat(browser.getBrowserVersion());
        if (osName === 'Android') {
            if (browserVersion >= 25) {
                return ['Content-Security-Policy'];
            }
            else {
                return ['X-Content-Security-Policy'];
            }
        }
        else if (browser.getPlatformType(true) === 'mobile') {
            // This is probably Firefox OS.
            if (browserVersion >= 32) {
                return ['Content-Security-Policy'];
            }
            else {
                return ['X-Content-Security-Policy'];
            }
        }
        else if (browserVersion >= 23) {
            return ['Content-Security-Policy'];
        }
        else if (browserVersion >= 4 && browserVersion < 23) {
            return ['X-Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    'Internet Explorer'(browser) {
        const browserVersion = parseFloat(browser.getBrowserVersion());
        const header = browserVersion < 12 ? 'X-Content-Security-Policy' : 'Content-Security-Policy';
        return [header];
    },
    'Microsoft Edge': goodBrowser,
    'Microsoft Edge Mobile': goodBrowser,
    Opera(browser) {
        const browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 15) {
            return ['Content-Security-Policy'];
        }
        else {
            return [];
        }
    },
    Safari(browser) {
        const browserVersion = parseFloat(browser.getBrowserVersion());
        if (browserVersion >= 7) {
            return ['Content-Security-Policy'];
        }
        else if (browserVersion >= 6) {
            return ['X-WebKit-CSP'];
        }
        else {
            return [];
        }
    },
};
export default function getHeaderKeysForBrowser(browser, options) {
    if (!browser) {
        return config.allHeaders;
    }
    if (options.disableAndroid && browser.getOSName() === 'Android') {
        return [];
    }
    const browserName = browser.getBrowserName();
    if (Object.prototype.hasOwnProperty.call(handlersByBrowserName, browserName)) {
        return handlersByBrowserName[browserName](browser, options);
    }
    else {
        return config.allHeaders;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWhlYWRlci1rZXlzLWZvci1icm93c2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2V0LWhlYWRlci1rZXlzLWZvci1icm93c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLGFBQWEsQ0FBQztBQUlqQyxTQUFTLFdBQVc7SUFDbEIsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDckMsQ0FBQztBQU1ELE1BQU0scUJBQXFCLEdBQTBCO0lBQ25ELGlCQUFpQixDQUFFLE9BQU87UUFDeEIsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUNsRCxJQUFJLGFBQWEsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ3BELE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFFLE9BQU87UUFDYixNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUMvRCxJQUFJLGNBQWMsSUFBSSxFQUFFLElBQUksY0FBYyxHQUFHLEVBQUUsRUFBRTtZQUMvQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDekI7YUFBTSxJQUFJLGNBQWMsSUFBSSxFQUFFLEVBQUU7WUFDL0IsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDO0lBRUQsZUFBZSxDQUFFLE9BQU8sRUFBRSxPQUFPO1FBQy9CLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNqQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUNwQzthQUFNO1lBQ0wsT0FBTyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sRUFB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