import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createRouter } from "./context";

export const likeRouter = createRouter()
  .query("count", {
    input: z.object({
      videoId: z.string(),
    }),
    resolve: async ({ ctx: { prisma }, input }) => {
      const count = await prisma.like.count({
        where: {
          videoId: input.videoId,
        },
      });
      return {
        count,
      };
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("toggle", {
    input: z.object({
      videoId: z.string(),
      isLiked: z.boolean(),
    }),
    resolve: async ({ ctx: { prisma, session }, input }) => {
      if (input.isLiked) {
        await prisma.like.create({
          data: {
            videoId: input.videoId,
            userId: session?.user?.id!,
          },
        });
      } else {
        await prisma.like.delete({
          where: {
            videoId_userId: {
              userId: session?.user?.id!,
              videoId: input.videoId,
            },
          },
        });
      }
      return {
        message: "OK",
      };
    },
  });
