import { Cors } from "./cors.ts";
/**
 * mithCors middleware wrapper
 * @param o CorsOptions | CorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const mithCors = (o) => {
    const corsOptionsDelegate = Cors.produceCorsOptionsDelegate(o);
    return (async (request, response, next) => {
        try {
            const options = await corsOptionsDelegate(request);
            const corsOptions = Cors.produceCorsOptions(options || {});
            const originDelegate = Cors.produceOriginDelegate(corsOptions);
            if (originDelegate) {
                const requestMethod = request.method;
                const getRequestHeader = (headerKey) => request.headers.get(headerKey);
                const getResponseHeader = (headerKey) => response.headers.get(headerKey);
                const setResponseHeader = (headerKey, headerValue) => response.headers.set(headerKey, headerValue);
                const setStatus = (statusCode) => (response.status = statusCode);
                const origin = await originDelegate(getRequestHeader("origin"));
                if (!origin)
                    return next();
                else {
                    corsOptions.origin = origin;
                    return new Cors({
                        corsOptions,
                        requestMethod,
                        getRequestHeader,
                        getResponseHeader,
                        setResponseHeader,
                        setStatus,
                        next,
                    }).configureHeaders();
                }
            }
        }
        catch (error) {
            return next();
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl0aENvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtaXRoQ29ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBaUJqQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLENBU3RCLENBQStDLEVBQy9DLEVBQUU7SUFDRixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FFekQsQ0FBQyxDQUFDLENBQUM7SUFFTCxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDeEMsSUFBSTtZQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMzRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFL0QsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0JBQ3JDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FDN0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FDOUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUFpQixFQUFFLFdBQW1CLEVBQUUsRUFBRSxDQUNuRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sU0FBUyxHQUFHLENBQ2hCLFVBQWtCLEVBQ2xCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBRXBDLE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBRWhFLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxFQUFFLENBQUM7cUJBQ3RCO29CQUNILFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO29CQUU1QixPQUFPLElBQUksSUFBSSxDQUFDO3dCQUNkLFdBQVc7d0JBQ1gsYUFBYTt3QkFDYixnQkFBZ0I7d0JBQ2hCLGlCQUFpQjt3QkFDakIsaUJBQWlCO3dCQUNqQixTQUFTO3dCQUNULElBQUk7cUJBQ0wsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7aUJBQ3ZCO2FBQ0Y7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsT0FBTyxJQUFJLEVBQUUsQ0FBQztTQUNmO0lBQ0gsQ0FBQyxDQUFnQixDQUFDO0FBQ3BCLENBQUMsQ0FBQyJ9