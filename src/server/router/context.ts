import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession as getServerSession } from "next-auth";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { prisma } from "../db/client";

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  const req = opts?.req;
  const res = opts?.res;

  const session = (req &&
    res &&
    (await getServerSession(req, res, authOptions))) as
    | {
        user?: {
          name?: string | null;
          email?: string | null;
          image?: string | null;
          id?: string | null;
        };
        expires: string;
      }
    | null
    | undefined;

  return {
    req,
    res,
    session,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
