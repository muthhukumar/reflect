function doesUserAgentMatchOldInternetExplorer(userAgent) {
    if (!userAgent) {
        return false;
    }
    const matches = /msie\s*(\d{1,2})/i.exec(userAgent);
    return matches ? parseFloat(matches[1]) < 9 : false;
}
function getHeaderValueFromOptions(options) {
    const directives = ['1'];
    let isBlockMode;
    if ('mode' in options) {
        if (options.mode === 'block') {
            isBlockMode = true;
        }
        else if (options.mode === null) {
            isBlockMode = false;
        }
        else {
            throw new Error('The `mode` option must be set to "block" or null.');
        }
    }
    else {
        isBlockMode = true;
    }
    if (isBlockMode) {
        directives.push('mode=block');
    }
    if (options.reportUri) {
        directives.push(`report=${options.reportUri}`);
    }
    return directives.join('; ');
}
export default function xXssProtection(requestResponse, options = {}) {
    const headerValue = getHeaderValueFromOptions(options);
    if (options.setOnOldIE) {
        requestResponse.setResponseHeader('X-XSS-Protection', headerValue);
    }
    else {
        const value = doesUserAgentMatchOldInternetExplorer(requestResponse.getRequestHeader('user-agent')) ? '0' : headerValue;
        requestResponse.setResponseHeader('X-XSS-Protection', value);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLHFDQUFxQyxDQUFDLFNBQTZCO0lBQzFFLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDdEQsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUUsT0FBOEI7SUFDaEUsTUFBTSxVQUFVLEdBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVuQyxJQUFJLFdBQW9CLENBQUM7SUFDekIsSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO1FBQ3JCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDNUIsV0FBVyxHQUFHLElBQUksQ0FBQztTQUNwQjthQUFNLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDaEMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNyQjthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1NBQ3RFO0tBQ0Y7U0FBTTtRQUNMLFdBQVcsR0FBRyxJQUFJLENBQUM7S0FDcEI7SUFFRCxJQUFJLFdBQVcsRUFBRTtRQUNmLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDL0I7SUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0tBQ2hEO0lBRUQsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWMsQ0FBRSxlQUF5QyxFQUFFLFVBQWlDLEVBQUU7SUFDcEgsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFdkQsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1FBQ3RCLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztLQUVwRTtTQUFNO1FBQ0wsTUFBTSxLQUFLLEdBQUcscUNBQXFDLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBRXhILGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM5RDtBQUNILENBQUMifQ==