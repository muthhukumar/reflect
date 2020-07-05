import { db } from "../connection/mongoose.ts";

const vim = db.collection("vimCommands");

export default vim;
