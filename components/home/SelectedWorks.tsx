"use client";

import ProjectCard from "@/components/ProjectCard";
import SplitReveal from "@/components/SplitReveal";
import TransitionLink from "@/components/TransitionLink";
import { useHomeContent, useProjects } from "@/hooks/useContent";

export default function SelectedWorks() {
  const { data: home } = useHomeContent();
  const { data: projects } = useProjects();
  const selected = projects.slice(0, 6);

  return (
    <section data-theme-section="dark" className="px-[4vw] py-[18vh]">
      <div className="mb-4 flex items-baseline justify-between">
        <SplitReveal as="p" className="label-mono opacity-50">
          {home.playgroundSectionLabel}
        </SplitReveal>
        <SplitReveal as="p" className="label-mono opacity-50">
          {home.playgroundYearsRangeLabel}
        </SplitReveal>
      </div>

      <SplitReveal
        as="h2"
        type="chars"
        stagger={0.03}
        className="display mb-[10vh]"
        key={home.playgroundTitle}
      >
        <span style={{ fontSize: "clamp(3.5rem, 11vw, 13rem)" }}>
          {home.playgroundTitle}
        </span>
      </SplitReveal>

      <div className="grid grid-cols-1 gap-x-[4vw] gap-y-[10vh] md:grid-cols-2">
        {selected.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>

      <div className="mt-[14vh] flex justify-center">
        <TransitionLink href="/work" label="Work" className="btn-pill">
          {home.allProjectsButtonLabel} ({projects.length}) ↗
        </TransitionLink>
      </div>
    </section>
  );
}
