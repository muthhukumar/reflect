import { Database } from "./database.ts";
import { CommandType } from "./types.ts";
import { decode, dispatch, dispatchAsync, encode } from "./util.ts";
export class MongoClient {
    constructor() {
        this._clientId = 0;
    }
    get clientId() {
        return this._clientId;
    }
    connectWithUri(uri) {
        const data = dispatch({ command_type: CommandType.ConnectWithUri }, encode(uri));
        this._clientId = parseInt(decode(data));
    }
    connectWithOptions(options) {
        const data = dispatch({ command_type: CommandType.ConnectWithOptions }, encode(JSON.stringify(options)));
        this._clientId = parseInt(decode(data));
    }
    async listDatabases() {
        return (await dispatchAsync({
            command_type: CommandType.ListDatabases,
            client_id: this._clientId,
        }));
    }
    database(name) {
        return new Database(this, name);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBc0ZwRSxNQUFNLE9BQU8sV0FBVztJQUF4QjtRQUNVLGNBQVMsR0FBVyxDQUFDLENBQUM7SUFnQ2hDLENBQUM7SUE5QkMsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxjQUFjLENBQUMsR0FBVztRQUN4QixNQUFNLElBQUksR0FBRyxRQUFRLENBQ25CLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNaLENBQUM7UUFDRixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsT0FBc0I7UUFDdkMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUNuQixFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsa0JBQWtCLEVBQUUsRUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDaEMsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYTtRQUNqQixPQUFPLENBQUMsTUFBTSxhQUFhLENBQUM7WUFDMUIsWUFBWSxFQUFFLFdBQVcsQ0FBQyxhQUFhO1lBQ3ZDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztTQUMxQixDQUFDLENBQWEsQ0FBQztJQUNsQixDQUFDO0lBRUQsUUFBUSxDQUFDLElBQVk7UUFDbkIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNGIn0=