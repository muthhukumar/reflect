function getHeaderValueFromOptions(options) {
    const DEFAULT_POLICY = 'no-referrer';
    const ALLOWED_POLICIES = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'same-origin',
        'origin',
        'strict-origin',
        'origin-when-cross-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
        '',
    ];
    options = options || {};
    let policyOption;
    if ('policy' in options) {
        policyOption = options.policy;
    }
    else {
        policyOption = DEFAULT_POLICY;
    }
    const policies = Array.isArray(policyOption) ? policyOption : [policyOption];
    if (policies.length === 0) {
        throw new Error('At least one policy must be supplied.');
    }
    const policiesSeen = new Set();
    policies.forEach((policy) => {
        if (typeof policy !== 'string' || ALLOWED_POLICIES.indexOf(policy) === -1) {
            const allowedPoliciesErrorList = ALLOWED_POLICIES.map((policy) => {
                if (policy.length) {
                    return `"${policy}"`;
                }
                else {
                    return 'and the empty string';
                }
            }).join(', ');
            throw new Error(`"${policy}" is not a valid policy. Allowed policies: ${allowedPoliciesErrorList}.`);
        }
        if (policiesSeen.has(policy)) {
            throw new Error(`"${policy}" specified more than once. No duplicates are allowed.`);
        }
        policiesSeen.add(policy);
    });
    return policies.join(',');
}
export default function referrerPolicy(requestResponse, options) {
    const headerValue = getHeaderValueFromOptions(options);
    requestResponse.setResponseHeader('Referrer-Policy', headerValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxTQUFTLHlCQUF5QixDQUFFLE9BQStCO0lBQ2pFLE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQztJQUNyQyxNQUFNLGdCQUFnQixHQUFhO1FBQ2pDLGFBQWE7UUFDYiw0QkFBNEI7UUFDNUIsYUFBYTtRQUNiLFFBQVE7UUFDUixlQUFlO1FBQ2YsMEJBQTBCO1FBQzFCLGlDQUFpQztRQUNqQyxZQUFZO1FBQ1osRUFBRTtLQUNILENBQUM7SUFFRixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLFlBQXFCLENBQUM7SUFDMUIsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO1FBQ3ZCLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0tBQy9CO1NBQU07UUFDTCxZQUFZLEdBQUcsY0FBYyxDQUFDO0tBQy9CO0lBRUQsTUFBTSxRQUFRLEdBQWMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXhGLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsTUFBTSxZQUFZLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7SUFDNUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQzFCLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN6RSxNQUFNLHdCQUF3QixHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUMvRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7b0JBQ2pCLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQztpQkFDdEI7cUJBQU07b0JBQ0wsT0FBTyxzQkFBc0IsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksTUFBTSw4Q0FBOEMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO1NBQ3RHO1FBRUQsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxNQUFNLHdEQUF3RCxDQUFDLENBQUM7U0FDckY7UUFDRCxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGNBQWMsQ0FBRSxlQUF5QyxFQUFFLE9BQStCO0lBQ2hILE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXZELGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUNwRSxDQUFDIn0=