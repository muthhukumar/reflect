import { Router } from "../deps.ts";

import { NotesSchema } from "../schema/models/models.ts";
import notes from "../schema/notesSchema.ts";

const router = new Router();

router.get("/notes/:id", async (ctx) => {
  const notesId = ctx.params.id;

  let response;
  try {
    response = await notes.findOne({ _id: { $oid: notesId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "Notes not found");

  ctx.response.body = {
    notes: { ...response, _id: response._id.$oid },
  };
});

router.get("/notes", async (ctx) => {
  //TODO validate the user before sending the data to the user
  //TODO create a relation for the report to the user

  let response;
  try {
    response = await notes.find();
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = {
    notes: response,
  };
});

router.post("/notes/add", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }

  //TODO check whether the body response is json or some other using if check and parse the response accordingly

  const json = await ctx.request.body();
  const data: NotesSchema = json.value;

  //TODO validate inputs before processing. Create a separate function to do all these work

  if (!data || !data.search || !data.source || !data.content || !data.title)
    ctx.throw(400, "Invalid data passed, check the data and try again");

  const newNotes: NotesSchema = {
    title: data.title,
    search: data.search,
    source: data.source,
    content: data.content,
  };

  let noteId;
  try {
    noteId = await notes.insertOne(newNotes);
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { noteId, message: "new notes saved" };
});

router.patch("/notes/:id", async (ctx) => {
  const notesId = ctx.params.id;

  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }
  const json = await ctx.request.body();
  const data: NotesSchema = json.value;

  if (!data || !data.search || !data.source || !data.content || !data.title)
    ctx.throw(400, "Invalid data passed, check the data and try again");

  let response;
  try {
    response = await notes.updateOne(
      {
        _id: { $oid: notesId },
      },
      {
        $set: {
          search: data.search,
          title: data.title,
          source: data.source,
          content: data.content,
        },
      }
    );
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { response, message: "note updated successfully" };
});

router.delete("/notes/:id", async (ctx) => {
  const notesId = ctx.params.id;

  let response;
  try {
    response = await notes.deleteOne({ _id: { $oid: notesId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "note delete failed");
  ctx.response.body = { message: "note deleted successfully", response };
});

export default router;
