"use client";

import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { bus } from "@/lib/bus";

/** Two voices, like the reference (Helvetica Now + Serrif Compressed there;
 *  free equivalents here): a condensed grotesque and a compressed serif.
 *  The WIDTH axis is fixed — what reacts to the cursor is the WEIGHT. Sans
 *  letters go bold → light as the pointer gets close, serif letters go the
 *  other way, light → bold. Wrap words in *asterisks* to set them in serif. */
const SANS = { family: "var(--font-flex)", fixed: '"wdth" 75', rest: 700, near: 200 };
const SERIF = {
  family: "var(--font-flex-serif)",
  fixed: '"wdth" 50, "opsz" 144',
  rest: 300,
  near: 700,
};
/** Reach of the effect, as a fraction of the viewport width (min 180px) */
const RADIUS_VW = 0.26;
/** 0–1: how quickly each letter chases its target (lower = more lag) */
const FOLLOW = 0.14;

/** Split a phrase into two halves of similar length, on a word boundary. */
function splitBalanced(text: string): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text.trim()];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(
      words.slice(0, i).join(" ").length - words.slice(i).join(" ").length,
    );
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Explicit line breaks win; otherwise split the words into two balanced
 *  lines so each line can grow/shrink without ever re-wrapping. Every line
 *  is then cut into two halves, which stack on narrow screens (4 short
 *  lines of big type instead of 2 long lines of small type). */
function toLines(title: string): string[][] {
  const explicit = title
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const lines = explicit.length > 1 ? explicit : splitBalanced(title);
  return lines.map((line) => {
    const halves = splitBalanced(line);
    // The gap between halves travels with the first one
    return halves.length > 1 ? [halves[0] + " ", halves[1]] : halves;
  });
}

const settings = (t: number, serif = false) => {
  const v = serif ? SERIF : SANS;
  return `${v.fixed}, "wght" ${(v.rest + (v.near - v.rest) * t).toFixed(0)}`;
};

/** Strip the *serif* markers: returns the clean phrase plus, for every
 *  non-space character in order, whether it sits inside a marked span. */
function parseMarkers(raw: string) {
  let text = "";
  const serif: boolean[] = [];
  let on = false;
  for (const ch of raw) {
    if (ch === "*") {
      on = !on;
      continue;
    }
    text += ch;
    if (!/\s/.test(ch)) serif.push(on);
  }
  return { text, serif };
}

/**
 * Hero headline set in variable fonts: each letter's weight reacts to its
 * distance from the cursor (extrafazant.nl style). Letters rise in
 * on page reveal, like the rest of the load animations.
 */
