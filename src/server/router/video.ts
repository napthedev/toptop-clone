import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createRouter } from "./context";

export const videoRouter = createRouter()
  .query("for-you", {
    input: z.object({
      cursor: z.number().nullish(),
    }),
    resolve: async ({ ctx: { prisma, session }, input }) => {
      const skip = input.cursor || 0;
      const items = await prisma.video.findMany({
        take: 10,
        skip,
        include: {
          user: true,
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const likes = session?.user?.id
        ? await prisma.like.findMany({
            where: {
              userId: session.user.id,
              videoId: { in: items.map((item) => item.id) },
            },
          })
        : [];

      return {
        items: items.map((item) => ({
          ...item,
          likedByMe: likes.some((like) => like.videoId === item.id),
        })),
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
