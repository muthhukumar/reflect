import { Snelm, Application, config } from "./deps.ts";
import "https://deno.land/x/dotenv/load.ts";

import "./connection/mongoose.ts";
import reportRouter from "./routes/reportRoutes.ts";
import notesRouter from "./routes/notesRoutes.ts";
import vimRouter from "./routes/vimRoutes.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

//temp
import vim from "./schema/vimSchema.ts";
import notes from "./schema/notesSchema.ts";
import report from "./schema/reportSchema.ts";

import {
  ReportSchema,
  VimSchema,
  NotesSchema,
} from "./schema/models/models.ts";

config({ safe: true });

const app = new Application();

const snelm = new Snelm("oak");

/*
app.use(errorHandler);
app.use(async (ctx, next) => {
  ctx.response = snelm.snelm(ctx.request, ctx.response);
  await next();
});
*/
app.use((ctx) => {
  const decoder = new TextDecoder("utf-8");
  const file = Deno.readFileSync("../../../inventory/vim.json");
  const data = JSON.parse(decoder.decode(file));
  let vimCommand: VimSchema = {
    command: "",
    keyBinding: [],
    action: "",
    search: [],
    title: "",
  };
  const commands = [];
  try {
    for (let i in data) {
      vimCommand.command = data[i].command;
      vimCommand.keyBinding = data[i].keyBinding;
      vimCommand.action = data[i].action;
      vimCommand.search = data[i].search;
      vimCommand.title = i;
      commands.push(vimCommand);
    }
  } catch (err) {
    console.log(err);
  }

  ctx.response.body = commands;
});

/*
app.use(reportRouter.routes());
app.use(reportRouter.allowedMethods());

app.use(notesRouter.routes());
app.use(notesRouter.allowedMethods());

app.use(vimRouter.routes());
app.use(vimRouter.allowedMethods());
*/

console.log("Serving at http://localhost:5000");
await app.listen({ port: 5000 });