export default function HeroTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { text, serif } = useMemo(() => parseMarkers(title), [title]);
  const lines = useMemo(() => toLines(text), [text]);
  // Size the type from the longest line so any phrase fits the viewport.
  // Narrow
  // screens size from the longest half-line instead.
  const longest = (items: string[]) =>
    Math.max(...items.map((t) => t.trim().length), 1);
  const sizeVw = Math.min(13, 172 / longest(lines.map((l) => l.join(""))));
  const sizeVwNarrow = Math.min(22, 150 / longest(lines.flat()));

  useGSAP(
    () => {
      const el = ref.current!;
      const section = el.closest("section") as HTMLElement | null;
      const chars = gsap.utils.toArray<HTMLElement>(".hero-char", el);
      if (!section || !chars.length) return;

      // ---- entrance: letters rise from behind their line mask ----
      gsap.set(chars, { yPercent: 115 });
      el.style.visibility = "visible";
      const offReveal = bus.onReveal(() =>
        gsap.to(chars, {
          yPercent: 0,
          duration: 1.3,
          ease: "back.out(1.3)",
          stagger: 0.035,
          delay: 0.4,
        }),
      );

      // ---- cursor proximity → per-letter width ----
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return offReveal;
      }

      const amount = chars.map(() => 0);
      const isSerif = chars.map((c) => c.dataset.serif === "true");
      let px = 0;
      let py = 0;
      let inside = false;
      let ticking = false;

      const tick = () => {
        const radius = Math.max(180, window.innerWidth * RADIUS_VW);
        // Read every box first, then write, to avoid layout thrash
        const rects = chars.map((c) => c.getBoundingClientRect());
        let moving = false;
        for (let i = 0; i < chars.length; i++) {
          let target = 0;
          if (inside) {
            const r = rects[i];
            const d = Math.hypot(
              r.left + r.width / 2 - px,
              r.top + r.height / 2 - py,
            );
            const t = gsap.utils.clamp(0, 1, 1 - d / radius);
            target = t * t * (3 - 2 * t); // smoothstep falloff
          }
          const diff = target - amount[i];
          if (Math.abs(diff) < 0.002) {
            if (amount[i] === target) continue;
            amount[i] = target;
          } else {
            amount[i] += diff * FOLLOW;
            moving = true;
          }
          chars[i].style.fontVariationSettings = settings(amount[i], isSerif[i]);
        }
        if (!moving && !inside) {
          gsap.ticker.remove(tick);
          ticking = false;
        }
      };

      const start = () => {
        if (ticking) return;
        ticking = true;
        gsap.ticker.add(tick);
      };
      const onMove = (e: PointerEvent) => {
        px = e.clientX;
        py = e.clientY;
        inside = true;
        start();
      };
      const onLeave = () => {
        inside = false;
        start();
      };

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("pointercancel", onLeave);

      return () => {
        offReveal();
        gsap.ticker.remove(tick);
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
        section.removeEventListener("pointercancel", onLeave);
      };
    },
    { scope: ref, dependencies: [title] },
  );

  // Walks the serif flags in reading order while rendering the letters,
  // and numbers the words (data-word) so the cursor image can tell which
  // word is being touched (HeroMouseTrail.tsx). Spaces get -1.
  let cursor = 0;
  let word = -1;
  let newWord = true;

  return (
    <h1
      ref={ref}
      aria-label={text}
      className="text-[length:var(--hero-fs-narrow)] md:text-[length:var(--hero-fs)]"
      style={{
        ["--hero-fs" as string]: `clamp(2.2rem, min(${sizeVw.toFixed(2)}vw, 36svh), 24rem)`,
        ["--hero-fs-narrow" as string]: `clamp(2.2rem, min(${sizeVwNarrow.toFixed(2)}vw, 20svh), 24rem)`,
        fontFamily: `${SANS.family}, var(--font-sans)`,
        lineHeight: 0.9,
        letterSpacing: "-0.02em",
        textTransform: "uppercase",
        textAlign: "center",
        fontVariationSettings: settings(0),
        // Shown by the entrance animation once the letters are tucked away
        visibility: "hidden",
      }}
    >
      {lines.map((line, li) => (
        <span
          key={li}
          aria-hidden
          style={{
            display: "block",
            whiteSpace: "pre",
            // Line mask for the entrance, with breathing room so the
            // springy overshoot isn't clipped
            overflow: "clip",
            padding: "0.08em 0",
            margin: "-0.08em 0",
          }}
        >
          {line.map((half, hi) => (
            <span key={hi} className="block md:inline">
              {[...half].map((char, ci) => {
                const isSpace = char === " ";
                const inSerif = isSpace ? false : serif[cursor++];
                // A new line always starts a new word
                if (isSpace) newWord = true;
                else if (newWord || (hi === 0 && ci === 0)) {
                  word += 1;
                  newWord = false;
                }
                return (
                  <span
                    key={ci}
                    className="hero-char"
                    data-serif={inSerif}
                    data-word={isSpace ? -1 : word}
                    style={{
                      display: "inline-block",
                      willChange: "transform",
                      ...(inSerif
                        ? {
                            fontFamily: `${SERIF.family}, Georgia, serif`,
                            fontVariationSettings: settings(0, true),
                            letterSpacing: "0.01em",
                          }
                        : null),
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
