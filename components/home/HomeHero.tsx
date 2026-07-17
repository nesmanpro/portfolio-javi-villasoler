"use client";

import SplitReveal from "@/components/SplitReveal";
import { useHeroContent } from "@/hooks/useContent";

export default function HomeHero() {
  const { data: hero } = useHeroContent();

  return (
    <section
      data-theme-section="dark"
      className="relative flex min-h-svh flex-col justify-between px-[4vw] pt-28 pb-6 overflow-hidden"
    >
      <div className="flex flex-wrap justify-between gap-4">
        <SplitReveal
          as="p"
          trigger="load"
          className="label-mono opacity-60"
          key={`l-${hero.topLeftLabel}`}
        >
          {hero.topLeftLabel}
        </SplitReveal>
        <SplitReveal
          as="p"
          trigger="load"
          delay={0.08}
          className="label-mono opacity-60 hidden sm:block"
          key={`c-${hero.topCenterLabel}`}
        >
          {hero.topCenterLabel}
        </SplitReveal>
        <SplitReveal
          as="p"
          trigger="load"
          delay={0.16}
          className="label-mono opacity-60 hidden md:block"
          key={`r-${hero.topRightLabel}`}
        >
          {hero.topRightLabel}
        </SplitReveal>
      </div>

      <div className="flex flex-col justify-end">
        <SplitReveal
          as="h1"
          type="chars"
          trigger="load"
          delay={0.25}
          duration={1.3}
          stagger={0.035}
          className="display text-center"
          style={{ fontSize: "clamp(3.2rem, 11.5vw, 15rem)" }}
          key={`t-${hero.mainTitle}`}
        >
          {hero.mainTitle}
        </SplitReveal>

        <div
          className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-5"
          style={{ borderColor: "var(--line)" }}
        >
          <SplitReveal
            as="p"
            trigger="load"
            delay={0.6}
            className="label-mono opacity-60 max-w-[34ch]"
            key={`bl-${hero.bottomLeftTagline}`}
          >
            {hero.bottomLeftTagline}
          </SplitReveal>
          <SplitReveal
            as="p"
            trigger="load"
            delay={0.7}
            className="label-mono opacity-60"
            key={`br-${hero.bottomRightScrollHint}`}
          >
            {hero.bottomRightScrollHint}
          </SplitReveal>
        </div>
      </div>
    </section>
  );
}
