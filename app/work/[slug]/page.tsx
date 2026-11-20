import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FALLBACK_PROJECTS } from "@/lib/content";
import { getProjectWithNext } from "@/lib/get-projects";
import ProjectDetail from "@/components/work/ProjectDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FALLBACK_PROJECTS.map((p) => ({ slug: p.slug }));
}

// Slugs created in the CMS after build are rendered on demand
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectWithNext(slug);
  if (!result) return {};
  return {
    title: `${result.project.title} — Javi Villalba Soler`,
    description: result.project.description[0],
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProjectWithNext(slug);
  if (!result) notFound();
  return <ProjectDetail project={result.project} nextProj={result.next} />;
}
