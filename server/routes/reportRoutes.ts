import { Router } from "../deps.ts";

import { ReportSchema } from "../schema/models/models.ts";
import report from "../schema/reportSchema.ts";

const router = new Router();

router.get("/report/:id", async (ctx) => {
  const reportId = ctx.params.id;

  let response;
  try {
    response = await report.findOne({ _id: { $oid: reportId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "report not found");

  ctx.response.body = {
    report: { ...response, _id: response._id.$oid },
  };
});
router.get("/report", async (ctx) => {
  //TODO validate the user before sending the data to the user
  //TODO create a relation for the report to the user

  let response;
  try {
    response = await report.find();
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = {
    reports: response,
  };
});

router.post("/report/add", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }

  //TODO check whether the body response is json or some other using if check and parse the response accordingly

  const json = await ctx.request.body();
  const data: ReportSchema = json.value;

  //TODO validate inputs before processing. Create a separate function to do all these work

  if (!data || !data.date || !data.done || !data.notes || !data.quote)
    ctx.throw(400, "Invalid data passed, check the data and try again");

  const newReport: ReportSchema = {
    date: data.date,
    done: data.done,
    notes: data.notes,
    quote: data.quote,
  };

  let reportId;
  try {
    reportId = await report.insertOne(newReport);
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { reportId, message: "new report saved" };
});

router.patch("/report/:id", async (ctx) => {
  const reportId = ctx.params.id;

  if (!ctx.request.hasBody) {
    ctx.throw(400, "Invalid data passed, check the data and try again");
  }
  const json = await ctx.request.body();
  const data: ReportSchema = json.value;

  if (!data || !data.date || !data.done || !data.notes || !data.quote)
    ctx.throw(400, "Invalid data passed, check the data and try again");

  let response;
  try {
    response = await report.updateOne(
      {
        _id: { $oid: reportId },
      },
      {
        $set: {
          date: data.date,
          done: data.done,
          notes: data.notes,
          quote: data.quote,
        },
      }
    );
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  ctx.response.body = { response, message: "report updated" };
});

router.delete("/report/:id", async (ctx) => {
  const reportId = ctx.params.id;

  let response;
  try {
    response = await report.deleteOne({ _id: { $oid: reportId } });
  } catch (err) {
    ctx.throw(
      500,
      Deno.env.get("DENO_ENV") === "development" ? err : "Something went wrong"
    );
  }
  if (!response) ctx.throw(404, "Report delete failed");
  ctx.response.body = { message: "report deleted successfully", response };
});

export default router;
