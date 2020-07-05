export const errorHandler = async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLElBQXlCLEVBQUUsRUFBRTtJQUM1RSxJQUFJO1FBQ0YsTUFBTSxJQUFJLEVBQUUsQ0FBQztLQUNkO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1QztBQUNILENBQUMsQ0FBQztBQUNGOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JPIn0=