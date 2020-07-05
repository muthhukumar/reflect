import { db } from "../connection/mongoose.ts";

const report = db.collection("reports");

export default report;
