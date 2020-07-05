let Cors = /** @class */ (() => {
    class Cors {
        constructor(props) {
            this.props = props;
            this.configureHeaders = () => {
                const { props: { corsOptions, requestMethod, setResponseHeader, setStatus, next }, configureOrigin, } = this;
                if (typeof requestMethod === "string" &&
                    requestMethod.toUpperCase() === "OPTIONS") {
                    configureOrigin()
                        .configureCredentials()
                        .configureMethods()
                        .configureAllowedHeaders()
                        .configureMaxAge()
                        .configureExposedHeaders();
                    if (corsOptions.preflightContinue)
                        return next();
                    else {
                        setStatus(corsOptions.optionsSuccessStatus);
                        setResponseHeader("Content-Length", "0");
                        return next();
                    }
                }
                else {
                    configureOrigin().configureCredentials().configureExposedHeaders();
                    return next();
                }
            };
            this.configureOrigin = () => {
                const { props: { corsOptions, getRequestHeader, setResponseHeader }, setVaryHeader, } = this;
                if (!corsOptions.origin || corsOptions.origin === "*")
                    setResponseHeader("Access-Control-Allow-Origin", "*");
                else if (typeof corsOptions.origin === "string") {
                    setResponseHeader("Access-Control-Allow-Origin", corsOptions.origin);
                    setVaryHeader("Origin");
                }
                else {
                    const requestOrigin = getRequestHeader("origin") ?? getRequestHeader("Origin");
                    setResponseHeader("Access-Control-Allow-Origin", Cors.isOriginAllowed(requestOrigin, corsOptions.origin)
                        ? requestOrigin
                        : "false");
                    setVaryHeader("Origin");
                }
                return this;
            };
            this.configureCredentials = () => {
                const { corsOptions, setResponseHeader } = this.props;
                if (corsOptions.credentials === true)
                    setResponseHeader("Access-Control-Allow-Credentials", "true");
                return this;
            };
            this.configureMethods = () => {
                const { corsOptions, setResponseHeader } = this.props;
                let methods = corsOptions.methods;
                setResponseHeader("Access-Control-Allow-Methods", Array.isArray(methods) ? methods.join(",") : methods);
                return this;
            };
            this.configureAllowedHeaders = () => {
                const { props: { corsOptions, getRequestHeader, setResponseHeader }, setVaryHeader, } = this;
                let allowedHeaders = corsOptions.allowedHeaders;
                if (!allowedHeaders) {
                    allowedHeaders =
                        getRequestHeader("access-control-request-headers") ??
                            getRequestHeader("Access-Control-Request-Headers") ??
                            undefined;
                    setVaryHeader("Access-Control-request-Headers");
                }
                if (allowedHeaders?.length)
                    setResponseHeader("Access-Control-Allow-Headers", Array.isArray(allowedHeaders)
                        ? allowedHeaders.join(",")
                        : allowedHeaders);
                return this;
            };
            this.configureMaxAge = () => {
                const { corsOptions, setResponseHeader } = this.props;
                const maxAge = (typeof corsOptions.maxAge === "number" ||
                    typeof corsOptions.maxAge === "string") &&
                    corsOptions.maxAge.toString();
                if (maxAge && maxAge.length)
                    setResponseHeader("Access-Control-Max-Age", maxAge);
                return this;
            };
            this.configureExposedHeaders = () => {
                const { corsOptions, setResponseHeader } = this.props;
                let exposedHeaders = corsOptions.exposedHeaders;
                if (exposedHeaders?.length)
                    setResponseHeader("Access-Control-Expose-Headers", Array.isArray(exposedHeaders)
                        ? exposedHeaders.join(",")
                        : exposedHeaders);
                return this;
            };
            this.setVaryHeader = (field) => {
                const { props: { getResponseHeader, setResponseHeader }, appendVaryHeader, } = this;
                let existingHeader = getResponseHeader("Vary") ?? "";
                if (existingHeader &&
                    typeof existingHeader === "string" &&
                    (existingHeader = appendVaryHeader(existingHeader, field)))
                    setResponseHeader("Vary", existingHeader);
            };
            this.appendVaryHeader = (header, field) => {
                const { parseVaryHeader } = this;
                if (header === "*")
                    return header;
                let varyHeader = header;
                const fields = parseVaryHeader(field);
                const headers = parseVaryHeader(header.toLocaleLowerCase());
                if (fields.includes("*") || headers.includes("*"))
                    return "*";
                fields.forEach((field) => {
                    const fld = field.toLowerCase();
                    if (headers.includes(fld)) {
                        headers.push(fld);
                        varyHeader = varyHeader ? `${varyHeader}, ${field}` : field;
                    }
                });
                return varyHeader;
            };
            this.parseVaryHeader = (header) => {
                let end = 0;
                const list = [];
                let start = 0;
                for (let i = 0, len = header.length; i < len; i++) {
                    switch (header.charCodeAt(i)) {
                        case 0x20 /*   */:
                            if (start === end)
                                start = end = i + 1;
                            break;
                        case 0x2c /* , */:
                            list.push(header.substring(start, end));
                            start = end = i + 1;
                            break;
                        default:
                            end = i + 1;
                            break;
                    }
                }
                list.push(header.substring(start, end));
                return list;
            };
        }
    }
    Cors.produceCorsOptions = (corsOptions = {}, defaultCorsOptions = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }) => ({
        ...defaultCorsOptions,
        ...corsOptions,
    });
    Cors.produceCorsOptionsDelegate = (o) => typeof o === "function"
        ? o
        : ((_request) => o);
    Cors.produceOriginDelegate = (corsOptions) => {
        if (corsOptions.origin) {
            if (typeof corsOptions.origin === "function")
                return corsOptions.origin;
            return ((_requestOrigin) => corsOptions.origin);
        }
    };
    Cors.isOriginAllowed = (requestOrigin, allowedOrigin) => {
        if (Array.isArray(allowedOrigin))
            return allowedOrigin.some((ao) => Cors.isOriginAllowed(requestOrigin, ao));
        else if (typeof allowedOrigin === "string")
            return requestOrigin === allowedOrigin;
        else if (allowedOrigin instanceof RegExp &&
            typeof requestOrigin === "string")
            return allowedOrigin.test(requestOrigin);
        else
            return !!allowedOrigin;
    };
    return Cors;
})();
export { Cors };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJBO0lBQUEsTUFBYSxJQUFJO1FBQ2YsWUFBb0IsS0FBZ0I7WUFBaEIsVUFBSyxHQUFMLEtBQUssQ0FBVztZQXFEN0IscUJBQWdCLEdBQUcsR0FBRyxFQUFFO2dCQUM3QixNQUFNLEVBQ0osS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQ3pFLGVBQWUsR0FDaEIsR0FBRyxJQUFJLENBQUM7Z0JBRVQsSUFDRSxPQUFPLGFBQWEsS0FBSyxRQUFRO29CQUNqQyxhQUFhLENBQUMsV0FBVyxFQUFFLEtBQUssU0FBUyxFQUN6QztvQkFDQSxlQUFlLEVBQUU7eUJBQ2Qsb0JBQW9CLEVBQUU7eUJBQ3RCLGdCQUFnQixFQUFFO3lCQUNsQix1QkFBdUIsRUFBRTt5QkFDekIsZUFBZSxFQUFFO3lCQUNqQix1QkFBdUIsRUFBRSxDQUFDO29CQUU3QixJQUFJLFdBQVcsQ0FBQyxpQkFBaUI7d0JBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQzt5QkFDNUM7d0JBQ0gsU0FBUyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUM1QyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDekMsT0FBTyxJQUFJLEVBQUUsQ0FBQztxQkFDZjtpQkFDRjtxQkFBTTtvQkFDTCxlQUFlLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLHVCQUF1QixFQUFFLENBQUM7b0JBRW5FLE9BQU8sSUFBSSxFQUFFLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUM7WUFFTSxvQkFBZSxHQUFHLEdBQUcsRUFBRTtnQkFDN0IsTUFBTSxFQUNKLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxFQUMzRCxhQUFhLEdBQ2QsR0FBRyxJ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