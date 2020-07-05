import { oakCors, flags, Snelm, Application, config } from "./deps.ts";
import "https://deno.land/x/dotenv/load.ts";

import "./connection/mongoose.ts";
import reportRouter from "./routes/reportRoutes.ts";
import notesRouter from "./routes/notesRoutes.ts";
import vimRouter from "./routes/vimRoutes.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

config({ safe: true });

const app = new Application();

app.use(oakCors());

const { args } = Deno;
const DEFAULT_PORT = +Deno.env.get("PORT")!;
const argPort = flags.parse(args).port;
const port = argPort ? Number(argPort) : DEFAULT_PORT;

const snelm = new Snelm("oak");

app.use(errorHandler);
app.use(async (ctx, next) => {
  ctx.response = snelm.snelm(ctx.request, ctx.response);
  await next();
});

app.use(reportRouter.routes());
app.use(reportRouter.allowedMethods());

app.use(notesRouter.routes());
app.use(notesRouter.allowedMethods());

app.use(vimRouter.routes());
app.use(vimRouter.allowedMethods());

console.log(`Serving at http://localhost:${5000}`);
await app.listen({ port });
