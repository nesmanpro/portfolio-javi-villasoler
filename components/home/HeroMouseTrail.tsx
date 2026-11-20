"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useHeroContent, useProjects } from "@/hooks/useContent";

/**
 * Cursor-following image for the hero (extrafazant.nl style).
 *
 * The image only shows while the pointer is over a word of the headline,
 * and every word has its own image: moving onto another word pops the
 * card to that word's picture. It sits BEHIND the headline so the letters
 * read on top of it, trails the pointer with a soft lag, and shrinks away
 * once the pointer is off the words.
 *
 * The headline is pointer-events:none, so words are hit-tested by
 * geometry: HeroTitle tags every letter with data-word.
 */
export default function HeroMouseTrail() {
  const { data: hero } = useHeroContent();
  const { data: projects } = useProjects();
  const layerRef = useRef<HTMLDivElement>(null);

  // Prefer dedicated trail images set in the CMS (Hero → Trail images);
  // fall back to the project photos when none are configured. Kept in a ref
  // so the pointer handler always reads the latest without re-binding.
  const imagesRef = useRef<string[]>([]);
  imagesRef.current = (
    hero.trailImageUrls.length
      ? hero.trailImageUrls
      : projects.map((p) => p.image)
  ).filter(Boolean);

  useGSAP(
    () => {
      const layer = layerRef.current!;
      const section = layer.closest("section") as HTMLElement | null;
      const card = layer.querySelector<HTMLElement>(".hero-follow");
      if (!section || !card) return;
      const slides = card.querySelectorAll<HTMLImageElement>("img");

      // Preload so the first swap isn't blank.
      for (const src of imagesRef.current) {
        const img = new Image();
        img.src = src;
      }

      gsap.set(card, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
      const xTo = gsap.quickTo(card, "x", { duration: 0.55, ease: "power3" });
      const yTo = gsap.quickTo(card, "y", { duration: 0.55, ease: "power3" });

      let shown = false;
      let current = -1; // word under the pointer, -1 = none
      let top = 0; // which of the two stacked <img> is in front
      let hideTimer: ReturnType<typeof setTimeout> | null = null;

      const showImage = (word: number, pop: boolean) => {
        const srcs = imagesRef.current;
        top = 1 - top;
        const front = slides[top];
        const back = slides[1 - top];
        front.src = srcs[word % srcs.length];
        front.style.zIndex = "2";
        back.style.zIndex = "1";
        if (!pop) {
          gsap.set(front, { scale: 1, autoAlpha: 1 });
          return;
        }
        gsap.fromTo(
          front,
          { scale: 0.55, autoAlpha: 1 },
          { scale: 1, duration: 0.35, ease: "back.out(2)", overwrite: true },
        );
        gsap.to(card, {
          rotation: gsap.utils.random(-5, 5),
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const hide = () => {
        hideTimer = null;
        if (!shown) return;
        shown = false;
        current = -1;
        gsap.to(card, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power3.in",
          overwrite: "auto",
        });
      };

      /** Index of the headline word under (x, y), or -1. Each word's box
       *  is the union of its letters, so gaps between words don't count. */
      const wordAt = (x: number, y: number) => {
        const chars = section.querySelectorAll<HTMLElement>(".hero-char");
        for (const c of chars) {
          const w = Number(c.dataset.word);
          if (w < 0) continue;
          const r = c.getBoundingClientRect();
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            return w;
          }
        }
        return -1;
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch" || !imagesRef.current.length) return;
        const rect = layer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        xTo(x);
        yTo(y);

        const word = wordAt(e.clientX, e.clientY);
        if (word < 0) {
          // Small grace period so crossing the gap between two words
          // swaps the image instead of closing and reopening the card
          if (shown && !hideTimer) hideTimer = setTimeout(hide, 140);
          return;
        }
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        if (word === current) return;
        current = word;

        if (!shown) {
          shown = true;
          gsap.set(card, { x, y });
          showImage(word, false);
          gsap.to(card, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.45,
            ease: "back.out(1.7)",
            overwrite: "auto",
          });
        } else {
          showImage(word, true);
        }
      };

      const onLeave = () => {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        hide();
      };

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);

      return () => {
        if (hideTimer) clearTimeout(hideTimer);
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: layerRef },
  );

  const imgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "4%",
    visibility: "hidden",
  };

  // Inline styles (not CSS classes) so the effect survives Turbopack's
  // stale-globals.css HMR bug. z-index 1 keeps the card under the hero
  // text (z-10).
  return (
    <div
      ref={layerRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        className="hero-follow"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "clamp(11rem, 19vw, 24rem)",
          aspectRatio: "1 / 1",
          visibility: "hidden",
          willChange: "transform",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" style={imgStyle} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" style={imgStyle} />
      </div>
    </div>
  );
}
