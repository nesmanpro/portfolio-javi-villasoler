"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/projects";
import TransitionLink from "@/components/TransitionLink";
import MediaReveal from "@/components/MediaReveal";
import SplitReveal from "@/components/SplitReveal";
import { useIsTouch } from "@/hooks/useIsTouch";

interface Props {
  project: Project;
  index: number;
  className?: string;
}

export default function ProjectCard({ project, index, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTouch = useIsTouch();

  const play = () => videoRef.current?.play().catch(() => {});
  const pause = () => videoRef.current?.pause();

  // Touch has no hover: play each clip while it's in view (and pause it when
  // it leaves, so the phone isn't decoding every project video at once).
  useEffect(() => {
    if (!isTouch) return;
    const video = videoRef.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [isTouch]);

  return (
    <TransitionLink
      href={`/work/${project.slug}`}
      label={project.title}
      data-cursor-tag={project.title}
      className={`group block ${className}`}
      onMouseEnter={isTouch ? undefined : play}
      onMouseLeave={isTouch ? undefined : pause}
    >
      <div className="relative">
        <MediaReveal parallax className="aspect-[4/3] md:aspect-[16/10]">
          {/* Static photo underneath */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </MediaReveal>
        {/* On a real pointer the clip pops in on hover, framed by the photo.
            On touch there's no hover, so the video is always shown and
            autoplays — otherwise you'd never see it. (Inline styles override
            the .card-video hover rule.) */}
        <div
          className="card-video"
          style={isTouch ? { opacity: 1, transform: "scale(1)" } : undefined}
        >
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <SplitReveal
          as="h3"
          type="lines"
          className="display"
        >
          <span style={{ fontSize: "clamp(1.8rem, 3.2vw, 3.4rem)" }}>
            {project.title}
          </span>
        </SplitReveal>
        <SplitReveal as="p" type="lines" delay={0.1} className="label-mono opacity-50 text-right shrink-0">
          {`${project.category} — ${project.year}`}
        </SplitReveal>
      </div>
      <span className="label-mono opacity-40 mt-1 block">
        {String(index + 1).padStart(2, "0")}
      </span>
    </TransitionLink>
  );
}
