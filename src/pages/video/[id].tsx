import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/future/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

import { prisma } from "@/server/db/client";
import { formatAccountName } from "@/utils/text";

import { authOptions } from "../api/auth/[...nextauth]";

const Video: NextPage<VideoProps> = ({ video }) => {
  const session = useSession();
  const router = useRouter();

  const [isBackButtonVisible, setIsBackButtonVisible] = useState(false);

  useEffect(() => {
    if (history.length > 2) setIsBackButtonVisible(true);
  }, []);

  if (!video) return <></>;

  return (
    <div className="flex min-h-screen items-stretch">
      <div className="flex-grow flex justify-center items-center relative bg-[#1E1619]">
        <video
          className="w-auto h-auto max-w-full max-h-full"
          src={video.videoURL}
          muted
          // autoPlay
          loop
          poster={video.coverURL}
        ></video>
        <div className="absolute top-5 left-5 flex gap-3">
          {isBackButtonVisible && (
            <button
              onClick={() => router.back()}
              className="bg-[#3D3C3D] w-[40px] h-[40px] rounded-full flex justify-center items-center"
            >
              <FaTimes className="w-5 h-5 fill-white" />
            </button>
          )}
          <Link href="/">
            <a className="w-[40px] h-[40px]">
              <img
                className="w-full h-full object-cover rounded-full"
                src="/favicon.png"
                alt=""
              />
            </a>
          </Link>
        </div>
      </div>
      <div className="w-[500px] flex-shrink-0">
        <div className="px-4 pt-6 pb-2">
          <div className="flex ">
            <div className="mr-3">
              <Image
                src={video.user.image!}
                alt=""
                height={40}
                width={40}
                className="rounded-full"
              />
            </div>
            <div className="flex-grow">
              <p className="font-bold">{formatAccountName(video.user.name!)}</p>
              <p className="text-sm">{video.user.name}</p>
            </div>
            {/* @ts-ignore */}
            {video.userId !== session.data?.user.id && (
              <div className="flex-shrink-0">
                <button
                  // onClick={() => toggleFollow()}
                  className={`py-1 px-3 rounded text-sm mt-2 ${
                    // isCurrentlyFollowed ?? video.followedByMe
                    true
                      ? "border hover:bg-[#F8F8F8] transition"
                      : "border border-pink text-pink hover:bg-[#FFF4F5] transition"
                  }`}
                >
                  {/* {isCurrentlyFollowed ?? video.followedByMe
                  ? "Following"
                  : "Follow"} */}
                  Follow
                </button>
              </div>
            )}
          </div>
          <p
            className="my-3"
            style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
          >
            {video.caption}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Video;

type VideoProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export const getServerSideProps = async ({
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await getServerSession(req, res, authOptions);
  try {
    const id = params?.id as string;

    const video = await prisma.video.findFirstOrThrow({
      where: {
        id,
      },
      select: {
        videoURL: true,
        coverURL: true,
        shareCount: true,
        caption: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        user: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                image: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      props: {
        video,
        session,
      },
    };
  } catch (error) {
    return {
      props: {
        session,
      },
      notFound: true,
    };
  }
};
