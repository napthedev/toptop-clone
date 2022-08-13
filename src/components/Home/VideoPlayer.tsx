import { FC, HTMLProps, useContext, useEffect, useRef, useState } from "react";
import {
  BsFillPlayFill,
  BsFillVolumeMuteFill,
  BsFillVolumeUpFill,
} from "react-icons/bs";
import { IoMdPause } from "react-icons/io";

import { VolumeContext } from "@/context/VolumeContext";

const Video: FC<HTMLProps<HTMLVideoElement>> = (props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);

  const { isMuted, setIsMuted } = useContext(VolumeContext);

  useEffect(() => {
    if (isPaused) {
      if (!videoRef.current?.paused) {
        videoRef.current?.pause();
      }
    } else {
      if (videoRef.current?.paused) {
        videoRef.current.play();
      }
    }
  }, [isPaused]);

  return (
    <div className="h-full w-auto relative cursor-pointer">
      <video
        {...props}
        ref={videoRef}
        className="max-h-full w-auto"
        onPauseCapture={() => setIsPaused(true)}
        onPlayCapture={() => setIsPaused(false)}
        muted={isMuted}
        playsInline
        loop
        controls={false}
      ></video>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsPaused(!isPaused);
        }}
        className="absolute bottom-4 left-3 z-10"
      >
        {isPaused ? (
          <BsFillPlayFill className="fill-white h-7 w-7" />
        ) : (
          <IoMdPause className="fill-white h-7 w-7" />
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsMuted(!isMuted);
        }}
        className="absolute bottom-4 right-3 z-10"
      >
        {isMuted ? (
          <BsFillVolumeMuteFill className="fill-white h-7 w-7" />
        ) : (
          <BsFillVolumeUpFill className="fill-white h-7 w-7" />
        )}
      </button>
    </div>
  );
};

export default Video;
