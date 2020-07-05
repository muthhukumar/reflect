import { CommandType } from "./types.ts";
import { convert, parse } from "./type_convert.ts";
import { dispatchAsync, encode } from "./util.ts";
export class Collection {
    constructor(client, dbName, collectionName) {
        this.client = client;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }
    async _find(filter, options) {
        const doc = await dispatchAsync({
            command_type: CommandType.Find,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            filter,
            ...options,
        })));
        return doc;
    }
    async count(filter) {
        const count = await dispatchAsync({
            command_type: CommandType.Count,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            filter,
        })));
        return count;
    }
    async findOne(filter) {
        return parse(await this._find(filter, { findOne: true }));
    }
    async find(filter, options) {
        return parse(await this._find(filter, { findOne: false, ...options }));
    }
    async insertOne(doc) {
        const _id = await dispatchAsync({
            command_type: CommandType.InsertOne,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            doc: convert(doc),
        })));
        return _id;
    }
    async insertMany(docs) {
        const _ids = await dispatchAsync({
            command_type: CommandType.InsertMany,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            docs: convert(docs),
        })));
        return _ids;
    }
    async _delete(query, deleteOne = false) {
        const deleteCount = await dispatchAsync({
            command_type: CommandType.Delete,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            query,
            deleteOne,
        })));
        return deleteCount;
    }
    deleteOne(query) {
        return this._delete(query, true);
    }
    deleteMany(query) {
        return this._delete(query, false);
    }
    async _update(query, update, updateOne = false) {
        const result = await dispatchAsync({
            command_type: CommandType.Update,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            query: convert(query),
            update: convert(update),
            updateOne,
        })));
        return result;
    }
    updateOne(query, update) {
        return this._update(query, update, true);
    }
    updateMany(query, update) {
        return this._update(query, update, false);
    }
    async aggregate(pipeline) {
        const docs = await dispatchAsync({
            command_type: CommandType.Aggregate,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            pipeline,
        })));
        return parse(docs);
    }
    async createIndexes(models) {
        const docs = await dispatchAsync({
            command_type: CommandType.CreateIndexes,
            client_id: this.client.clientId,
        }, encode(JSON.stringify({
            dbName: this.dbName,
            collectionName: this.collectionName,
            models,
        })));
        return docs;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbGxlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFdBQVcsRUFBZSxNQUFNLFlBQVksQ0FBQztBQUN0RCxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRWxELE1BQU0sT0FBTyxVQUFVO0lBQ3JCLFlBQ21CLE1BQW1CLEVBQ25CLE1BQWMsRUFDZCxjQUFzQjtRQUZ0QixXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQ25CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBUTtJQUN0QyxDQUFDO0lBRUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFlLEVBQUUsT0FBcUI7UUFDeEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxhQUFhLENBQzdCO1lBQ0UsWUFBWSxFQUFFLFdBQVcsQ0FBQyxJQUFJO1lBQzlCLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7U0FDaEMsRUFDRCxNQUFNLENBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsTUFBTTtZQUNOLEdBQUcsT0FBTztTQUNYLENBQUMsQ0FDSCxDQUNGLENBQUM7UUFDRixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQWU7UUFDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxhQUFhLENBQy9CO1lBQ0UsWUFBWSxFQUFFLFdBQVcsQ0FBQyxLQUFLO1lBQy9CLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7U0FDaEMsRUFDRCxNQUFNLENBQ0osSUFBSSxDQUFDLFNB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