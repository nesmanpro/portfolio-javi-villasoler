"use client";

import { useRef, useState } from "react";
import MediaReveal from "@/components/MediaReveal";
import { useHomeContent } from "@/hooks/useContent";

export default function Showreel() {
  const { data: home } = useHomeContent();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section data-theme-section="dark" className="px-[4vw] pb-[16vh]">
      <button
        type="button"
        onClick={toggleSound}
        data-cursor={muted ? "Sound on" : "Sound off"}
        className="block w-full cursor-pointer"
        aria-label={muted ? "Unmute showreel" : "Mute showreel"}
      >
        <MediaReveal className="aspect-video w-full">
          <video
            ref={videoRef}
            src={home.showreelVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        </MediaReveal>
      </button>
      <div className="mt-4 flex justify-between">
        <span className="label-mono opacity-50">{home.showreelCaptionLeft}</span>
        <span className="label-mono opacity-50">{home.showreelCaptionRight}</span>
      </div>
    </section>
  );
}
