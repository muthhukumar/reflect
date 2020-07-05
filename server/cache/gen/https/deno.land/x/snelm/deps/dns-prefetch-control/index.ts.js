function getHeaderValueFromOptions(options) {
    if (options && options.allow) {
        return 'on';
    }
    else {
        return 'off';
    }
}
export default function dnsPrefetchControl(requestResponse, options) {
    const headerValue = getHeaderValueFromOptions(options);
    requestResponse.setResponseHeader('X-DNS-Prefetch-Control', headerValue);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxTQUFTLHlCQUF5QixDQUFDLE9BQW1DO0lBQ3BFLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDYjtTQUFNO1FBQ0wsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxVQUFVLGtCQUFrQixDQUFFLGVBQXlDLEVBQUUsT0FBbUM7SUFDeEgsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFdkQsZUFBZSxDQUFDLGlCQUFpQixDQUFDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzNFLENBQUMifQ==