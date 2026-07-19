"use client";

/**
 * Domain hooks: one per section/page, all built on the generic
 * useStrapiContent. Components never talk to Strapi directly — they get
 * a typed view model that falls back to local copy when the CMS is down.
 */

import { useStrapiContent } from "@/hooks/useStrapiContent";
import {
  type ApiProject,
  type Project,
  transformProject,
  PROJECTS_ENDPOINT,
  PROJECTS_QUERY,
  FALLBACK_PROJECTS,
  type ApiLoader,
  type LoaderContent,
  transformLoader,
  FALLBACK_LOADER,
  type HeroContent,
  type ApiHero,
  transformHero,
  FALLBACK_HERO,
  type HeaderContent,
  transformHeader,
  FALLBACK_HEADER,
  type FooterContent,
  transformFooter,
  FALLBACK_FOOTER,
  type MarqueeContent,
  type ApiMarquee,
  transformMarquee,
  FALLBACK_MARQUEE,
  type AboutContent,
  transformAbout,
  FALLBACK_ABOUT,
  type ServicesContent,
  transformServices,
  FALLBACK_SERVICES,
  type HomeContent,
  type ApiHome,
  transformHome,
  FALLBACK_HOME,
  type WorkPageContent,
  transformWorkPage,
  FALLBACK_WORK_PAGE,
  type StudioPageContent,
  type ApiStudioPage,
  transformStudioPage,
  FALLBACK_STUDIO_PAGE,
  type ContactPageContent,
  type ApiContactPage,
  transformContactPage,
  FALLBACK_CONTACT_PAGE,
} from "@/lib/content";

export function useProjects() {
  return useStrapiContent<ApiProject[], Project[]>(PROJECTS_ENDPOINT, {
    query: PROJECTS_QUERY,
    transform: (list) => list.map(transformProject),
    fallback: FALLBACK_PROJECTS,
  });
}

export function useLoaderContent() {
  return useStrapiContent<ApiLoader, LoaderContent>("loader", {
    query: { populate: "*" },
    transform: transformLoader,
    fallback: FALLBACK_LOADER,
  });
}

export function useHeroContent() {
  return useStrapiContent<ApiHero, HeroContent>("hero", {
    // populate so the trailImages media field comes through
    query: { populate: "*" },
    transform: transformHero,
    fallback: FALLBACK_HERO,
  });
}

export function useHeaderContent() {
  return useStrapiContent<Partial<HeaderContent>, HeaderContent>("header", {
    query: { populate: "*" },
    transform: transformHeader,
    fallback: FALLBACK_HEADER,
  });
}

export function useFooterContent() {
  return useStrapiContent<Partial<FooterContent>, FooterContent>("footer", {
    query: { populate: "*" },
    transform: transformFooter,
    fallback: FALLBACK_FOOTER,
  });
}

export function useMarqueeContent() {
  return useStrapiContent<ApiMarquee, MarqueeContent>("marquee", {
    query: { populate: "*" },
    transform: transformMarquee,
    fallback: FALLBACK_MARQUEE,
  });
}

export function useAboutContent() {
  return useStrapiContent<Partial<AboutContent>, AboutContent>("about", {
    query: { populate: "*" },
    transform: transformAbout,
    fallback: FALLBACK_ABOUT,
  });
}

export function useServicesContent() {
  return useStrapiContent<Partial<ServicesContent>, ServicesContent>(
    "services-section",
    {
      query: { populate: "*" },
      transform: transformServices,
      fallback: FALLBACK_SERVICES,
    }
  );
}

export function useHomeContent() {
  return useStrapiContent<ApiHome, HomeContent>("home", {
    // Deep-populate so each claim line's nested hover images come through
    query: { "populate[claimLines][populate]": "*" },
    transform: transformHome,
    fallback: FALLBACK_HOME,
  });
}

export function useWorkPageContent() {
  return useStrapiContent<Partial<WorkPageContent>, WorkPageContent>(
    "work-page",
    {
      transform: transformWorkPage,
      fallback: FALLBACK_WORK_PAGE,
    }
  );
}

export function useStudioPageContent() {
  return useStrapiContent<ApiStudioPage, StudioPageContent>("studio-page", {
    query: { populate: "*" },
    transform: transformStudioPage,
    fallback: FALLBACK_STUDIO_PAGE,
  });
}

export function useContactPageContent() {
  return useStrapiContent<ApiContactPage, ContactPageContent>("contact-page", {
    query: { populate: "*" },
    transform: transformContactPage,
    fallback: FALLBACK_CONTACT_PAGE,
  });
}
