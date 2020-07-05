import { Context, isHttpError, Status } from "../deps.ts";

export const errorHandler = async (ctx: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    ctx.response.body = { error: err.message };
  }
};
/*
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.NotFound:
          ctx.response.status = 404;
          ctx.response.body = {
            message: "NotFound",
          };
        default:
          ctx.response.status = 404;
          ctx.response.body = {
            message: "something went wrong",
          };
      }
    } else {
      throw err;
    }*/
