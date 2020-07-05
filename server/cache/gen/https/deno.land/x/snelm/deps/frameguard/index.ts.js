function parseActionOption(actionOption) {
    const invalidActionErr = new Error('action must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN".');
    if (actionOption === undefined) {
        actionOption = 'SAMEORIGIN';
    }
    else if (actionOption instanceof String) {
        actionOption = actionOption.valueOf();
    }
    let result;
    if (typeof actionOption === 'string') {
        result = actionOption.toUpperCase();
    }
    else {
        throw invalidActionErr;
    }
    if (result === 'ALLOWFROM') {
        result = 'ALLOW-FROM';
    }
    else if (result === 'SAME-ORIGIN') {
        result = 'SAMEORIGIN';
    }
    if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(result) === -1) {
        throw invalidActionErr;
    }
    return result;
}
function parseDomainOption(domainOption) {
    if (domainOption instanceof String) {
        domainOption = domainOption.valueOf();
    }
    if (typeof domainOption !== 'string') {
        throw new Error('ALLOW-FROM action requires a string domain parameter.');
    }
    else if (!domainOption.length) {
        throw new Error('domain parameter must not be empty.');
    }
    return domainOption;
}
function getHeaderValueFromOptions(options) {
    options = options || {};
    const action = parseActionOption(options.action);
    if (action === 'ALLOW-FROM') {
        const domain = parseDomainOption(options.domain);
        return `${action} ${domain}`;
    }
    else {
        return action;
    }
}
export default function frameguard(requestResponse, options) {
    const headerValue = getHeaderValueFromOptions(options);
    requestResponse.setResponseHeader('X-Frame-Options', headerValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxTQUFTLGlCQUFpQixDQUFDLFlBQXFCO0lBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQztJQUV2RyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7UUFDOUIsWUFBWSxHQUFHLFlBQVksQ0FBQztLQUM3QjtTQUFNLElBQUksWUFBWSxZQUFZLE1BQU0sRUFBRTtRQUN6QyxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZDO0lBRUQsSUFBSSxNQUFjLENBQUM7SUFDbkIsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDcEMsTUFBTSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNyQztTQUFNO1FBQ0wsTUFBTSxnQkFBZ0IsQ0FBQztLQUN4QjtJQUVELElBQUksTUFBTSxLQUFLLFdBQVcsRUFBRTtRQUMxQixNQUFNLEdBQUcsWUFBWSxDQUFDO0tBQ3ZCO1NBQU0sSUFBSSxNQUFNLEtBQUssYUFBYSxFQUFFO1FBQ25DLE1BQU0sR0FBRyxZQUFZLENBQUM7S0FDdkI7SUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDL0QsTUFBTSxnQkFBZ0IsQ0FBQztLQUN4QjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFlBQXFCO0lBQzlDLElBQUksWUFBWSxZQUFZLE1BQU0sRUFBRTtRQUNsQyxZQUFZLEdBQUcsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZDO0lBRUQsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUM7UUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO0tBQzFFO1NBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7UUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ3hEO0lBRUQsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsT0FBMkI7SUFDNUQsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFFeEIsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWpELElBQUksTUFBTSxLQUFLLFlBQVksRUFBRTtRQUMzQixNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsT0FBTyxHQUFHLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQztLQUM5QjtTQUFNO1FBQ0wsT0FBTyxNQUFNLENBQUM7S0FDZjtBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FBRSxlQUF5QyxFQUFFLE9BQTJCO0lBQ3hHLE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXZELGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNwRSxDQUFDIn0=