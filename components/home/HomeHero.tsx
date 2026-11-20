"use client";

import SplitReveal from "@/components/SplitReveal";
import HeroTitle from "@/components/home/HeroTitle";
import HeroMouseTrail from "@/components/home/HeroMouseTrail";
import { useHeroContent } from "@/hooks/useContent";

export default function HomeHero() {
  const { data: hero } = useHeroContent();

  return (
    <section
      data-theme-section="dark"
      className="relative flex min-h-svh flex-col justify-between px-[4vw] pt-28 pb-6 overflow-hidden"
    >
      {/* An image card follows the cursor underneath the headline */}
      <HeroMouseTrail />

      <div className="relative z-10 flex flex-wrap justify-between gap-4">
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

      {/* Eyebrow + headline: dead-centre of the hero, above the cursor image */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-[4vw]">
        <SplitReveal
          as="p"
          trigger="load"
          delay={0.1}
          className="text-center"
          style={{
            // Same compressed serif as the serif words of the headline
            fontFamily: "var(--font-flex-serif), Georgia, serif",
            fontVariationSettings: '"wdth" 50, "opsz" 144',
            fontWeight: 300,
            fontSize: "clamp(1.6rem, 3.4vw, 3.8rem)",
            lineHeight: 1,
            letterSpacing: "0",
            marginBottom: "0.55em",
          }}
          key={`e-${hero.eyebrowText}`}
        >
          {hero.eyebrowText.split("\n").map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </SplitReveal>
        <HeroTitle key={`t-${hero.mainTitle}`} title={hero.mainTitle} />
      </div>

      <div className="relative z-10 flex flex-col justify-end">
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
