import superjson from "superjson";

import { createRouter } from "./context";
import { followRouter } from "./follow";
import { likeRouter } from "./like";
import { videoRouter } from "./video";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("video.", videoRouter)
  .merge("like.", likeRouter)
  .merge("follow.", followRouter);

export type AppRouter = typeof appRouter;
