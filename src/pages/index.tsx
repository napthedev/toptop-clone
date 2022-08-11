import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";

import Main from "@/components/Home/Main";
import Sidebar from "@/components/Home/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { prisma } from "@/server/db/client";

import { authOptions } from "./api/auth/[...nextauth]";

const Home: NextPage<HomeProps> = ({ suggestedAccounts, defaultVideos }) => {
  return (
    <>
      <Navbar />
      <div className="flex justify-center mx-4">
        <div className="w-full max-w-[1150px] flex">
          <Sidebar suggestedAccounts={suggestedAccounts} />
          <Main defaultVideos={defaultVideos} />
        </div>
      </div>
    </>
  );
};

export default Home;

type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = (await getServerSession(req, res, authOptions)) as any;

  const [suggestedAccounts, defaultVideos] = await prisma.$transaction([
    prisma.user.findMany({
      take: 20,
      where: {
        email: {
          not: session?.user?.email,
        },
      },
    }),
    prisma.video.findMany({
      take: 10,
      skip: 0,
      include: {
        user: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const likes = session?.user?.id
    ? await prisma.like.findMany({
        where: {
          userId: session.user.id,
          videoId: { in: defaultVideos.map((item) => item.id) },
        },
      })
    : [];

  return {
    props: {
      session,
      suggestedAccounts,
      defaultVideos: defaultVideos.map((item) => ({
        ...item,
        likedByMe: likes.some((like) => like.videoId === item.id),
      })),
    },
  };
};
