import { User, Video } from "@prisma/client";
import { FC, useEffect, useRef } from "react";
import { InView } from "react-intersection-observer";

import { trpc } from "@/utils/trpc";

import VideoSection from "./VideoSection";

interface MainProps {
  defaultVideos: (Video & {
    user: User;
    _count: {
      likes: number;
      comments: number;
    };
    likedByMe: boolean;
  })[];
}

const Main: FC<MainProps> = ({ defaultVideos }) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
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
          <VideoSection video={video} key={video.id} refetch={refetch} />
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
