"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor: a small difference-blend dot that follows the pointer,
 * scales up over links and morphs into a labelled disc over elements
 * carrying a [data-cursor="LABEL"] attribute. Elements carrying
 * [data-cursor-tag="Name"] get a tilted accent tag trailing the cursor.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const label = labelRef.current!;
    const tag = tagRef.current!;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    gsap.set(dot, { xPercent: 0, yPercent: 0, width: 12, height: 12, autoAlpha: 0 });
    gsap.set(tag, { scale: 0.4, autoAlpha: 0, rotation: -6 });
    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });
    // The tag trails a touch slower for a springier feel
    const tagXTo = gsap.quickTo(tag, "x", { duration: 0.5, ease: "power3" });
    const tagYTo = gsap.quickTo(tag, "y", { duration: 0.5, ease: "power3" });

    let seen = false;
    const onMove = (e: MouseEvent) => {
      if (!seen) {
        seen = true;
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.set(tag, { x: e.clientX, y: e.clientY });
        gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      tagXTo(e.clientX);
      tagYTo(e.clientY);
    };

    const grow = (size: number, text?: string) => {
      gsap.to(dot, {
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        duration: 0.4,
        ease: "power3.out",
      });
      label.textContent = text ?? "";
      gsap.to(label, { opacity: text ? 1 : 0, duration: 0.25 });
    };

    const showTag = (text?: string) => {
      if (text) tag.textContent = text;
      gsap.to(tag, {
        autoAlpha: text ? 1 : 0,
        scale: text ? 1 : 0.4,
        rotation: text ? -6 : -12,
        duration: 0.45,
        ease: text ? "back.out(2.2)" : "power2.out",
      });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagged = target.closest<HTMLElement>("[data-cursor-tag]");
      showTag(tagged?.dataset.cursorTag);
      if (tagged) {
        grow(12);
        return;
      }
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        grow(92, labelled.dataset.cursor);
        return;
      }
      if (target.closest("a, button")) {
        grow(32);
        return;
      }
      grow(12);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden>
        <span ref={labelRef} />
      </div>
      <span ref={tagRef} className="cursor-tag" aria-hidden />
    </>
  );
}
