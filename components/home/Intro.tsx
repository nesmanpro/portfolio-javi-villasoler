"use client";

import SplitReveal from "@/components/SplitReveal";
import TransitionLink from "@/components/TransitionLink";
import { useAboutContent } from "@/hooks/useContent";

export default function Intro() {
  const { data: about } = useAboutContent();

  return (
    <section
      data-theme-section="light"
      className="px-[4vw] py-[20vh] flex flex-col items-center"
    >
      <div className="mb-12 flex items-baseline gap-4 w-full">
        <SplitReveal as="p" className="label-mono opacity-50 w-full">
          {about.sectionLabel}
        </SplitReveal>
      </div>

      <SplitReveal
        as="h2"
        type="lines"
        stagger={0.09}
        className="editorial max-w-[18ch] text-center"
        style={{ fontSize: "clamp(1.9rem, 4.6vw, 4.8rem)" }}
        key={about.introParagraph}
      >
        {about.introParagraph}
      </SplitReveal>

      <div className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-3 w-full">
        {about.statistics.map((stat, i) => (
          <div
            key={stat.statLabel}
            className="border-t pt-5"
            style={{ borderColor: "var(--line)" }}
          >
            <SplitReveal as="p" delay={i * 0.08} className="display">
              <span style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}>
                {stat.statValue}
              </span>
            </SplitReveal>
            <SplitReveal
              as="p"
              delay={i * 0.08 + 0.1}
              className="label-mono opacity-50 mt-2"
            >
              {stat.statLabel}
            </SplitReveal>
          </div>
        ))}
      </div>

      <div className="mt-16 w-full">
        <TransitionLink href="/studio" label="Studio" className="btn-pill">
          {about.moreAboutButtonLabel}
        </TransitionLink>
      </div>
    </section>
  );
}
