import { Router } from "../deps.ts";

import { VimSchema } from "../schema/models/models.ts";
import vim from "../schema/vimSchema.ts";

const router = new Router();

router.get("/vim/:id", async (ctx) => {
  const vimId = ctx.params.id;

  let response;
  try {
    response = await vim.findOne({ _id: { $oid: vimId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "vim command not found");

  ctx.response.body = {
    vimCommand: { ...response, _id: response._id.$oid },
  };
});

router.get("/vim", async (ctx) => {
  let response;
  try {
    response = await vim.find();
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = {
    vimCommands: response,
  };
});

router.post("/vim/add", async (ctx) => {
  const json = await ctx.request.body();
  const data: VimSchema = json.value;
  console.log(data);
  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }

  //TODO check whether the body response is json or some other using if check and parse the response accordingly

  //TODO validate inputs before processing. Create a separate function to do all these work

  if (
    !data ||
    !data.title ||
    !data.action ||
    !data.search ||
    !data.command ||
    !data.keyBinding
  )
    ctx.throw(400, "Invalid data passed, check the data and try again");

  const newVimCommand: VimSchema = {
    title: data.title,
    action: data.action,
    search: data.search,
    command: data.command,
    keyBinding: data.keyBinding,
  };

  let vimId;
  try {
    vimId = await vim.insertOne(newVimCommand);
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { vimId, message: "new vim command saved" };
});

router.patch("/vim/:id", async (ctx) => {
  const vimId = ctx.params.id;

  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }
  const json = await ctx.request.body();
  const data: VimSchema = json.value;

  if (
    !data ||
    !data.title ||
    !data.action ||
    !data.search ||
    !data.command ||
    !data.keyBinding
  )
    ctx.throw(400, "Invalid data passed, check the data and try again");

  let response;
  try {
    response = await vim.updateOne(
      {
        _id: { $oid: vimId },
      },
      {
        $set: {
          title: data.title,
          action: data.action,
          search: data.search,
          command: data.command,
          keyBinding: data.keyBinding,
        },
      }
    );
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { response, message: "vim command updated" };
});

router.delete("/vim/:id", async (ctx) => {
  const vimId = ctx.params.id;

  let response;
  try {
    response = await vim.deleteOne({ _id: { $oid: vimId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "vim command delete failed");
  ctx.response.body = { message: "vim command deleted successfully", response };
});

export default router;
