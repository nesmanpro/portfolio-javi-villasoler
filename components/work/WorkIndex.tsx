"use client";

import ProjectCard from "@/components/ProjectCard";
import SplitReveal from "@/components/SplitReveal";
import { useProjects, useWorkPageContent } from "@/hooks/useContent";

export default function WorkIndex() {
  const { data: workPage } = useWorkPageContent();
  const { data: projects } = useProjects();

  return (
    <>
      <section data-theme-section="dark" className="px-[4vw] pt-40 pb-[10vh]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SplitReveal as="p" trigger="load" className="label-mono opacity-50">
            {`${workPage.projectsCountLabel} (${projects.length})`}
          </SplitReveal>
          <SplitReveal
            as="p"
            trigger="load"
            delay={0.08}
            className="label-mono opacity-50"
          >
            {workPage.yearsRangeLabel}
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
          key={workPage.pageTitle}
        >
          {workPage.pageTitle}
        </SplitReveal>
      </section>

      <section data-theme-section="dark" className="px-[4vw] pb-[16vh]">
        <div className="grid grid-cols-1 gap-x-[4vw] gap-y-[10vh] md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
