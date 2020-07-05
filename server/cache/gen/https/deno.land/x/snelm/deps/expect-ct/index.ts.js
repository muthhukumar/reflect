function isPositiveInteger(option) {
    return (typeof option === 'number' &&
        option >= 0 &&
        Math.round(option) === option);
}
function parseMaxAge(option) {
    if (isPositiveInteger(option)) {
        return option;
    }
    else {
        throw new Error(`${option} is not a valid value for maxAge. Please choose a positive integer.`);
    }
}
function getHeaderValueFromOptions(options) {
    options = options || {};
    const directives = [];
    if (options.enforce) {
        directives.push('enforce');
    }
    const maxAge = 'maxAge' in options ? options.maxAge : 0;
    directives.push(`max-age=${parseMaxAge(maxAge)}`);
    if (options.reportUri) {
        directives.push(`report-uri="${options.reportUri}"`);
    }
    return directives.join(', ');
}
export default function expectCt(requestResponse, options) {
    const headerValue = getHeaderValueFromOptions(options);
    requestResponse.setResponseHeader('Expect-CT', headerValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLGlCQUFpQixDQUFDLE1BQWU7SUFDeEMsT0FBTyxDQUNMLE9BQU8sTUFBTSxLQUFLLFFBQVE7UUFDMUIsTUFBTSxJQUFJLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FDOUIsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBRSxNQUFlO0lBQ25DLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDN0IsT0FBTyxNQUFNLENBQUM7S0FDZjtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLE1BQU0scUVBQXFFLENBQUMsQ0FBQztLQUNqRztBQUNILENBQUM7QUFFRCxTQUFTLHlCQUF5QixDQUFFLE9BQXlCO0lBQzNELE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0lBRXhCLE1BQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQztJQUVoQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM1QjtJQUVELE1BQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLFFBQVEsQ0FBRSxlQUF5QyxFQUFFLE9BQXlCO0lBQ3BHLE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXZELGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDOUQsQ0FBQyJ9