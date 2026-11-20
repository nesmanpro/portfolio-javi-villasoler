/**
 * Site content contracts: view models per section, transforms from the
 * Strapi API shape, and local fallbacks so the site renders even with
 * the CMS down. This is the only file you rewrite to reuse the
 * strapiFetch/useStrapiContent template in another project.
 */

import {
  projects as fallbackProjects,
  showreelVideo,
  studioVideo,
  contactVideo,
  type Project,
} from "@/lib/projects";
import { strapiMediaUrl } from "@/lib/strapi";

export type { Project };

/* ============================= projects ============================= */

/** Repeatable single-string components used across the API (replaced the
 *  old JSON array fields). Kept tiny and mapped back to string[] here. */
export interface TextLine {
  text: string;
}
export interface ImageUrl {
  imageUrl: string;
}
const toStrings = (lines?: TextLine[]) =>
  (lines ?? []).map((l) => l.text).filter(Boolean);

export interface ApiProject {
  projectTitle: string;
  projectSlug: string;
  projectCategory: string;
  clientName?: string;
  releaseYear?: string;
  servicesProvided?: TextLine[];
  displayOrder?: number;
  playgroundStaticImageUrl?: string;
  playgroundStaticImageUpload?: { url?: string } | null;
  playgroundHoverVideoUrl?: string;
  detailHeroVideoUrl?: string;
  descriptionParagraphs?: TextLine[];
  cursorTagText?: string;
}

export function transformProject(api: ApiProject): Project {
  return {
    slug: api.projectSlug,
    title: api.projectTitle,
    category: api.projectCategory,
    client: api.clientName ?? "",
    year: api.releaseYear ?? "",
    services: toStrings(api.servicesProvided),
    video: api.playgroundHoverVideoUrl ?? api.detailHeroVideoUrl ?? "",
    image:
      strapiMediaUrl(api.playgroundStaticImageUpload) ??
      api.playgroundStaticImageUrl ??
      "",
    aspect: "landscape",
    description: toStrings(api.descriptionParagraphs),
  };
}

export const PROJECTS_ENDPOINT = "projects";
export const PROJECTS_QUERY = {
  sort: "displayOrder:asc",
  populate: "*",
  "pagination[pageSize]": "100",
};
export const FALLBACK_PROJECTS = fallbackProjects;

/* ============================== loader ============================== */

interface ApiMediaFile {
  url?: string;
  formats?: { small?: { url?: string }; medium?: { url?: string } };
}

export interface ApiLoader {
  name?: string;
  surname?: string;
  images?: ApiMediaFile[];
}

export interface LoaderContent {
  /** First name shown while the letters reveal (its initial stays) */
  firstName: string;
  /** Surname shown while the letters reveal (its initial stays) */
  lastName: string;
  /** Images cycled between the initials until the site finishes loading */
  imageUrls: string[];
}

export const FALLBACK_LOADER: LoaderContent = {
  firstName: "Javi",
  lastName: "Villalba Soler",
  imageUrls: [0, 1, 2, 3, 4].map(
    (i) => `https://picsum.photos/seed/loader-${i}/420/480`
  ),
};

export function transformLoader(api: ApiLoader): LoaderContent {
  const imageUrls = (api.images ?? [])
    .map((media) => strapiMediaUrl(media.formats?.small ?? media))
    .filter((url): url is string => Boolean(url));
  return {
    firstName: api.name || FALLBACK_LOADER.firstName,
    lastName: api.surname || FALLBACK_LOADER.lastName,
    imageUrls: imageUrls.length ? imageUrls : FALLBACK_LOADER.imageUrls,
  };
}

/* =============================== hero =============================== */

export interface HeroContent {
  topLeftLabel: string;
  topCenterLabel: string;
  topRightLabel: string;
  /** Small serif line sitting right above the headline ("\n" = line break) */
  eyebrowText: string;
  /** Headline phrase. Split into two balanced lines automatically; put a
   *  line break in it to choose where it breaks, and wrap words in
   *  *asterisks* to set them in the serif typeface. */
  mainTitle: string;
  bottomLeftTagline: string;
  bottomRightScrollHint: string;
  /** Thumbnails flung by the gravity mouse-trail over the hero. Empty ⇒
   *  the effect falls back to the project images. */
  trailImageUrls: string[];
}

