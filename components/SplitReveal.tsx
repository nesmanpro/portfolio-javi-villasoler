"use client";

import { createElement, ReactNode, useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { bus } from "@/lib/bus";

interface Props {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span" | "li";
  /** what to stagger */
  type?: "lines" | "words" | "chars";
  /** "load" plays on page reveal, "scroll" when the element enters the viewport */
  trigger?: "load" | "scroll";
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SplitReveal({
  children,
  as = "div",
  type = "lines",
  trigger = "scroll",
  delay = 0,
  stagger,
  duration = 1.1,
  className = "",
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      let offReveal: (() => void) | undefined;

      const split = SplitText.create(el, {
        type: type === "lines" ? "lines" : `lines,${type}`,
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          el.classList.remove("split-pending");
          const targets =
            type === "lines"
              ? self.lines
              : type === "words"
              ? self.words
              : self.chars;
          const vars: gsap.TweenVars = {
            yPercent: 0,
            duration,
            // Slight overshoot for a springier, more dynamic settle
            ease: "back.out(1.3)",
            stagger: stagger ?? (type === "chars" ? 0.02 : 0.08),
          };

          if (trigger === "scroll") {
            return gsap.fromTo(
              targets,
              { yPercent: 115 },
              {
                ...vars,
                delay,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }
            );
          }

          gsap.set(targets, { yPercent: 115 });
          offReveal?.();
          offReveal = bus.onReveal(() =>
            gsap.to(targets, { ...vars, delay: delay + 0.15 })
          );
        },
      });

      return () => {
        offReveal?.();
        split.revert();
      };
    },
    { scope: ref }
  );

  return createElement(
    as,
    { ref, className: `split-pending ${className}`, style },
    children
  );
}
