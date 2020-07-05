import { Cors } from "./cors.ts";
export const attainCors = (o) => {
    const corsOptionsDelegate = Cors.produceCorsOptionsDelegate(o);
    return async function cors(request, response) {
        try {
            const fakeNext = () => undefined;
            const options = await corsOptionsDelegate(request);
            const corsOptions = Cors.produceCorsOptions(options || {});
            const originDelegate = Cors.produceOriginDelegate(corsOptions);
            if (originDelegate) {
                const requestMethod = request.method;
                const getRequestHeader = (headerKey) => request.headers.get(headerKey);
                const getResponseHeader = (headerKey) => response.headers.get(headerKey);
                const setResponseHeader = (headerKey, headerValue) => response.headers.set(headerKey, headerValue);
                const setStatus = (statusCode) => response.status(statusCode);
                const origin = await originDelegate(getRequestHeader("origin"));
                if (origin) {
                    corsOptions.origin = origin;
                    new Cors({
                        corsOptions,
                        requestMethod,
                        getRequestHeader,
                        getResponseHeader,
                        setResponseHeader,
                        setStatus,
                        next: fakeNext,
                    }).configureHeaders();
                }
            }
        }
        catch (error) {
            throw error;
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0YWluQ29ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF0dGFpbkNvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQWlCakMsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLENBT3hCLENBQStDLEVBQy9DLEVBQUU7SUFDRixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FFekQsQ0FBQyxDQUFDLENBQUM7SUFFTCxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVE7UUFDMUMsSUFBSTtZQUNGLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNqQyxNQUFNLE9BQU8sR0FBRyxNQUFNLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5ELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7WUFDM0QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRS9ELElBQUksY0FBYyxFQUFFO2dCQUNsQixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUNyQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQzdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQzlDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBaUIsRUFBRSxXQUFtQixFQUFFLEVBQUUsQ0FDbkUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLFNBQVMsR0FBRyxDQUFDLFVBQWtCLEVBQUUsRUFBRSxDQUN2QyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2dCQUU3QixNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUVoRSxJQUFJLE1BQU0sRUFBRTtvQkFDVixXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFFNUIsSUFBSSxJQUFJLENBQUM7d0JBQ1AsV0FBVzt3QkFDWCxhQUFhO3dCQUNiLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLFNBQVM7d0JBQ1QsSUFBSSxFQUFFLFFBQVE7cUJBQ2YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7aUJBQ3ZCO2FBQ0Y7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsTUFBTSxLQUFLLENBQUE7U0FDWjtJQUNILENBQWdCLENBQUM7QUFDbkIsQ0FBQyxDQUFDIn0=