/** Strapi sends the media field as { data: [...] } (v4) or a bare array
 *  (v5 flattened) depending on populate — accept either shape. */
export interface ApiHero extends Partial<Omit<HeroContent, "trailImageUrls">> {
  trailImages?: ApiMediaFile[] | { data?: ApiMediaFile[] } | null;
}

export const FALLBACK_HERO: HeroContent = {
  topLeftLabel: "Video director & editor",
  topCenterLabel: "Based in Madrid, working worldwide",
  topRightLabel: "Folio — 2026",
  eyebrowText: "Social content,\nvideos & animations",
  mainTitle: "Make your brand look the way *it feels.*",
  bottomLeftTagline:
    "Crafting films for brands, artists and people with something to say",
  bottomRightScrollHint: "Scroll to explore ↓",
  // Empty by default: HeroMouseTrail uses the project images until you add
  // dedicated trail images in the CMS.
  trailImageUrls: [],
};

export function transformHero(api: ApiHero): HeroContent {
  const { trailImages, ...rest } = api;
  const mediaList = Array.isArray(trailImages)
    ? trailImages
    : trailImages?.data ?? [];
  const trailImageUrls = mediaList
    .map((media) => strapiMediaUrl(media.formats?.medium ?? media))
    .filter((url): url is string => Boolean(url));
  return { ...FALLBACK_HERO, ...pickDefined(rest), trailImageUrls };
}

/* ============================== header ============================== */

export interface NavItem {
  pageLabel: string;
  pageUrl: string;
  hoverPreviewVideoUrl?: string;
}

export interface SocialLink {
  platformName: string;
  profileUrl: string;
}

export interface HeaderContent {
  logoText: string;
  contactButtonLabel: string;
  navigationItems: NavItem[];
  menuContactSectionLabel: string;
  contactEmail: string;
  socialLinks: SocialLink[];
}

export const FALLBACK_HEADER: HeaderContent = {
  logoText: "Javi Villalba Soler",
  contactButtonLabel: "Let's talk",
  menuContactSectionLabel: "Get in touch",
  contactEmail: "hello@javivillasoler.studio",
  navigationItems: [
    {
      pageLabel: "Home",
      pageUrl: "/",
      hoverPreviewVideoUrl:
        "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4",
    },
    {
      pageLabel: "Work",
      pageUrl: "/work",
      hoverPreviewVideoUrl:
        "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4",
    },
    {
      pageLabel: "Studio",
      pageUrl: "/studio",
      hoverPreviewVideoUrl:
        "https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4",
    },
    {
      pageLabel: "Contact",
      pageUrl: "/contact",
      hoverPreviewVideoUrl:
        "https://videos.pexels.com/video-files/1580455/1580455-hd_1920_1080_30fps.mp4",
    },
  ],
  socialLinks: [
    { platformName: "Vimeo", profileUrl: "https://vimeo.com" },
    { platformName: "Instagram", profileUrl: "https://instagram.com" },
    { platformName: "YouTube", profileUrl: "https://youtube.com" },
  ],
};

export function transformHeader(api: Partial<HeaderContent>): HeaderContent {
  const merged = { ...FALLBACK_HEADER, ...pickDefined(api) };
  if (!merged.navigationItems?.length)
    merged.navigationItems = FALLBACK_HEADER.navigationItems;
  if (!merged.socialLinks?.length)
    merged.socialLinks = FALLBACK_HEADER.socialLinks;
  return merged;
}

/* ============================== footer ============================== */

export interface FooterContent {
  ctaEyebrowText: string;
  ctaTitleLine1: string;
  ctaTitleLine2: string;
  contactEmail: string;
  copyrightText: string;
  backToTopLabel: string;
  socialLinks: SocialLink[];
}

export const FALLBACK_FOOTER: FooterContent = {
  ctaEyebrowText: "Got a story to tell?",
  ctaTitleLine1: "Let's work",
  ctaTitleLine2: "together",
  contactEmail: "hello@javivillasoler.studio",
  copyrightText: "© 2026 Javi Villalba Soler — All rights reserved",
  backToTopLabel: "Back to top ↑",
  socialLinks: FALLBACK_HEADER.socialLinks,
};

