export interface Project {
  slug: string;
  title: string;
  category: string;
  client: string;
  year: string;
  services: string[];
  video: string;
  image: string;
  aspect: "landscape" | "portrait" | "square";
  description: string[];
}

export const projects: Project[] = [
  {
    slug: "aether",
    title: "Aether",
    category: "Brand Film",
    client: "Atlas Outdoor",
    year: "2025",
    services: ["Direction", "Cinematography", "Color Grading"],
    video:
      "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
    image: "https://picsum.photos/seed/aether-folio/1600/1000",
    aspect: "landscape",
    description: [
      "A brand film shot across the highlands, built around the idea that silence is the loudest statement a brand can make. We spent nine days chasing weather windows and let the landscape dictate the edit.",
      "The final cut runs on a single breath — no voiceover, no supers, just movement and scale. It became the centerpiece of the brand's global relaunch campaign.",
    ],
  },
  {
    slug: "pulse",
    title: "Pulse",
    category: "Music Video",
    client: "Nova Records",
    year: "2025",
    services: ["Direction", "Edit", "Motion Design"],
    video:
      "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
    image: "https://picsum.photos/seed/pulse-folio/1600/1000",
    aspect: "portrait",
    description: [
      "One dancer, one take, one light source. Pulse was an exercise in restriction — every cut in the edit is triggered by a kick drum, every camera move mirrors the choreography.",
      "Shot in a single evening on a converted warehouse floor, the piece premiered as a vertical-first release and crossed two million organic views in its first week.",
    ],
  },
  {
    slug: "solstice",
    title: "Solstice",
    category: "Commercial",
    client: "Meridian Hotels",
    year: "2024",
    services: ["Direction", "Edit", "Sound Design"],
    video:
      "https://videos.pexels.com/video-files/1526909/1526909-hd_1920_1080_24fps.mp4",
    image: "https://picsum.photos/seed/solstice-folio/1600/1000",
    aspect: "landscape",
    description: [
      "A thirty-second spot about the hour when the city changes hands. We shot exclusively at dusk over two weeks, building a library of transitions between day and night.",
      "The campaign ran across six markets and doubled direct bookings during the launch quarter.",
    ],
  },
  {
    slug: "velvet",
    title: "Velvet",
    category: "Fashion Film",
    client: "Maison Lumen",
    year: "2024",
    services: ["Direction", "Cinematography", "Color Grading"],
    video:
      "https://videos.pexels.com/video-files/857195/857195-hd_1280_720_25fps.mp4",
    image: "https://picsum.photos/seed/velvet-folio/1600/1000",
    aspect: "portrait",
    description: [
      "Commissioned for the FW24 collection, Velvet treats fabric as landscape. Macro lenses, slow motion, and a palette pulled straight from the collection's dye baths.",
      "The film screened at the collection premiere and now lives as the brand's permanent digital flagship piece.",
    ],
  },
  {
    slug: "origin",
    title: "Origin",
    category: "Documentary",
    client: "Kosmos Studio",
    year: "2024",
    services: ["Direction", "Edit", "Color Grading"],
    video:
      "https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4",
    image: "https://picsum.photos/seed/origin-folio/1600/1000",
    aspect: "landscape",
    description: [
      "A short documentary about the last generation of artisans in a trade that machines are quietly replacing. Twelve minutes, three protagonists, zero interviews on camera.",
      "Origin was selected for two international short film festivals and picked up a Vimeo Staff Pick.",
    ],
  },
  {
    slug: "kinetic",
    title: "Kinetic",
    category: "Sport Film",
    client: "Vertex Athletics",
    year: "2023",
    services: ["Direction", "Edit", "Motion Design"],
    video:
      "https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4",
    image: "https://picsum.photos/seed/kinetic-folio/1600/1000",
    aspect: "landscape",
    description: [
      "Launch film for a performance line built for city athletes. We rigged cameras to bikes, boards and bodies to keep the lens inside the movement instead of observing it.",
      "The 45-second hero cut anchored the launch, supported by a system of nine cutdowns for paid and social.",
    ],
  },
  {
    slug: "mirage",
    title: "Mirage",
    category: "Travel Film",
    client: "Obsidian Journal",
    year: "2023",
    services: ["Direction", "Cinematography", "Edit"],
    video:
      "https://videos.pexels.com/video-files/2711092/2711092-hd_1920_1080_24fps.mp4",
    image: "https://picsum.photos/seed/mirage-folio/1600/1000",
    aspect: "landscape",
    description: [
      "A travel piece with no itinerary — we bought one-way tickets and let the footage decide the route. Mirage is stitched from four countries, thirty days, and a single hard drive.",
      "Published as a long-form editorial film, it became the magazine's most shared piece of the year.",
    ],
  },
  {
    slug: "ember",
    title: "Ember",
    category: "Short Film",
    client: "Independent",
    year: "2023",
    services: ["Direction", "Edit", "Sound Design"],
    video:
      "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
    image: "https://picsum.photos/seed/ember-folio/1600/1000",
    aspect: "landscape",
    description: [
      "A self-initiated short about the ten minutes after sunset — the ember hour — when light behaves like memory. Shot over a full year, always in the same ten-minute window.",
      "Ember is the piece that defines how I think about color, patience, and the edit as a form of writing.",
    ],
  },
];

export const showreelVideo =
  "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4";

export const studioVideo =
  "https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4";

export const contactVideo =
  "https://videos.pexels.com/video-files/1580455/1580455-hd_1920_1080_30fps.mp4";

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
