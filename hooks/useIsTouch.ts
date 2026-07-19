"use client";

import { useEffect, useState } from "react";

/**
 * True on touch / no-hover devices. Starts `false` so SSR and the first
 * client render match (avoiding hydration mismatch), then flips after mount
 * if the device can't hover — use it to swap hover-only affordances for
 * touch-friendly ones (autoplay instead of hover, no width-push previews…).
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isTouch;
}
