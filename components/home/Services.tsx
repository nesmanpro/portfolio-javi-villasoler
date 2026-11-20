"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SplitReveal from "@/components/SplitReveal";
import { useServicesContent } from "@/hooks/useContent";

/** Looping media (video or .gif) revealed while a service is hovered.
 *  All windows share one vertical axis left of the titles; Services
 *  measures where that is (--svc-media-x / -w / -radius on the list).
 *  Inline styles so the effect survives Turbopack's stale-globals.css HMR
 *  bug. Hidden entirely on touch devices (globals.css). */
const MEDIA_W = "var(--svc-media-w, min(20rem, 24vw))";

function ServiceMedia({ src, open }: { src: string; open: boolean }) {
  return (
    <span
      className="service-media"
      aria-hidden
      style={{
        left: "var(--svc-media-x, 0px)",
        width: MEDIA_W,
        transform: "translateY(-50%)",
        borderRadius: "var(--svc-media-radius, 5px)",
        // width * 3/4 keeps a 4:3 window, growing around its centre
        height: open ? `calc(${MEDIA_W} * 0.75)` : 0,
        opacity: open ? 1 : 0,
        transition: "height 0.55s var(--ease-spring), opacity 0.3s ease",
      }}
    >
      {src.endsWith(".gif") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        <video src={src} muted loop playsInline autoPlay preload="metadata" />
      )}
    </span>
  );
}

export default function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const { data: services } = useServicesContent();
  const [hovered, setHovered] = useState(-1);

  // Desktop: the media windows share one vertical axis, placed in the free
  // space LEFT of the widest title so no title ever runs over them. The
  // titles' width depends on the copy, the font and the viewport, so it is
  // measured rather than hard-coded. Taglines that would leave the screen
  // on the right drop below their title instead.
  useGSAP(
    () => {
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches)
        return;
      const list = rootRef.current?.querySelector<HTMLElement>(".services-list");
      if (!list) return;

      const layout = () => {
        const items = gsap.utils.toArray<HTMLElement>(".service-item", list);
        if (!items.length) return;
        const box = list.getBoundingClientRect();
        const vw = window.innerWidth;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const gap = 1.6 * rem;
        const pad = box.left; // section side padding

        let minLeft = Infinity;
        for (const item of items) {
          const title = item.querySelector<HTMLElement>(".service-title");
          if (title) minLeft = Math.min(minLeft, title.getBoundingClientRect().left - box.left);
        }

        // Room between the list's edge and the widest title…
        let room = minLeft - gap;
        let left = 0;
        let flush = false;
        // …and if that's too tight, run the window to the viewport edge
        if (room < 9 * rem) {
          room += pad;
          left = -pad;
          flush = true;
        }
        const width = Math.max(7 * rem, Math.min(20 * rem, 0.24 * vw, room));
        // Centre the window in the free room (right edge never past it)
        const x = left + Math.max(0, room - width) / 2;
        list.style.setProperty("--svc-media-w", `${width}px`);
        list.style.setProperty("--svc-media-x", `${x}px`);
        // Flush with the viewport's left edge: only right corners rounded
        list.style.setProperty(
          "--svc-media-radius",
          flush && x <= left + 1 ? "0 5px 5px 0" : "5px",
        );

        for (const item of items) {
          const title = item.querySelector<HTMLElement>(".service-title");
          const tag = item.querySelector<HTMLElement>(".service-tag");
          if (!title || !tag) continue;
          const right = title.getBoundingClientRect().right;
          const below = right + 2.2 * rem + tag.offsetWidth > vw - pad / 2;
          // No room on the right: tagline centred under the title instead
          tag.style.left = below ? "50%" : "";
          tag.style.top = below ? "100%" : "";
          tag.style.transform = below ? "translate(-50%, 0.4rem)" : "";
        }
      };

      layout();
      document.fonts?.ready.then(layout);
      const ro = new ResizeObserver(layout);
      ro.observe(list);
      return () => ro.disconnect();
    },
    { scope: rootRef, dependencies: [services.serviceItems] }
  );

  // Touch devices have no hover: while scrolling, the service closest to
  // the viewport center becomes the highlighted one (.is-active) and the
  // rest dim, mirroring the desktop hover state (minus the media).
  useGSAP(
    () => {
      if (!window.matchMedia("(hover: none), (pointer: coarse)").matches)
        return;
      const items = gsap.utils.toArray<HTMLElement>(".service-item");
      if (!items.length) return;

      const highlightCentered = () => {
        const mid = window.innerHeight / 2;
        let closest: HTMLElement | null = null;
        let minDist = Infinity;
        for (const el of items) {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top + rect.height / 2 - mid);
          if (dist < minDist) {
            minDist = dist;
            closest = el;
          }
        }
        items.forEach((el) =>
          el.classList.toggle("is-active", el === closest)
        );
      };

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 75%",
        end: "bottom 25%",
        onUpdate: highlightCentered,
        onToggle(self) {
          if (self.isActive) highlightCentered();
          else items.forEach((el) => el.classList.remove("is-active"));
        },
      });
    },
    { scope: rootRef, dependencies: [services.serviceItems.length] }
  );

  return (
    <section
      ref={rootRef}
      data-theme-section="light"
      className="px-[4vw] py-[18vh]"
    >
      <SplitReveal as="p" className="label-mono opacity-50 mb-[8vh]">
        {services.sectionLabel}
      </SplitReveal>

      <div className="services-list flex flex-col items-center">
        {services.serviceItems.map((service, i) => (
          <div
            key={service.serviceTitle}
            className="service-item"
            onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? -1 : h))}
          >
            <ServiceMedia
              src={service.hoverMediaUrl}
              open={hovered === i}
            />
            <div className="service-title relative inline-block">
              <SplitReveal
                as="h3"
                delay={i * 0.06}
                className="display text-center"
              >
                <span style={{ fontSize: "clamp(2.4rem, 6.5vw, 6.5rem)" }}>
                  {service.serviceTitle}
                </span>
              </SplitReveal>
              <span className="service-tag label-mono">
                {service.shortHoverTagline}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