export function transformFooter(api: Partial<FooterContent>): FooterContent {
  const merged = { ...FALLBACK_FOOTER, ...pickDefined(api) };
  if (!merged.socialLinks?.length)
    merged.socialLinks = FALLBACK_FOOTER.socialLinks;
  return merged;
}

/* ============================== marquee ============================== */

export interface MarqueeContent {
  sectionLabel: string;
  clientNames: string[];
  scrollDurationSeconds: number;
}

export const FALLBACK_MARQUEE: MarqueeContent = {
  sectionLabel: "04 — Selected clients",
  clientNames: [
    "Atlas Outdoor",
    "Nova Records",
    "Meridian Hotels",
    "Maison Lumen",
    "Kosmos Studio",
    "Vertex Athletics",
    "Obsidian Journal",
  ],
  scrollDurationSeconds: 28,
};

export interface ApiMarquee {
  sectionLabel?: string;
  clientNames?: TextLine[];
  scrollDurationSeconds?: number;
}

export function transformMarquee(api: ApiMarquee): MarqueeContent {
  const { clientNames, ...rest } = api;
  const merged = { ...FALLBACK_MARQUEE, ...pickDefined(rest) };
  const names = toStrings(clientNames);
  merged.clientNames = names.length ? names : FALLBACK_MARQUEE.clientNames;
  return merged;
}

/* =============================== about =============================== */

export interface Stat {
  statValue: string;
  statLabel: string;
}

export interface AboutContent {
  sectionLabel: string;
  introParagraph: string;
  statistics: Stat[];
  moreAboutButtonLabel: string;
}

export const FALLBACK_ABOUT: AboutContent = {
  sectionLabel: "01 — About",
  introParagraph:
    "I direct and edit films that treat every frame like it has to earn its place. Fewer shots, more intention • stories cut to breathe, graded to feel.",
  moreAboutButtonLabel: "More about me ↗",
  statistics: [
    { statValue: "8+", statLabel: "Years behind the camera" },
    { statValue: "120+", statLabel: "Projects delivered" },
    { statValue: "14", statLabel: "Festival selections" },
  ],
};

export function transformAbout(api: Partial<AboutContent>): AboutContent {
  const merged = { ...FALLBACK_ABOUT, ...pickDefined(api) };
  if (!merged.statistics?.length)
    merged.statistics = FALLBACK_ABOUT.statistics;
  return merged;
}

/* ============================== services ============================== */

export interface ServiceItem {
  serviceTitle: string;
  serviceDescription: string;
  /** One or two words shown at the right of the title on hover */
  shortHoverTagline: string;
  /** Looping video or .gif shown at the left of the title on hover */
  hoverMediaUrl: string;
}

export interface ServicesContent {
  sectionLabel: string;
  serviceItems: ServiceItem[];
}

export const FALLBACK_SERVICES: ServicesContent = {
  sectionLabel: "03 — Services",
  serviceItems: [
    {
      serviceTitle: "Direction",
      serviceDescription:
        "Concept, treatment and direction for brand films, music videos and commercials.",
      shortHoverTagline: "Storytelling",
      hoverMediaUrl:
        "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
    },
    {
      serviceTitle: "Editing & Post",
      serviceDescription:
        "Narrative editing where rhythm is the story — from rough cut to final master.",
      shortHoverTagline: "Rhythm",
      hoverMediaUrl:
        "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4",
    },
    {
      serviceTitle: "Color Grading",
      serviceDescription:
        "Palettes built per project, graded shot by shot to carry the emotion.",
      shortHoverTagline: "Emotion",
      hoverMediaUrl:
        "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
    },
    {
      serviceTitle: "Motion Design",
      serviceDescription:
        "Titles, supers and graphic systems that live inside the film, not on top of it.",
      shortHoverTagline: "Identity",
      hoverMediaUrl:
        "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4",
    },
  ],
};

