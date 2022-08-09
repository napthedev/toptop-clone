import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { z } from "zod";

export const videoRouter = createRouter()
  .query("for-you", {
    input: z.object({
      cursor: z.number().nullish(),
    }),
    resolve: async ({ ctx: { prisma }, input }) => {
      const skip = input.cursor || 0;
      const items = await prisma.video.findMany({
        take: 10,
        skip,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return {
        items,
        nextSkip: items.length === 0 ? null : skip + 10,
      };
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("create", {
    input: z.object({
      caption: z.string(),
      videoURL: z.string().url(),
      coverURL: z.string().url(),
      videoWidth: z.number().gt(0),
      videoHeight: z.number().gt(0),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      const created = await prisma.video.create({
        data: {
          ...input,
          userId: session?.user?.id!,
        },
      });
      return created;
    },
  });
