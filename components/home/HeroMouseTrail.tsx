"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useHeroContent, useProjects } from "@/hooks/useContent";

/**
 * Gravity-based mouse trail for the hero — a faithful port of the
 * "Made With GSAP × Codrops" tutorial (madewithgsap.com/codrops).
 *
 * While the cursor MOVES, project thumbnails spawn at the pointer, pop in
 * with an elastic overshoot, then fall, bounce and drop off the bottom of
 * the viewport. A still cursor spawns nothing — images only appear once the
 * accumulated travel distance passes a threshold, so it feels like the
 * motion itself is flinging them out.
 *
 * The falling layer is pointer-events:none so the hero text/links underneath
 * stay clickable; we listen for movement on the parent <section>.
 */
export default function HeroMouseTrail() {
  const { data: hero } = useHeroContent();
  const { data: projects } = useProjects();
  const layerRef = useRef<HTMLDivElement>(null);

  // Prefer dedicated trail images set in the CMS (Hero → Trail images);
  // fall back to the project photos when none are configured. Snapshotted
  // into a ref so the pointer handler always reads the latest without
  // re-binding listeners.
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
      if (!section) return;

      // Preload the thumbnails so the first fling isn't blank.
      for (const src of imagesRef.current) {
        const img = new Image();
        img.src = src;
      }

      let incr = 0;
      let oldIncrX = 0;
      let oldIncrY = 0;
      let firstMove = true;
      let indexImg = 0;

      const isCoarse = window.matchMedia("(hover: none)").matches;

      const applyMove = (clientX: number, clientY: number) => {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const valX = gsap.utils.clamp(0, W, clientX);
        const valY = gsap.utils.clamp(0, H, clientY);

        if (firstMove) {
          firstMove = false;
          oldIncrX = valX;
          oldIncrY = valY;
          return;
        }

        // Distance threshold — one image per ~⅛ of the viewport travelled
        // (a bit denser on touch, where drags are shorter).
        const resetDist = W / (isCoarse ? 6 : 8);
        incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);

        if (incr > resetDist) {
          incr = 0;
          const rect = layer.getBoundingClientRect();
          createMedia(
            valX - rect.left,
            valY - rect.top,
            valX - oldIncrX,
            valY - oldIncrY,
          );
        }

        oldIncrX = valX;
        oldIncrY = valY;
      };

      const createMedia = (
        x: number,
        y: number,
        deltaX: number,
        deltaY: number,
      ) => {
        const srcs = imagesRef.current;
        if (!srcs.length) return;

        const rect = layer.getBoundingClientRect();
        const H = rect.height;
        // Skip spawns too close to the bottom — no room to fall.
        if (y > H - 200) return;

        const image = document.createElement("img");
        image.src = srcs[indexImg];
        image.alt = "";
        // Inline styles (not a CSS class) so the effect survives Turbopack's
        // stale-globals.css HMR bug — square thumbnails, 15vw (35vw on small
        // screens), anchored top-left so GSAP x/y place them at the cursor.
        const side = (window.innerWidth <= 768 ? 35 : 15) + "vw";
        Object.assign(image.style, {
          position: "absolute",
          top: "0",
          left: "0",
          width: side,
          height: side,
          objectFit: "cover",
          borderRadius: "4%",
          willChange: "transform",
        });
        layer.appendChild(image);

        const tl = gsap.timeline({
          onComplete: () => {
            image.remove();
            tl.kill();
          },
        });

        // 1. Pop in on the cursor with an elastic overshoot + random tilt
        tl.fromTo(
          image,
          {
            xPercent: -50 + (Math.random() - 0.5) * 80,
            yPercent: -50 + (Math.random() - 0.5) * 10,
            scaleX: 1.3,
            scaleY: 1.3,
            rotation: (Math.random() - 0.5) * 20,
          },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "elastic.out(2, 0.6)",
            duration: 0.4,
          },
        );

        // 2. Drift sideways with the cursor's momentum (runs with the pop)
        tl.fromTo(
          image,
          { x },
          {
            x: "+=" + deltaX * 2,
            rotation: 0,
            ease: "power1.in",
            duration: 0.4,
          },
          "<",
        );

        // 3. Fall to the floor
        tl.fromTo(
          image,
          { y },
          {
            y: "+=" + (H - y),
            scale: 0.9,
            yPercent: -95,
            ease: "back.in(1.1)",
            duration: 0.4,
          },
          "<",
        );

        // 4. Bounce: kick sideways + drop off the bottom (higher spawns
        //    bounce harder via the dynamic ease strength)
        tl.to(image, {
          x: "+=" + deltaX * 1.6,
          rotation: (Math.random() - 0.5) * 40,
          ease: "power1.in",
          duration: 0.3,
        });
        tl.to(
          image,
          {
            yPercent: 150,
            ease: "back.in(" + (1.5 + (1 - y / H)) + ")",
            duration: 0.3,
          },
          "<",
        );

        indexImg = (indexImg + 1) % srcs.length;
      };

      const onMouseMove = (e: MouseEvent) => applyMove(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        const t = e.touches?.[0];
        if (t) applyMove(t.clientX, t.clientY);
      };

      section.addEventListener("mousemove", onMouseMove);
      section.addEventListener("touchstart", onTouchMove, { passive: true });
      section.addEventListener("touchmove", onTouchMove, { passive: true });

      return () => {
        section.removeEventListener("mousemove", onMouseMove);
        section.removeEventListener("touchstart", onTouchMove);
        section.removeEventListener("touchmove", onTouchMove);
      };
    },
    { scope: layerRef },
  );

  // Inline styles (see note in createMedia) — full-bleed falling layer that
  // lets clicks through to the hero text/links underneath.
  return (
    <div
      ref={layerRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}
