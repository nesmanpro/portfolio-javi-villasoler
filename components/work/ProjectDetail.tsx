"use client";

import type { Project } from "@/lib/projects";
import MediaReveal from "@/components/MediaReveal";
import SplitReveal from "@/components/SplitReveal";
import TransitionLink from "@/components/TransitionLink";

export default function ProjectDetail({
  project,
  nextProj: next,
}: {
  project: Project;
  nextProj: Project;
}) {

  return (
    <>
      {/* Hero */}
      <section data-theme-section="dark" className="px-[4vw] pt-40 pb-[6vh]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SplitReveal as="p" trigger="load" className="label-mono opacity-50">
            {`Work / ${project.category}`}
          </SplitReveal>
          <SplitReveal
            as="p"
            trigger="load"
            delay={0.08}
            className="label-mono opacity-50"
          >
            {project.year}
          </SplitReveal>
        </div>
        <SplitReveal
          as="h1"
          type="chars"
          trigger="load"
          delay={0.2}
          stagger={0.04}
          duration={1.3}
          className="display hero-title"
        >
          {project.title}
        </SplitReveal>
      </section>

      {/* Main video */}
      <section data-theme-section="dark" className="px-[4vw]">
        <MediaReveal trigger="load" delay={0.35} className="aspect-video w-full">
          <video
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        </MediaReveal>
      </section>

      {/* Meta + description */}
      <section data-theme-section="light" className="px-[4vw] py-[16vh]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4 flex flex-col gap-8">
            {[
              ["Client", project.client],
              ["Year", project.year],
              ["Category", project.category],
              ["Services", project.services.join(", ")],
            ].map(([k, v], i) => (
              <div
                key={k}
                className="border-t pt-4"
                style={{ borderColor: "var(--line)" }}
              >
                <SplitReveal as="p" delay={i * 0.05} className="label-mono opacity-40">
                  {k}
                </SplitReveal>
                <SplitReveal
                  as="p"
                  delay={i * 0.05 + 0.08}
                  className="label-mono text-sm! mt-1"
                >
                  {v}
                </SplitReveal>
              </div>
            ))}
          </div>

          <div className="md:col-span-7 md:col-start-6 flex flex-col gap-8">
            {project.description.map((paragraph) => (
              <SplitReveal
                key={paragraph.slice(0, 24)}
                as="p"
                type="lines"
                className="editorial"
              >
                <span style={{ fontSize: "clamp(1.4rem, 2.6vw, 2.6rem)" }}>
                  {paragraph}
                </span>
              </SplitReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Next project */}
      <section data-theme-section="dark" className="px-[4vw] py-[14vh]">
        <SplitReveal as="p" className="label-mono opacity-50 mb-8">
          Next project
        </SplitReveal>
        <TransitionLink
          href={`/work/${next.slug}`}
          label={next.title}
          data-cursor="View"
          className="group block"
        >
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SplitReveal as="h2" type="chars" stagger={0.03} className="display">
              <span
                className="inline-block transition-transform duration-500 ease-(--ease-spring) group-hover:translate-x-6"
                style={{ fontSize: "clamp(3.5rem, 12vw, 14rem)" }}
              >
                {next.title}
              </span>
            </SplitReveal>
            <MediaReveal parallax className="aspect-[4/3] w-full max-w-xs mb-4">
              <video
                src={next.video}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </MediaReveal>
          </div>
        </TransitionLink>
      </section>
    </>
  );
}
