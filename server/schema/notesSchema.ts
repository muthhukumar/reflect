import { db } from "../connection/mongoose.ts";

const note = db.collection("notes");

export default note;
