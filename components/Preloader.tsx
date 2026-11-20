"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { bus } from "@/lib/bus";

/** Hard cap in case `load` never settles (slow videos, offline CMS…). */
const MAX_SHOW_MS = 9000;
/** The solid colour is held at least this long before it unwinds. */
const MIN_SHOW_MS = 500;

const STROKE_COLOR = "var(--color-accent)";

/* One very thick spiral stroke, drawn in a 1000×1000 box that is stretched
   to the viewport (preserveAspectRatio="none"), so it becomes a wide
   ellipse on desktop and a tall one on phones.

   Each turn sits RING apart while the stroke is WIDTH thick, so the turns
   overlap and the fully drawn stroke paints the whole screen. It starts at
   the centre and ends off-screen past the bottom-right corner: erasing it
   from its start opens a hole in the middle that unwinds outwards until
   the tail slips away through that corner. */
const RING = 300;
const WIDTH = 370;
/** Stroke thickness once it has fully retracted */
const END_WIDTH = 60;
const TURNS = 3.125; // ends at 45° → bottom-right
const SPIRAL_PATH = (() => {
  const end = TURNS * Math.PI * 2;
  const k = RING / (Math.PI * 2);
  const pts: string[] = [];
  for (let a = 0; a <= end + 1e-6; a += 0.04) {
    const r = k * a;
    pts.push(
      `${(500 + r * Math.cos(a)).toFixed(1)} ${(500 + r * Math.sin(a)).toFixed(1)}`,
    );
  }
  return "M" + pts.join("L");
})();

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    // pathLength="1" normalises the stroke: offset 0 = fully drawn,
    // -1 = fully erased starting from the centre of the spiral.
    gsap
      .timeline()
      .to(pathRef.current, {
        strokeDashoffset: -1,
        duration: 1.7,
        ease: "power2.inOut",
      })
      // …while it thins out: massive at first, a slim ribbon by the time
      // the tail leaves the screen
      .to(
        pathRef.current,
        { attr: { "stroke-width": END_WIDTH }, duration: 1.7, ease: "power1.in" },
        0,
      )
      // Page entrance animations start as the hole opens up
      .call(() => bus.reveal(), undefined, 0.45)
      .call(() => setDone(true));
  }, []);

  // Leave when everything is actually loaded (fonts + window load), with a
  // short minimum hold and a hard cap as safety net.
  useEffect(() => {
    const winLoaded = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const minHold = new Promise((r) => setTimeout(r, MIN_SHOW_MS));
    const cap = new Promise((r) => setTimeout(r, MAX_SHOW_MS));
    let alive = true;
    Promise.race([Promise.all([minHold, winLoaded, fontsReady]), cap]).then(
      () => alive && finish(),
    );
    return () => {
      alive = false;
    };
  }, [finish]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-100"
      role="status"
      aria-label="Loading"
    >
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path
          ref={pathRef}
          d={SPIRAL_PATH}
          pathLength={1}
          fill="none"
          stroke={STROKE_COLOR}
          strokeWidth={WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: "1 1", strokeDashoffset: 0 }}
        />
      </svg>
    </div>
  );
}
