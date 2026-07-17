"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { bus } from "@/lib/bus";
import { setLenis } from "@/lib/lenis-store";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

    // Scroll is locked while the preloader / a transition curtain covers
    // the page, and released as soon as the reveal starts.
    if (!bus.revealed) lenis.stop();
    const offCover = bus.onCover(() => lenis.stop());
    const offReveal = bus.onReveal(() => {
      lenis.start();
      // Keep GSAP and Lenis in lockstep while scrolling. Enabled only
      // after the first reveal: with lag smoothing off from the start,
      // hydration stalls fast-forward the preloader timeline.
      gsap.ticker.lagSmoothing(0);
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      offCover();
      offReveal();
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