export function transformServices(
  api: Partial<ServicesContent>
): ServicesContent {
  const merged = { ...FALLBACK_SERVICES, ...pickDefined(api) };
  if (!merged.serviceItems?.length) {
    merged.serviceItems = FALLBACK_SERVICES.serviceItems;
    return merged;
  }
  // CMS entries created before the tagline/media fields existed come back
  // with them empty — fill the gaps from the fallback list (by position).
  merged.serviceItems = merged.serviceItems.map((item, i) => {
    const fb =
      FALLBACK_SERVICES.serviceItems[i] ?? FALLBACK_SERVICES.serviceItems[0];
    return {
      ...item,
      shortHoverTagline: item.shortHoverTagline || fb.shortHoverTagline,
      hoverMediaUrl: item.hoverMediaUrl || fb.hoverMediaUrl,
    };
  });
  return merged;
}

/* ================================ home ================================ */

export interface ClaimLine {
  lineText: string;
  highlightedWord?: string;
  hoverImageUrls?: string[];
}

export interface HomeContent {
  showreelVideoUrl: string;
  showreelCaptionLeft: string;
  showreelCaptionRight: string;
  claimLines: ClaimLine[];
  playgroundSectionLabel: string;
  playgroundYearsRangeLabel: string;
  playgroundTitle: string;
  allProjectsButtonLabel: string;
}

const claimPool = (word: string) =>
  [0, 1, 2, 3, 4].map(
    (i) => `https://picsum.photos/seed/claim-${word}-${i}/420/320`
  );

export const FALLBACK_HOME: HomeContent = {
  showreelVideoUrl: showreelVideo,
  showreelCaptionLeft: "Showreel — 2026",
  showreelCaptionRight: "01:24 — DIR/EDIT/GRADE",
  playgroundSectionLabel: "02 — Selected works",
  playgroundYearsRangeLabel: "2023 → 2025",
  playgroundTitle: "Playground",
  allProjectsButtonLabel: "All projects",
  claimLines: [
    { lineText: "It's never just a video." },
    {
      lineText: "Every cut carries intent,",
      highlightedWord: "cut",
      hoverImageUrls: claimPool("cut"),
    },
    {
      lineText: "every frame earns its place.",
      highlightedWord: "frame",
      hoverImageUrls: claimPool("frame"),
    },
    {
      lineText: "Your story. My obsession.",
      highlightedWord: "story",
      hoverImageUrls: claimPool("story"),
    },
  ],
};

export interface ApiClaimLine {
  lineText: string;
  highlightedWord?: string;
  hoverImageUrls?: ImageUrl[];
}

export interface ApiHome {
  showreelVideoUrl?: string;
  showreelCaptionLeft?: string;
  showreelCaptionRight?: string;
  claimLines?: ApiClaimLine[];
  playgroundSectionLabel?: string;
  playgroundYearsRangeLabel?: string;
  playgroundTitle?: string;
  allProjectsButtonLabel?: string;
}

export function transformHome(api: ApiHome): HomeContent {
  const { claimLines, ...rest } = api;
  const merged = { ...FALLBACK_HOME, ...pickDefined(rest) };
  const lines: ClaimLine[] = (claimLines ?? []).map((line) => ({
    lineText: line.lineText,
    highlightedWord: line.highlightedWord,
    hoverImageUrls: (line.hoverImageUrls ?? []).map((i) => i.imageUrl),
  }));
  merged.claimLines = lines.length ? lines : FALLBACK_HOME.claimLines;
  return merged;
}

/* ============================== work page ============================== */

export interface WorkPageContent {
  projectsCountLabel: string;
  yearsRangeLabel: string;
  pageTitle: string;
}

export const FALLBACK_WORK_PAGE: WorkPageContent = {
  projectsCountLabel: "All projects",
  yearsRangeLabel: "2023 → 2025",
  pageTitle: "Work",
};

export function transformWorkPage(
  api: Partial<WorkPageContent>
): WorkPageContent {
  return { ...FALLBACK_WORK_PAGE, ...pickDefined(api) };
}

/* ============================= studio page ============================= */

export interface Recognition {
  awardName: string;
  awardedPiece: string;
  awardYear: string;
}

export interface StudioPageContent {
  pageEyebrow: string;
  pageTitle: string;
  portraitVideoUrl: string;
  portraitCaption: string;
  bioMainParagraph: string;
  bioSecondaryParagraph: string;
  capabilitiesSectionLabel: string;
  capabilitiesList: string[];
  recognitionsSectionLabel: string;
  recognitions: Recognition[];
  seeWorkButtonLabel: string;
}

