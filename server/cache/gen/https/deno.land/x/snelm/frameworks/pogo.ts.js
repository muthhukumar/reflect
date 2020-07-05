export default class PogoRequestResponse {
    constructor(request, response) {
        this._request = request;
        this._response = response;
    }
    getRequestHeader(headerKey) {
        return this._request.headers[headerKey];
    }
    getResponseHeader(headerKey) {
        return this._response.headers[headerKey];
    }
    setResponseHeader(headerKey, headerValue) {
        this._response.header(headerKey, headerValue);
    }
    removeResponseHeader(headerKey) {
        delete this._response.headers[headerKey];
    }
    get request() {
        return this._request;
    }
    get response() {
        return this._response;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9nby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvZ28udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxtQkFBbUI7SUFLdkMsWUFBWSxPQUFZLEVBQUUsUUFBYTtRQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRU0sZ0JBQWdCLENBQUMsU0FBaUI7UUFDeEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBaUI7UUFDekMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBaUIsRUFBRSxXQUFtQjtRQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVNLG9CQUFvQixDQUFDLFNBQWlCO1FBQzVDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELElBQUksT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLENBQUM7Q0FDRCJ9