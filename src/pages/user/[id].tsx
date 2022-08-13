import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/future/image";
import Link from "next/link";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsPlay } from "react-icons/bs";

import Navbar from "@/components/Layout/Navbar";
import Meta from "@/components/Shared/Meta";
import { prisma } from "@/server/db/client";
import { formatNumber } from "@/utils/number";
import { formatAccountName } from "@/utils/text";
import { trpc } from "@/utils/trpc";

import { authOptions } from "../api/auth/[...nextauth]";

const UserProfile: NextPage<UserProfileProps> = ({ user }) => {
  const session = useSession();

  const followMutation = trpc.useMutation("follow.toggle");

  const [isCurrentlyFollowed, setIsCurrentlyFollowed] = useState(
    user?.followedByMe!
  );

  const toggleFollow = () => {
    if (!session.data?.user) {
      toast("You need to log in");
      return;
    }
    followMutation.mutateAsync({
      followingId: user?.id!,
      isFollowed: !isCurrentlyFollowed,
    });
    setIsCurrentlyFollowed(!isCurrentlyFollowed);
  };

  return (
    <>
      <Meta
        title={`${user?.name} (@${formatAccountName(user?.name!)}) | TopTop`}
        description={`${user?.name} on TopTop`}
        image={user?.image!}
      />

      <Navbar />
      <div className="flex justify-center mx-4">
        <div className="w-full max-w-[1150px]">
          <div className="p-5 border-b mb-5">
            <div className="flex gap-3">
              <div>
                <Image
                  src={user?.image!}
                  alt=""
                  height={115}
                  width={115}
                  className="object-cover rounded-full"
                />
              </div>

              <div>
                <h1 className="text-3xl font-semibold">
                  {formatAccountName(user?.name!)}
                </h1>
                <p className="text-lg mt-2">{user?.name}</p>

                {/* @ts-ignore */}
                {user?.id !== session.data?.user?.id && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleFollow()}
                      className={`py-1 px-3 rounded text-sm mt-2 ${
                        isCurrentlyFollowed ?? user?.followedByMe
                          ? "border hover:bg-[#F8F8F8] transition"
                          : "border border-pink text-pink hover:bg-[#FFF4F5] transition"
                      }`}
                    >
                      {isCurrentlyFollowed ?? user?.followedByMe
                        ? "Following"
                        : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {formatNumber(user?._count.followings!)}
                </span>
                <span>Followings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {formatNumber(user?._count.followers!)}
                </span>
                <span>Followers</span>
              </div>
            </div>
          </div>

          {user?.videos.length === 0 ? (
            <p className="text-center">There is no video here</p>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(120px,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))]">
              {user?.videos.map((video) => (
                <div key={video.id}>
                  <Link href={`/video/${video.id}`}>
                    <a className="block h-0 relative pb-[131%]">
                      <img
                        className="absolute inset-0 h-full w-full object-cover rounded"
                        src={video.coverURL}
                        alt=""
                      />
                      <BsPlay className="absolute left-3 bottom-3 fill-white w-7 h-7" />
                    </a>
                  </Link>
                  <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {video.caption}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;

type UserProfileProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export const getServerSideProps = async ({
  params,
  req,
  res,
}: GetServerSidePropsContext) => {
  try {
    const id = params?.id as string;

    const session = (await getServerSession(req, res, authOptions)) as any;

    const [user, followInfo] = await Promise.all([
      prisma.user.findFirstOrThrow({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
          _count: { select: { followers: true, followings: true } },
          videos: {
            select: { id: true, coverURL: true, caption: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      session?.user?.id
        ? prisma.follow.findFirst({
            where: {
              followerId: session.user.id,
              followingId: id,
            },
          })
        : Promise.resolve(null),
    ]);

    return {
      props: {
        session,
        user: {
          ...user,
          followedByMe: Boolean(followInfo),
        },
      },
    };
  } catch (error) {
    return { props: {}, notFound: true };
  }
};
