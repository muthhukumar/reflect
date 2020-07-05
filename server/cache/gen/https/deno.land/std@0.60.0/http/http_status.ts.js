// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** HTTP status codes */
export var Status;
(function (Status) {
    /** RFC 7231, 6.2.1 */
    Status[Status["Continue"] = 100] = "Continue";
    /** RFC 7231, 6.2.2 */
    Status[Status["SwitchingProtocols"] = 101] = "SwitchingProtocols";
    /** RFC 2518, 10.1 */
    Status[Status["Processing"] = 102] = "Processing";
    /** RFC 8297 **/
    Status[Status["EarlyHints"] = 103] = "EarlyHints";
    /** RFC 7231, 6.3.1 */
    Status[Status["OK"] = 200] = "OK";
    /** RFC 7231, 6.3.2 */
    Status[Status["Created"] = 201] = "Created";
    /** RFC 7231, 6.3.3 */
    Status[Status["Accepted"] = 202] = "Accepted";
    /** RFC 7231, 6.3.4 */
    Status[Status["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
    /** RFC 7231, 6.3.5 */
    Status[Status["NoContent"] = 204] = "NoContent";
    /** RFC 7231, 6.3.6 */
    Status[Status["ResetContent"] = 205] = "ResetContent";
    /** RFC 7233, 4.1 */
    Status[Status["PartialContent"] = 206] = "PartialContent";
    /** RFC 4918, 11.1 */
    Status[Status["MultiStatus"] = 207] = "MultiStatus";
    /** RFC 5842, 7.1 */
    Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
    /** RFC 3229, 10.4.1 */
    Status[Status["IMUsed"] = 226] = "IMUsed";
    /** RFC 7231, 6.4.1 */
    Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
    /** RFC 7231, 6.4.2 */
    Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
    /** RFC 7231, 6.4.3 */
    Status[Status["Found"] = 302] = "Found";
    /** RFC 7231, 6.4.4 */
    Status[Status["SeeOther"] = 303] = "SeeOther";
    /** RFC 7232, 4.1 */
    Status[Status["NotModified"] = 304] = "NotModified";
    /** RFC 7231, 6.4.5 */
    Status[Status["UseProxy"] = 305] = "UseProxy";
    /** RFC 7231, 6.4.7 */
    Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    /** RFC 7538, 3 */
    Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
    /** RFC 7231, 6.5.1 */
    Status[Status["BadRequest"] = 400] = "BadRequest";
    /** RFC 7235, 3.1 */
    Status[Status["Unauthorized"] = 401] = "Unauthorized";
    /** RFC 7231, 6.5.2 */
    Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
    /** RFC 7231, 6.5.3 */
    Status[Status["Forbidden"] = 403] = "Forbidden";
    /** RFC 7231, 6.5.4 */
    Status[Status["NotFound"] = 404] = "NotFound";
    /** RFC 7231, 6.5.5 */
    Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    /** RFC 7231, 6.5.6 */
    Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
    /** RFC 7235, 3.2 */
    Status[Status["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
    /** RFC 7231, 6.5.7 */
    Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
    /** RFC 7231, 6.5.8 */
    Status[Status["Conflict"] = 409] = "Conflict";
    /** RFC 7231, 6.5.9 */
    Status[Status["Gone"] = 410] = "Gone";
    /** RFC 7231, 6.5.10 */
    Status[Status["LengthRequired"] = 411] = "LengthRequired";
    /** RFC 7232, 4.2 */
    Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
    /** RFC 7231, 6.5.11 */
    Status[Status["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
    /** RFC 7231, 6.5.12 */
    Status[Status["RequestURITooLong"] = 414] = "RequestURITooLong";
    /** RFC 7231, 6.5.13 */
    Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    /** RFC 7233, 4.4 */
    Status[Status["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
    /** RFC 7231, 6.5.14 */
    Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
    /** RFC 7168, 2.3.3 */
    Status[Status["Teapot"] = 418] = "Teapot";
    /** RFC 7540, 9.1.2 */
    Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    /** RFC 4918, 11.2 */
    Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    /** RFC 4918, 11.3 */
    Status[Status["Locked"] = 423] = "Locked";
    /** RFC 4918, 11.4 */
    Status[Status["FailedDependency"] = 424] = "FailedDependency";
    /** RFC 8470, 5.2 */
    Status[Status["TooEarly"] = 425] = "TooEarly";
    /** RFC 7231, 6.5.15 */
    Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
    /** RFC 6585, 3 */
    Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
    /** RFC 6585, 4 */
    Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
    /** RFC 6585, 5 */
    Status[Status["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    /** RFC 7725, 3 */
    Status[Status["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    /** RFC 7231, 6.6.1 */
    Status[Status["InternalServerError"] = 500] = "InternalServerError";
    /** RFC 7231, 6.6.2 */
    Status[Status["NotImplemented"] = 501] = "NotImplemented";
    /** RFC 7231, 6.6.3 */
    Status[Status["BadGateway"] = 502] = "BadGateway";
    /** RFC 7231, 6.6.4 */
    Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    /** RFC 7231, 6.6.5 */
    Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
    /** RFC 7231, 6.6.6 */
    Status[Status["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    /** RFC 2295, 8.1 */
    Status[Status["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    /** RFC 4918, 11.5 */
    Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
    /** RFC 5842, 7.2 */
    Status[Status["LoopDetected"] = 508] = "LoopDetected";
    /** RFC 2774, 7 */
    Status[Status["NotExtended"] = 510] = "NotExtended";
    /** RFC 6585, 6 */
    Status[Status["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {}));
export const STATUS_TEXT = new Map([
    [Status.Continue, "Continue"],
    [Status.SwitchingProtocols, "Switching Protocols"],
    [Status.Processing, "Processing"],
    [Status.EarlyHints, "Early Hints"],
    [Status.OK, "OK"],
    [Status.Created, "Created"],
    [Status.Accepted, "Accepted"],
    [Status.NonAuthoritativeInfo, "Non-Authoritative Information"],
    [Status.NoContent, "No Content"],
    [Status.ResetContent, "Reset Content"],
    [Status.PartialContent, "Partial Content"],
    [Status.MultiStatus, "Multi-Status"],
    [Status.AlreadyReported, "Already Reported"],
    [Status.IMUsed, "IM Used"],
    [Status.MultipleChoices, "Multiple Choices"],
    [Status.MovedPermanently, "Moved Permanently"],
    [Status.Found, "Found"],
    [Status.SeeOther, "See Other"],
    [Status.NotModified, "Not Modified"],
    [Status.UseProxy, "Use Proxy"],
    [Status.TemporaryRedirect, "Temporary Redirect"],
    [Status.PermanentRedirect, "Permanent Redirect"],
    [Status.BadRequest, "Bad Request"],
    [Status.Unauthorized, "Unauthorized"],
    [Status.PaymentRequired, "Payment Required"],
    [Status.Forbidden, "Forbidden"],
    [Status.NotFound, "Not Found"],
    [Status.MethodNotAllowed, "Method Not Allowed"],
    [Status.NotAcceptable, "Not Acceptable"],
    [Status.ProxyAuthRequired, "Proxy Authentication Required"],
    [Status.RequestTimeout, "Request Timeout"],
    [Status.Conflict, "Conflict"],
    [Status.Gone, "Gone"],
    [Status.LengthRequired, "Length Required"],
    [Status.PreconditionFailed, "Precondition Failed"],
    [Status.RequestEntityTooLarge, "Request Entity Too Large"],
    [Status.RequestURITooLong, "Request URI Too Long"],
    [Status.UnsupportedMediaType, "Unsupported Media Type"],
    [Status.RequestedRangeNotSatisfiable, "Requested Range Not Satisfiable"],
    [Status.ExpectationFailed, "Expectation Failed"],
    [Status.Teapot, "I'm a teapot"],
    [Status.MisdirectedRequest, "Misdirected Request"],
    [Status.UnprocessableEntity, "Unprocessable Entity"],
    [Status.Locked, "Locked"],
    [Status.FailedDependency, "Failed Dependency"],
    [Status.TooEarly, "Too Early"],
    [Status.UpgradeRequired, "Upgrade Required"],
    [Status.PreconditionRequired, "Precondition Required"],
    [Status.TooManyRequests, "Too Many Requests"],
    [Status.RequestHeaderFieldsTooLarge, "Request Header Fields Too Large"],
    [Status.UnavailableForLegalReasons, "Unavailable For Legal Reasons"],
    [Status.InternalServerError, "Internal Server Error"],
    [Status.NotImplemented, "Not Implemented"],
    [Status.BadGateway, "Bad Gateway"],
    [Status.ServiceUnavailable, "Service Unavailable"],
    [Status.GatewayTimeout, "Gateway Timeout"],
    [Status.HTTPVersionNotSupported, "HTTP Version Not Supported"],
    [Status.VariantAlsoNegotiates, "Variant Also Negotiates"],
    [Status.InsufficientStorage, "Insufficient Storage"],
    [Status.LoopDetected, "Loop Detected"],
    [Status.NotExtended, "Not Extended"],
    [Status.NetworkAuthenticationRequired, "Network Authentication Required"],
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwX3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsd0JBQXdCO0FBQ3hCLE1BQU0sQ0FBTixJQUFZLE1BZ0lYO0FBaElELFdBQVksTUFBTTtJQUNoQixzQkFBc0I7SUFDdEIsNkNBQWMsQ0FBQTtJQUNkLHNCQUFzQjtJQUN0QixpRUFBd0IsQ0FBQTtJQUN4QixxQkFBcUI7SUFDckIsaURBQWdCLENBQUE7SUFDaEIsZ0JBQWdCO0lBQ2hCLGlEQUFnQixDQUFBO0lBQ2hCLHNCQUFzQjtJQUN0QixpQ0FBUSxDQUFBO0lBQ1Isc0JBQXNCO0lBQ3RCLDJDQUFhLENBQUE7SUFDYixzQkFBc0I7SUFDdEIsNkNBQWMsQ0FBQTtJQUNkLHNCQUFzQjtJQUN0QixxRUFBMEIsQ0FBQTtJQUMxQixzQkFBc0I7SUFDdEIsK0NBQWUsQ0FBQTtJQUNmLHNCQUFzQjtJQUN0QixxREFBa0IsQ0FBQTtJQUNsQixvQkFBb0I7SUFDcEIseURBQW9CLENBQUE7SUFDcEIscUJBQXFCO0lBQ3JCLG1EQUFpQixDQUFBO0lBQ2pCLG9CQUFvQjtJQUNwQiwyREFBcUIsQ0FBQTtJQUNyQix1QkFBdUI7SUFDdkIseUNBQVksQ0FBQTtJQUVaLHNCQUFzQjtJQUN0QiwyREFBcUIsQ0FBQTtJQUNyQixzQkFBc0I7SUFDdEIsNkRBQXNCLENBQUE7SUFDdEIsc0JBQXNCO0lBQ3RCLHVDQUFXLENBQUE7SUFDWCxzQkFBc0I7SUFDdEIsNkNBQWMsQ0FBQTtJQUNkLG9CQUFvQjtJQUNwQixtREFBaUIsQ0FBQTtJQUNqQixzQkFBc0I7SUFDdEIsNkNBQWMsQ0FBQTtJQUNkLHNCQUFzQjtJQUN0QiwrREFBdUIsQ0FBQTtJQUN2QixrQkFBa0I7SUFDbEIsK0RBQXVCLENBQUE7SUFFdkIsc0JBQXNCO0lBQ3RCLGlEQUFnQixDQUFBO0lBQ2hCLG9CQUFvQjtJQUNwQixxREFBa0IsQ0FBQTtJ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