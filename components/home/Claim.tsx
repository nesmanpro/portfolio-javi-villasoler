"use client";

import { Fragment, ReactNode, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useHomeContent } from "@/hooks/useContent";
import type { ClaimLine } from "@/lib/content";

/**
 * Highlighted word: same color as the sentence but set in a contrasting
 * typeface. While hovered, images keep popping out of the cursor — each
 * one bursts from a point with a springy scale, slightly rotated at
 * random, then fades away with a delay so 3–5 overlap at any moment.
 */
function Hl({ children, images }: { children: ReactNode; images: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Warm the image pool so pops never render blank
  useEffect(() => {
    for (const src of images) {
      const img = new Image();
      img.src = src;
    }
  }, [images]);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const spawn = () => {
    const host = ref.current;
    if (!host || images.length === 0) return;
    const rect = host.getBoundingClientRect();
    const img = document.createElement("img");
    img.src = images[count.current++ % images.length];
    img.alt = "";
    img.className = "claim-pop";
    host.appendChild(img);
    gsap.set(img, {
      x: pos.current.x - rect.left + gsap.utils.random(-8, 8),
      y: pos.current.y - rect.top + gsap.utils.random(-8, 8),
      xPercent: -50,
      yPercent: -50,
      rotation: gsap.utils.random(-15, 15),
      scale: 0.01,
    });
    gsap.to(img, { scale: 1, duration: 0.5, ease: "back.out(1.7)" });
    gsap.to(img, {
      autoAlpha: 0,
      scale: 0.5,
      rotation: `+=${gsap.utils.random(-6, 6)}`,
      duration: 0.35,
      delay: 0.65,
      ease: "power2.in",
      onComplete: () => img.remove(),
    });
  };

  const onEnter = (e: React.MouseEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };
    spawn();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(spawn, 200);
  };

  const onMove = (e: React.MouseEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };
  };

  const onLeave = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  return (
    <span
      ref={ref}
      className="claim-word"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </span>
  );
}

function Line({ children }: { children: ReactNode }) {
  return (
    <span className="block overflow-hidden py-[0.06em]">
      <span className="claim-line block">{children}</span>
    </span>
  );
}

/** Render a claim line, wrapping `highlightedWord` (if present in the
 *  text) with the image-burst hover behaviour. */
function renderLine(line: ClaimLine) {
  const { lineText, highlightedWord, hoverImageUrls } = line;
  if (!highlightedWord || !lineText.includes(highlightedWord)) {
    return lineText;
  }
  const [before, ...rest] = lineText.split(highlightedWord);
  const after = rest.join(highlightedWord);
  return (
    <Fragment>
      {before}
      <Hl images={hoverImageUrls ?? []}>{highlightedWord}</Hl>
      {after}
    </Fragment>
  );
}

export default function Claim() {
  const rootRef = useRef<HTMLElement>(null);
  const { data: home } = useHomeContent();

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".claim-line").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "back.out(1.3)",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            // Release the reveal mask so hover pops can overflow the line
            onComplete: () => {
              if (el.parentElement) el.parentElement.style.overflow = "visible";
            },
          }
        );
      });
    },
    { scope: rootRef, dependencies: [home.claimLines.length] }
  );

  return (
    <section
      ref={rootRef}
      data-theme-section="light"
      className="px-[4vw] py-[22vh]"
    >
      <h2
        className="display text-center"
        style={{ fontSize: "clamp(2.2rem, 5.8vw, 6.2rem)" }}
      >
        {home.claimLines.map((line) => (
          <Line key={line.lineText}>{renderLine(line)}</Line>
        ))}
      </h2>
    </section>
  );
}
