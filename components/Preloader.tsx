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
  const introPlayed = useRef<{ promise: Promise<void>; resolve: () => void }>(
    null!,
  );
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
        ".loader-char:not([data-keep]), .loader-gap",
      );
      const slot = root.querySelector<HTMLElement>(".loader-slot")!;
      const slides =
        root.querySelectorAll<HTMLImageElement>(".loader-slot img");

      gsap.set(slides, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        autoAlpha: 1,
      });

      // Each image POPS in place between the initials (scale 0 → 1 with a
      // springy overshoot and a slight random tilt), holds a beat, then
      // snaps away to make room for the next — which starts popping while
      // the previous is still mid-exit, keeping the rhythm punchy.
      const state = { i: 0 };
      const cycle = () => {
        if (stopped.current) return;
        const img = slides[state.i % 2];
        const srcs = imagesRef.current;
        img.src = srcs[state.i % srcs.length];
        state.i += 1;
        gsap.set(img, {
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          autoAlpha: 1,
          rotation: gsap.utils.random(-7, 7),
        });
        gsap
          .timeline()
          .to(img, { scale: 1, duration: 0.42, ease: "back.out(2.4)" })
          .to(
            img,
            {
              scale: 0,
              autoAlpha: 0,
              rotation: `+=${gsap.utils.random(-8, 8)}`,
              duration: 0.26,
              ease: "back.in(1.8)",
            },
            "+=0.34",
          );
        // Next pop begins while this one is still shrinking away
        gsap.delayedCall(0.42 + 0.34 + 0.14, cycle);
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
        .to(fading, { width: 0, duration: 0.6, ease: "power4.inOut" }, ">-0.08")
        .to(
          slot,
          {
            width: "0.92em",
            marginLeft: "0.08em",
            marginRight: "0.08em",
            duration: 0.6,
            ease: "power4.inOut",
          },
          "<",
        )
        // 5. First image rises while the slot is still opening
        .call(cycle, undefined, "<+0.28")
        // 6. After ~2 conveyor cycles the loader is allowed to leave
        //    (it keeps looping if the page is still loading)
        .call(() => introPlayed.current.resolve(), undefined, "+=1.6");
    },
    { scope: rootRef },
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
      className="curtain-panel fixed z-100"
      style={{ top: "-20lvh", left: "-10vw", width: "120vw", height: "140lvh" }}
    >
      <div
        className="absolute flex items-center justify-center"
        style={{ top: "20lvh", left: "10vw", width: "100vw", height: "100lvh" }}
      >
        <div
          className="loader-name display text-bone"
          // overflow:visible so the popping images (taller than the caps)
          // aren't clipped top/bottom by the name box — the per-letter
          // reveal still clips itself via each .loader-char.
          style={{
            fontSize: "clamp(2.6rem, 8.5vw, 8.5rem)",
            overflow: "visible",
            padding: "0.5em 0",
          }}
          aria-label={`${names.first} ${names.last}`}
        >
          {renderWord(names.first.toUpperCase(), "n")}
          <span className="loader-gap" aria-hidden />
          {/* Inline styles override .loader-slot's clipping window: the
              cards pop free-floating, slightly bigger than the caps, like
              the reference — not framed inside a slot. */}
          <span
            className="loader-slot"
            aria-hidden
            style={{ overflow: "visible", borderRadius: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "1.22em",
                height: "1.5em",
                objectFit: "cover",
                borderRadius: 5,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "1.22em",
                height: "1.5em",
                objectFit: "cover",
                borderRadius: 5,
              }}
            />
          </span>
          {renderWord(names.last.toUpperCase(), "s")}
        </div>
      </div>
    </div>
  );
}
