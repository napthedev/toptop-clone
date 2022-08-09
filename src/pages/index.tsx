import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import Main from "@/components/Home/Main";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Home/Sidebar";
import { authOptions } from "./api/auth/[...nextauth]";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { prisma } from "@/server/db/client";

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
  const session = await getServerSession(req, res, authOptions);

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
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    props: {
      session,
      suggestedAccounts,
      defaultVideos,
    },
  };
};
