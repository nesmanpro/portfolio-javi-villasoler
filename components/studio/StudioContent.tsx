"use client";

import MediaReveal from "@/components/MediaReveal";
import SplitReveal from "@/components/SplitReveal";
import TransitionLink from "@/components/TransitionLink";
import { useStudioPageContent } from "@/hooks/useContent";

export default function StudioContent() {
  const { data: studio } = useStudioPageContent();

  return (
    <>
      {/* Hero */}
      <section data-theme-section="dark" className="px-[4vw] pt-40 pb-[8vh]">
        <SplitReveal as="p" trigger="load" className="label-mono opacity-50">
          {studio.pageEyebrow}
        </SplitReveal>
        <SplitReveal
          as="h1"
          type="chars"
          trigger="load"
          delay={0.2}
          stagger={0.04}
          duration={1.3}
          className="display hero-title"
          key={studio.pageTitle}
        >
          {studio.pageTitle}
        </SplitReveal>
      </section>

      {/* Portrait + bio */}
      <section data-theme-section="dark" className="px-[4vw] pb-[16vh]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <MediaReveal
              trigger="load"
              delay={0.4}
              parallax
              className="aspect-[3/4]"
            >
              <video
                src={studio.portraitVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />
            </MediaReveal>
            <p className="label-mono opacity-50 mt-4">
              {studio.portraitCaption}
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex flex-col gap-10 md:pt-[10vh]">
            <SplitReveal
              as="p"
              type="lines"
              className="editorial"
              style={{ fontSize: "clamp(1.6rem, 3vw, 3rem)" }}
              key={studio.bioMainParagraph}
            >
              {studio.bioMainParagraph}
            </SplitReveal>
            <SplitReveal
              as="p"
              type="lines"
              className="opacity-70 max-w-[52ch]"
              key={studio.bioSecondaryParagraph}
            >
              {studio.bioSecondaryParagraph}
            </SplitReveal>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section data-theme-section="light" className="px-[4vw] py-[16vh]">
        <SplitReveal as="p" className="label-mono opacity-50 mb-10">
          {studio.capabilitiesSectionLabel}
        </SplitReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[4vw]">
          {studio.capabilitiesList.map((capability, i) => (
            <div
              key={capability}
              className="border-t py-5 flex items-baseline gap-4"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="label-mono opacity-40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <SplitReveal as="p" delay={0.05} className="display">
                <span style={{ fontSize: "clamp(1.6rem, 3vw, 3rem)" }}>
                  {capability}
                </span>
              </SplitReveal>
            </div>
          ))}
        </div>
      </section>

      {/* Recognitions */}
      <section data-theme-section="light" className="px-[4vw] pb-[16vh]">
        <SplitReveal as="p" className="label-mono opacity-50 mb-10">
          {studio.recognitionsSectionLabel}
        </SplitReveal>
        <div>
          {studio.recognitions.map((recognition) => (
            <div
              key={recognition.awardName}
              className="border-t py-5 grid grid-cols-12 gap-4 items-baseline"
              style={{ borderColor: "var(--line)" }}
            >
              <SplitReveal
                as="p"
                className="label-mono text-sm! col-span-7 md:col-span-6"
              >
                {recognition.awardName}
              </SplitReveal>
              <SplitReveal
                as="p"
                delay={0.06}
                className="label-mono opacity-50 col-span-3 md:col-span-4"
              >
                {recognition.awardedPiece}
              </SplitReveal>
              <SplitReveal
                as="p"
                delay={0.1}
                className="label-mono opacity-50 col-span-2 text-right"
              >
                {recognition.awardYear}
              </SplitReveal>
            </div>
          ))}
          <span
            className="block h-px w-full"
            style={{ background: "var(--line)" }}
          />
        </div>
        <div className="mt-16">
          <TransitionLink href="/work" label="Work" className="btn-pill">
            {studio.seeWorkButtonLabel}
          </TransitionLink>
        </div>
      </section>
    </>
  );
}