export const FALLBACK_STUDIO_PAGE: StudioPageContent = {
  pageEyebrow: "The person behind the lens",
  pageTitle: "Studio",
  portraitVideoUrl: studioVideo,
  portraitCaption: "Javi Villalba Soler — Director / Editor",
  bioMainParagraph:
    "I started cutting skate clips on a borrowed laptop. Eight years later I direct and edit films for brands and artists across Europe — still with the same obsession: rhythm first, everything else after.",
  bioSecondaryParagraph:
    "Every project runs through a small, senior circle of collaborators — cinematographers, sound designers and colorists I trust. Small crew, fast decisions, no layers between the idea and the screen. I take on a limited number of projects a year so each one gets the time it deserves.",
  capabilitiesSectionLabel: "Capabilities",
  capabilitiesList: [
    "Creative direction",
    "Treatment & scripting",
    "Cinematography",
    "Narrative editing",
    "Color grading",
    "Sound design",
    "Motion design",
    "Delivery & masters",
  ],
  recognitionsSectionLabel: "Recognitions",
  seeWorkButtonLabel: "See the work ↗",
  recognitions: [
    { awardName: "Vimeo Staff Pick", awardedPiece: "Origin", awardYear: "2024" },
    {
      awardName: "Shortlist — 1.4 Awards",
      awardedPiece: "Ember",
      awardYear: "2024",
    },
    {
      awardName: "Official Selection — DocsBarcelona",
      awardedPiece: "Origin",
      awardYear: "2024",
    },
    {
      awardName: "Best Editing — MadCut Fest",
      awardedPiece: "Pulse",
      awardYear: "2025",
    },
  ],
};

export interface ApiStudioPage
  extends Partial<Omit<StudioPageContent, "capabilitiesList">> {
  capabilitiesList?: TextLine[];
}

export function transformStudioPage(api: ApiStudioPage): StudioPageContent {
  const { capabilitiesList, ...rest } = api;
  const merged = { ...FALLBACK_STUDIO_PAGE, ...pickDefined(rest) };
  const capabilities = toStrings(capabilitiesList);
  merged.capabilitiesList = capabilities.length
    ? capabilities
    : FALLBACK_STUDIO_PAGE.capabilitiesList;
  if (!merged.recognitions?.length)
    merged.recognitions = FALLBACK_STUDIO_PAGE.recognitions;
  return merged;
}

/* ============================= contact page ============================= */

export interface ContactPageContent {
  pageEyebrow: string;
  pageTitle: string;
  introParagraph: string;
  newBusinessLabel: string;
  contactEmail: string;
  topicsQuestionLabel: string;
  projectTopics: string[];
  sideVideoUrl: string;
}

export const FALLBACK_CONTACT_PAGE: ContactPageContent = {
  pageEyebrow: "Currently booking — Q4 2026",
  pageTitle: "Contact",
  introParagraph:
    "Tell me what you're making. If it needs a camera, a cut and a point of view, I'm interested.",
  newBusinessLabel: "New business",
  contactEmail: "hello@javivillasoler.studio",
  topicsQuestionLabel: "What are we making?",
  projectTopics: [
    "Brand film",
    "Music video",
    "Commercial",
    "Documentary",
    "Something else",
  ],
  sideVideoUrl: contactVideo,
};

export interface ApiContactPage
  extends Partial<Omit<ContactPageContent, "projectTopics">> {
  projectTopics?: TextLine[];
}

export function transformContactPage(
  api: ApiContactPage
): ContactPageContent {
  const { projectTopics, ...rest } = api;
  const merged = { ...FALLBACK_CONTACT_PAGE, ...pickDefined(rest) };
  const topics = toStrings(projectTopics);
  merged.projectTopics = topics.length
    ? topics
    : FALLBACK_CONTACT_PAGE.projectTopics;
  return merged;
}

/* ============================== helpers ============================== */

/** Shallow copy of `obj` without null/undefined values, so CMS entries
 *  with empty optional fields never wipe out fallback copy. */
function pickDefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== "") {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}
