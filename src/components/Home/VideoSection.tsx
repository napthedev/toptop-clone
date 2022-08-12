import { User, Video } from "@prisma/client";
import Image from "next/future/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiFillTwitterCircle } from "react-icons/ai";
import { BiLink } from "react-icons/bi";
import { BsFacebook, BsReddit } from "react-icons/bs";
import { FaCommentDots } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";

import { copyToClipboard } from "@/utils/clipboard";
import { formatNumber } from "@/utils/number";
import { formatAccountName } from "@/utils/text";
import { trpc } from "@/utils/trpc";

import VideoPlayer from "./VideoPlayer";

interface VideoSectionProps {
  video: Video & {
    user: User;
    _count: {
      likes: number;
      comments: number;
    };
    likedByMe: boolean;
    followedByMe: boolean;
  };
  origin: string;
  refetch: Function;
}

const VideoSection: FC<VideoSectionProps> = ({ video, refetch, origin }) => {
  const session = useSession();

  const likeMutation = trpc.useMutation("like.toggle");
  const followMutation = trpc.useMutation("follow.toggle");

  const [isCurrentlyLiked, setIsCurrentlyLiked] = useState(video.likedByMe);
  const [isCurrentlyFollowed, setIsCurrentlyFollowed] = useState<
    undefined | boolean
  >(undefined);

  const videoURL = `${origin}/video/${video.id}`;

  const toggleLike = () => {
    if (!session.data?.user) {
      toast("You need to login");
    } else {
      likeMutation
        .mutateAsync({
          isLiked: !isCurrentlyLiked,
          videoId: video.id,
        })
        .then(() => {
          refetch();
        })
        .catch((err) => {
          console.log(err);
          setIsCurrentlyLiked(isCurrentlyLiked);
        });
      setIsCurrentlyLiked(!isCurrentlyLiked);
    }
  };

  const toggleFollow = () => {
    followMutation
      .mutateAsync({
        followingId: video.userId,
        isFollowed:
          typeof isCurrentlyFollowed === "undefined"
            ? !video.followedByMe
            : !isCurrentlyFollowed,
      })
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.log(err);
        setIsCurrentlyFollowed(isCurrentlyFollowed);
      });
    setIsCurrentlyFollowed(
      typeof isCurrentlyFollowed === "undefined"
        ? !video.followedByMe
        : !isCurrentlyFollowed
    );
  };

  return (
    <div key={video.id} className="flex p-4 gap-3">
      <div className="flex-shrink-0">
        <Image
          width={60}
          height={60}
          src={video.user.image!}
          className="rounded-full"
          alt=""
        />
      </div>
      <div className="flex flex-col items-stretch gap-3 flex-grow">
        <div className="flex">
          <div className="flex-grow">
            <p className="flex items-end gap-2">
              <span className="font-bold">
                {formatAccountName(video.user.name!)}
              </span>
              <span className="text-sm">{video.user.name}</span>
            </p>
            <p style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
              {video.caption}
            </p>
          </div>
          {/* @ts-ignore */}
          {video.userId !== session.data?.user.id && (
            <div className="flex-shrink-0">
              <button
                onClick={() => toggleFollow()}
                className={`py-1 px-3 rounded text-sm mt-2 ${
                  isCurrentlyFollowed ?? video.followedByMe
                    ? "border hover:bg-[#F8F8F8] transition"
                    : "border border-pink text-pink hover:bg-[#FFF4F5] transition"
                }`}
              >
                {isCurrentlyFollowed ?? video.followedByMe
                  ? "Following"
                  : "Follow"}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-end gap-5">
          <Link href={`/video/${video.id}`}>
            <a
              className={`${
                video.videoHeight > video.videoWidth * 1.3
                  ? "h-[600px]"
                  : "flex-grow h-auto"
              } block rounded-md overflow-hidden`}
            >
              <VideoPlayer
                src={video.videoURL}
                poster={video.coverURL}
                preload="none"
                loop
                controls={false}
              ></VideoPlayer>
            </a>
          </Link>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => toggleLike()}
              className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full"
            >
              <AiFillHeart
                className={`w-7 h-7 ${isCurrentlyLiked ? "fill-pink" : ""}`}
              />
            </button>
            <p className="text-center text-xs font-semibold">
              {formatNumber(video._count.likes)}
            </p>
            <Link href={`/video/${video.id}`}>
              <a className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full">
                <FaCommentDots className="w-6 h-6 scale-x-[-1]" />
              </a>
            </Link>
            <p className="text-center text-xs font-semibold">
              {formatNumber(video._count.comments)}
            </p>
            <div className="relative group">
              <button className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full">
                <IoIosShareAlt className="w-8 h-8" />
              </button>
              <div className="absolute bottom-[100%] right-0 rounded-md py-2 flex flex-col items-stretch bg-white border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <a
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 transition"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    videoURL
                  )}&t=${encodeURIComponent(`${video.user.name} on TopTop`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BsFacebook className="fill-[#0476E9] w-7 h-7" />
                  <span className="whitespace-nowrap">Share to Facebook</span>
                </a>
                <a
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 transition"
                  href={`http://twitter.com/share?text=${encodeURIComponent(
                    `${video.user.name} on TopTop`
                  )}&url=${encodeURIComponent(videoURL)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillTwitterCircle className="fill-[#05AAF4] w-8 h-8 mx-[-2px]" />
                  <span className="whitespace-nowrap">Share to Twitter</span>
                </a>
                <a
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 transition"
                  href={`http://www.reddit.com/submit?url=${encodeURIComponent(
                    videoURL
                  )}&title=${encodeURIComponent(
                    `${video.user.name} on TopTop`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BsReddit className="fill-[#FF4500] w-7 h-7" />
                  <span className="whitespace-nowrap">Share to Reddit</span>
                </a>
                <button
                  onClick={() => {
                    copyToClipboard(videoURL)
                      ?.then(() => toast("Copied to clipboard"))
                      ?.catch(() => toast.error("Failed to copy to clipboard"));
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 transition"
                >
                  <span className="w-7 h-7 flex justify-center items-center bg-[#FE2C55] rounded-full">
                    <BiLink className="fill-white w-5 h-5" />
                  </span>
                  <span className="whitespace-nowrap">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
