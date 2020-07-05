import { MongoClient } from "../deps.ts";

const client = new MongoClient();

client.connectWithUri(Deno.env.get("MONGO_URI")!);
const db = client.database("reflect");

export { client, db };
