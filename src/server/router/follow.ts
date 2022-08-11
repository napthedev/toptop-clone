import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createRouter } from "./context";

export const followRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("toggle", {
    input: z.object({
      followingId: z.string(),
      isFollowed: z.boolean(),
    }),
    resolve: async ({ ctx: { prisma, session }, input }) => {
      if (input.isFollowed) {
        await prisma.follow.create({
          data: {
            followingId: input.followingId,
            followerId: session?.user?.id!,
          },
        });
      } else {
        await prisma.follow.delete({
          where: {
            followingId_followerId: {
              followingId: input.followingId,
              followerId: session?.user?.id!,
            },
          },
        });
      }
      return {
        message: "OK",
      };
    },
  });
