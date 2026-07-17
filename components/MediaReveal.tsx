"use client";

import { ReactNode, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { bus } from "@/lib/bus";

interface Props {
  children: ReactNode;
  className?: string;
  /** "load" plays on page reveal, "scroll" when the element enters the viewport */
  trigger?: "load" | "scroll";
  /** subtle scrubbed parallax on the inner media while scrolling */
  parallax?: boolean;
  delay?: number;
}

/**
 * Curtain-style media reveal: the container un-clips from the bottom while
 * the media inside scales down — the classic GSAP image entrance.
 */
export default function MediaReveal({
  children,
  className = "",
  trigger = "scroll",
  parallax = false,
  delay = 0,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const outer = outerRef.current!;
      const inner = innerRef.current!;
      const restScale = parallax ? 1.18 : 1.02;
      let offReveal: (() => void) | undefined;

      gsap.set(outer, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(inner, { scale: 1.45 });

      const tl = gsap
        .timeline({
          paused: trigger === "load",
          delay,
          scrollTrigger:
            trigger === "scroll"
              ? { trigger: outer, start: "top 82%", once: true }
              : undefined,
        })
        .to(outer, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.15,
          ease: "power4.inOut",
        })
        .to(
          inner,
          { scale: restScale, duration: 1.6, ease: "back.out(1.1)" },
          0.1
        );

      if (trigger === "load") {
        offReveal = bus.onReveal(() => {
          gsap.delayedCall(0.35 + delay, () => tl.play(0));
        });
      }

      if (parallax) {
        gsap.fromTo(
          inner,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      return () => offReveal?.();
    },
    { scope: outerRef }
  );

  return (
    <div ref={outerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={innerRef} className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
