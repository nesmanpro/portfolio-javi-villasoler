/**
 * Server-side project data: fetches from Strapi with a silent fallback to
 * the local copy in lib/projects.ts, so detail pages build and render
 * even with the CMS down.
 */

import { strapiFetch } from "@/lib/strapi";
import {
  type ApiProject,
  type Project,
  transformProject,
  PROJECTS_ENDPOINT,
  PROJECTS_QUERY,
  FALLBACK_PROJECTS,
} from "@/lib/content";

export async function getAllProjects(): Promise<Project[]> {
  try {
    const list = await strapiFetch<ApiProject[]>(PROJECTS_ENDPOINT, {
      query: PROJECTS_QUERY,
    });
    if (list?.length) return list.map(transformProject);
  } catch {
    // CMS unreachable — fall through to local data
  }
  return FALLBACK_PROJECTS;
}

export async function getProjectWithNext(
  slug: string
): Promise<{ project: Project; next: Project } | null> {
  const all = await getAllProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: all[index], next: all[(index + 1) % all.length] };
}
