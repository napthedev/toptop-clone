import { createRouter } from "./context";
import superjson from "superjson";

import { videoRouter } from "./video";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("video.", videoRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
