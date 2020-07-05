export default function hidePoweredBy(requestResponse, options) {
    const { setTo = null } = options || {};
    if (setTo) {
        requestResponse.setResponseHeader('X-Powered-By', setTo);
    }
    else {
        requestResponse.removeResponseHeader('X-Powered-By');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBQyxlQUF5QyxFQUFFLE9BQThCO0lBQzdHLE1BQU0sRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUV2QyxJQUFJLEtBQUssRUFBRTtRQUNULGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDMUQ7U0FBTTtRQUNMLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN0RDtBQUNILENBQUMifQ==