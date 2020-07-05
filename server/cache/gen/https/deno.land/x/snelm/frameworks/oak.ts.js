export default class OakRequestResponse {
    constructor(request, response) {
        this._request = request;
        this._response = response;
    }
    getRequestHeader(headerKey) {
        return this._request.headers.get(headerKey);
    }
    getResponseHeader(headerKey) {
        return this._response.headers.get(headerKey);
    }
    setResponseHeader(headerKey, headerValue) {
        this._response.headers.set(headerKey, headerValue);
    }
    removeResponseHeader(headerKey) {
        this._response.headers.delete(headerKey);
    }
    get request() {
        return this._request;
    }
    get response() {
        return this._response;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2FrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib2FrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxPQUFPLE9BQU8sa0JBQWtCO0lBS3RDLFlBQVksT0FBWSxFQUFFLFFBQWE7UUFDdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVNLGdCQUFnQixDQUFDLFNBQWlCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxTQUFpQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBaUIsRUFBRSxXQUFtQjtRQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSxvQkFBb0IsQ0FBQyxTQUFpQjtRQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELElBQUksT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLENBQUM7Q0FDRCJ9