import { FC, useEffect, useRef } from "react";
import { User, Video } from "@prisma/client";

import { AiFillHeart } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import Image from "next/future/image";
import { InView } from "react-intersection-observer";
import { IoIosShareAlt } from "react-icons/io";
import VideoPlayer from "./VideoPlayer";
import { formatAccountName } from "@/utils/text";
import { trpc } from "@/utils/trpc";

interface MainProps {
  defaultVideos: (Video & {
    user: User;
  })[];
}

const Main: FC<MainProps> = ({ defaultVideos }) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(["video.for-you", {}], {
      getNextPageParam: (lastPage) => lastPage.nextSkip,
      initialData: {
        pages: [{ items: defaultVideos, nextSkip: 10 }],
        pageParams: [null],
      },
    });

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // https://stackoverflow.com/questions/59918942/how-to-get-all-entries-using-intersection-observer-api
    // Find the video which is most inside the viewport

    if (!window.IntersectionObserver) return;

    if (observer.current) observer.current.disconnect();

    let videoElements = Array.from(
      document.querySelectorAll("video")
    ) as HTMLVideoElement[];

    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // @ts-ignore
          entry.target.intersectionRatio = entry.intersectionRatio;
        }
        const mostVisible = videoElements.reduce((prev, current) => {
          if (
            // @ts-ignore
            current.intersectionRatio > (prev ? prev.intersectionRatio : 0)
          ) {
            return current;
          } else {
            return prev;
          }
        }, null as HTMLVideoElement | null);

        if (mostVisible && mostVisible.paused) mostVisible.play();

        videoElements.forEach((item) => {
          if (item !== mostVisible && !item.paused) item.pause();
        });
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }
    );

    videoElements.forEach((item) => observer.current?.observe(item));
  }, [data?.pages.length]);

  if (data?.pages.length === 0 || data?.pages[0]?.items.length === 0)
    return (
      <div className="flex-grow text-center my-4">There is no video yet</div>
    );

  return (
    <div className="flex-grow">
      {data?.pages.map((page) =>
        page.items.map((video) => (
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
              <div>
                <p className="flex items-end gap-2">
                  <span className="font-bold">
                    {formatAccountName(video.user.name!)}
                  </span>
                  <span className="text-sm">{video.user.name}</span>
                </p>
                <p
                  style={{ wordWrap: "break-word", overflowWrap: "break-word" }}
                >
                  {video.caption}
                </p>
              </div>
              <div className="flex items-end gap-5">
                <div
                  className={`${
                    video.videoHeight > video.videoWidth * 1.3
                      ? "h-[600px]"
                      : "flex-grow h-auto"
                  } rounded-md overflow-hidden`}
                >
                  <VideoPlayer
                    src={video.videoURL}
                    poster={video.coverURL}
                    preload="none"
                    loop
                    controls={false}
                  ></VideoPlayer>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full">
                    <AiFillHeart className="w-7 h-7" />
                  </button>
                  <p className="text-center text-xs font-semibold">845.1K</p>
                  <button className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full">
                    <FaCommentDots className="w-6 h-6 scale-x-[-1]" />
                  </button>
                  <p className="text-center text-xs font-semibold">8452</p>
                  <button className="w-12 h-12 bg-[#F1F1F2] fill-black flex justify-center items-center rounded-full">
                    <IoIosShareAlt className="w-8 h-8" />
                  </button>
                  <p className="text-center text-xs font-semibold">6128</p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* At the bottom to detect infinite scroll */}
      <InView
        fallbackInView
        onChange={(inView) => {
          if (inView && !isFetchingNextPage && hasNextPage) {
            fetchNextPage();
          }
        }}
        rootMargin="0px 0px 1500px 0px"
      >
        {({ ref }) => <div ref={ref} className="h-10"></div>}
      </InView>
    </div>
  );
};

export default Main;
