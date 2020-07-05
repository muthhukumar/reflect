import { Collection } from "./collection.ts";
import { CommandType } from "./types.ts";
import { dispatchAsync, encode } from "./util.ts";
export class Database {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    async listCollectionNames() {
        const names = await dispatchAsync({
            command_type: CommandType.ListCollectionNames,
            client_id: this.client.clientId,
        }, encode(this.name));
        return names;
    }
    collection(name) {
        return new Collection(this.client, this.name, name);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVsRCxNQUFNLE9BQU8sUUFBUTtJQUNuQixZQUFvQixNQUFtQixFQUFVLElBQVk7UUFBekMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7SUFBRyxDQUFDO0lBRWpFLEtBQUssQ0FBQyxtQkFBbUI7UUFDdkIsTUFBTSxLQUFLLEdBQUcsTUFBTSxhQUFhLENBQy9CO1lBQ0UsWUFBWSxFQUFFLFdBQVcsQ0FBQyxtQkFBbUI7WUFDN0MsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUTtTQUNoQyxFQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ2xCLENBQUM7UUFDRixPQUFPLEtBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFZO1FBQ3JCLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDRiJ9