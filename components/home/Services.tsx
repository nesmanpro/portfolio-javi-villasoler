"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SplitReveal from "@/components/SplitReveal";
import { useServicesContent } from "@/hooks/useContent";

/** Looping media (video or .gif) revealed while a service is hovered.
 *  Positioned on a fixed vertical axis (see globals.css), never moving
 *  the title. Hidden entirely on touch devices. */
function ServiceMedia({ src }: { src: string }) {
  return (
    <span className="service-media" aria-hidden>
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
          <div key={service.serviceTitle} className="service-item">
            <ServiceMedia src={service.hoverMediaUrl} />
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
