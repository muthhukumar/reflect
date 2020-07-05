function getHeaderValueFromOptions(options) {
    const DEFAULT_PERMITTED_POLICIES = 'none';
    const ALLOWED_POLICIES = [
        'none',
        'master-only',
        'by-content-type',
        'all',
    ];
    let permittedPolicies;
    if ('permittedPolicies' in options) {
        permittedPolicies = options.permittedPolicies;
    }
    else {
        permittedPolicies = DEFAULT_PERMITTED_POLICIES;
    }
    if (ALLOWED_POLICIES.indexOf(permittedPolicies) === -1) {
        throw new Error(`"${permittedPolicies}" is not a valid permitted policy. Allowed values: ${ALLOWED_POLICIES.join(', ')}.`);
    }
    return permittedPolicies;
}
export default function crossdomain(requestResponse, options = {}) {
    const headerValue = getHeaderValueFromOptions(options);
    requestResponse.setResponseHeader('X-Permitted-Cross-Domain-Policies', headerValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxTQUFTLHlCQUF5QixDQUFFLE9BQTJCO0lBQzdELE1BQU0sMEJBQTBCLEdBQUcsTUFBTSxDQUFDO0lBQzFDLE1BQU0sZ0JBQWdCLEdBQUc7UUFDdkIsTUFBTTtRQUNOLGFBQWE7UUFDYixpQkFBaUI7UUFDakIsS0FBSztLQUNOLENBQUM7SUFFRixJQUFJLGlCQUF5QixDQUFDO0lBQzlCLElBQUksbUJBQW1CLElBQUksT0FBTyxFQUFFO1FBQ2xDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxpQkFBMkIsQ0FBQztLQUN6RDtTQUFNO1FBQ0wsaUJBQWlCLEdBQUcsMEJBQTBCLENBQUM7S0FDaEQ7SUFFRCxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3RELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxpQkFBaUIsc0RBQXNELGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDNUg7SUFFRCxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLFdBQVcsQ0FBRSxlQUF5QyxFQUFFLFVBQThCLEVBQUU7SUFDOUcsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFdkQsZUFBZSxDQUFDLGlCQUFpQixDQUFDLG1DQUFtQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3RGLENBQUMifQ==