"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { bus } from "@/lib/bus";
import { useLoaderContent } from "@/hooks/useContent";

/** Hard cap in case `load` never settles (slow videos, offline CMS…).
 *  The minimum display time is animation-driven instead of wall-clock:
 *  the loader never leaves before the intro + ~2 image cycles played. */
const MAX_SHOW_MS = 9000;

export default function Preloader() {
  const { data: loader } = useLoaderContent();
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  // Snapshot the name at mount: the char spans feed a GSAP timeline, so
  // they must not re-render mid-animation if CMS data arrives later.
  const [names] = useState(() => ({
    first: loader.firstName,
    last: loader.lastName,
  }));

  // Images CAN update mid-animation — the loop reads this ref each cycle,
  // so CMS images take over from the fallback as soon as they arrive.
  const imagesRef = useRef(loader.imageUrls);
  imagesRef.current = loader.imageUrls;
  useEffect(() => {
    for (const src of loader.imageUrls) {
      const img = new Image();
      img.src = src;
    }
  }, [loader.imageUrls]);

  const stopped = useRef(false);
  const finished = useRef(false);

  // Resolved from within the GSAP timeline once the intro has played and
  // the image conveyor completed a couple of cycles.
  const introPlayed = useRef<{ promise: Promise<void>; resolve: () => void }>(null!);
  if (!introPlayed.current) {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    introPlayed.current = { promise, resolve };
  }

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    gsap
      .timeline()
      .to(rootRef.current, {
        yPercent: -120,
        duration: 1,
        ease: "power4.inOut",
        delay: 0.15,
        onStart: () => bus.reveal(),
      })
      .call(() => {
        // Conveyor keeps cycling while the curtain lifts; stop it only
        // once the loader is gone.
        stopped.current = true;
        setDone(true);
      });
  }, []);

  // Leave when everything is actually loaded (fonts + window load) AND the
  // animation has played through, with a hard cap as safety net.
  useEffect(() => {
    const winLoaded = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise((r) => setTimeout(r, MAX_SHOW_MS));
    let alive = true;
    Promise.race([
      Promise.all([introPlayed.current.promise, winLoaded, fontsReady]),
      cap,
    ]).then(() => alive && finish());
    return () => {
      alive = false;
    };
  }, [finish]);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const chars = root.querySelectorAll<HTMLElement>(".loader-char");
      const fading = root.querySelectorAll<HTMLElement>(
        ".loader-char:not([data-keep]), .loader-gap"
      );
      const slot = root.querySelector<HTMLElement>(".loader-slot")!;
      const slides = root.querySelectorAll<HTMLImageElement>(".loader-slot img");

      gsap.set(slides, { yPercent: 110 });

      // Conveyor: each image enters from below, holds a beat, then shoots
      // up while the next one comes in underneath. Runs until finish().
      const state = { i: 0 };
      const cycle = () => {
        if (stopped.current) return;
        const img = slides[state.i % 2];
        const srcs = imagesRef.current;
        img.src = srcs[state.i % srcs.length];
        state.i += 1;
        gsap
          .timeline()
          .fromTo(
            img,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.38, ease: "power3.out" }
          )
          .to(img, { yPercent: -110, duration: 0.3, ease: "power3.in" }, "+=0.34");
        // Next image starts entering exactly when this one starts leaving
        gsap.delayedCall(0.38 + 0.34, cycle);
      };

      gsap
        .timeline()
        // 1. Full name appears, letter by letter
        .from(chars, {
          yPercent: 115,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.035,
        })
        // 2. Beat
        .to({}, { duration: 0.45 })
        // 3. Everything but the initials fades out…
        .to(fading, { opacity: 0, duration: 0.32, stagger: 0.015 })
        // 4. …and collapses, pulling the initials together while the image
        //    slot opens up between them (before they fully meet)
        .to(
          fading,
          { width: 0, duration: 0.6, ease: "power4.inOut" },
          ">-0.08"
        )
        .to(
          slot,
          {
            width: "0.92em",
            marginLeft: "0.08em",
            marginRight: "0.08em",
            duration: 0.6,
            ease: "power4.inOut",
          },
          "<"
        )
        // 5. First image rises while the slot is still opening
        .call(cycle, undefined, "<+0.28")
        // 6. After ~2 conveyor cycles the loader is allowed to leave
        //    (it keeps looping if the page is still loading)
        .call(() => introPlayed.current.resolve(), undefined, "+=1.6");
    },
    { scope: rootRef }
  );

  if (done) return null;

  const renderWord = (word: string, keyPrefix: string) =>
    [...word].map((char, i) => (
      <span
        key={`${keyPrefix}-${i}`}
        className="loader-char"
        {...(i === 0 ? { "data-keep": "true" } : {})}
      >
        {char}
      </span>
    ));

  return (
    <div
      ref={rootRef}
      className="curtain-panel fixed z-[100]"
      style={{ top: "-20lvh", left: "-10vw", width: "120vw", height: "140lvh" }}
    >
      <div
        className="absolute flex items-center justify-center"
        style={{ top: "20lvh", left: "10vw", width: "100vw", height: "100lvh" }}
      >
        <div
          className="loader-name display text-bone"
          style={{ fontSize: "clamp(2.6rem, 8.5vw, 8.5rem)" }}
          aria-label={`${names.first} ${names.last}`}
        >
          {renderWord(names.first.toUpperCase(), "n")}
          <span className="loader-gap" aria-hidden />
          <span className="loader-slot" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" />
          </span>
          {renderWord(names.last.toUpperCase(), "s")}
        </div>
      </div>
    </div>
  );
}
