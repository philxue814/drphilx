export type ProjectCategory =
  | "marketing"
  | "healthcare"
  | "fintech"
  | "publishing"
  | "media"
  | "web";

export type ProjectTier = "primary" | "standard" | "minor";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  bottleneck: string;
  solution: string;
  outcome: string;
  /** Local path under /public, e.g. /projects/foo.jpg */
  image?: string;
  /** "contain" keeps logos/icons fully visible; default is cover */
  imageFit?: "cover" | "contain";
  /** Multiple brand logos shown side by side (e.g. social platforms) */
  logos?: string[];
  /** Extra images for case study galleries */
  gallery?: string[];
  /** How case-study stacked photos are framed */
  galleryLayout?: "vertical" | "contain" | "landscape";
  client?: string;
  links?: ProjectLink[];
  tags: string[];
}

export const categoryLabels: Record<ProjectCategory, string> = {
  marketing: "Marketing",
  healthcare: "Healthcare",
  fintech: "FinTech",
  publishing: "Publishing",
  media: "Media AI",
  web: "Web / Design",
};

/** Visual weight: web + marketing lead, publishing is supporting */
export const categoryTier: Record<ProjectCategory, ProjectTier> = {
  web: "primary",
  marketing: "primary",
  healthcare: "standard",
  fintech: "standard",
  media: "standard",
  publishing: "minor",
};

const tierSortOrder: Record<ProjectTier, number> = {
  primary: 0,
  standard: 1,
  minor: 2,
};

export function getProjectTier(project: Project): ProjectTier {
  return categoryTier[project.category];
}

/** Desktop "All" grid: books sit beside social automation after the two hero cards */
export const allViewOrder: string[] = [
  "guildford-landing",
  "voice-agents",
  "social-automation",
  "ai-seo",
  "childrens-books",
  "coverage-system",
  "options-alerts",
  "fax-summarizer",
  "video-cleaner",
];

export function sortProjectsForDisplay(
  items: Project[],
  filter: ProjectCategory | "all" = "all"
): Project[] {
  if (filter === "all" && items.length === projects.length) {
    return [...items].sort(
      (a, b) => allViewOrder.indexOf(a.slug) - allViewOrder.indexOf(b.slug)
    );
  }

  return [...items].sort((a, b) => {
    const tierDiff =
      tierSortOrder[getProjectTier(a)] - tierSortOrder[getProjectTier(b)];
    if (tierDiff !== 0) return tierDiff;
    return projects.indexOf(a) - projects.indexOf(b);
  });
}

/** Mobile proof-of-work chapter order */
export const mobileChapterOrder: ProjectCategory[] = [
  "web",
  "marketing",
  "publishing",
  "healthcare",
  "fintech",
  "media",
];

/** Mobile carousel panel order within a chapter (when it differs from `projects` array order) */
export const mobileCategoryOrder: Partial<Record<ProjectCategory, string[]>> = {
  marketing: ["social-automation", "ai-seo"],
  healthcare: ["voice-agents", "coverage-system", "fax-summarizer"],
};

export function sortProjectsForMobileChapter(
  items: Project[],
  category: ProjectCategory
): Project[] {
  const order = mobileCategoryOrder[category];
  if (!order) return items;
  return [...items].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
  );
}

export const mobileChapterLabels: Record<ProjectCategory, string> = {
  web: "Web Design",
  marketing: "Marketing",
  healthcare: "Healthcare",
  fintech: "FinTech",
  publishing: "Publishing",
  media: "Media AI",
};

export const categoryColors: Record<ProjectCategory, string> = {
  marketing: "emerald",
  healthcare: "cyan",
  fintech: "amber",
  publishing: "rose",
  media: "violet",
  web: "sky",
};

export const projects: Project[] = [
  {
    slug: "guildford-landing",
    title: "Guildford Eye Clinic Landing Page",
    category: "web",
    client: "Guildford Eye Clinic",
    bottleneck:
      "The clinic needed a premium web presence to attract patients online.",
    solution:
      "Built guildfordeyeclinic.ca: a multilingual, SEO-ready landing page with structured content and conversion-focused design.",
    outcome:
      "A live patient-facing site that establishes trust and drives exam bookings.",
    image: "/projects/screenshot-exam-equipment.jpg",
    gallery: [
      "/projects/gallery/guildford-landing/01.jpg",
      "/projects/gallery/guildford-landing/02.jpg",
      "/projects/gallery/guildford-landing/03.jpg",
      "/projects/gallery/guildford-landing/04.jpg",
    ],
    galleryLayout: "landscape",
    links: [
      {
        label: "guildfordeyeclinic.ca",
        href: "https://guildfordeyeclinic.ca",
      },
    ],
    tags: ["Next.js", "SEO", "Multilingual"],
  },
  {
    slug: "voice-agents",
    title: "AI Voice Agents: Overflow & After Hours",
    category: "healthcare",
    client: "Guildford Eye Clinic",
    bottleneck:
      "After-hours and overflow calls went to voicemail or rang out, losing exam bookings and constant staff interruptions for the same questions.",
    solution:
      "Built bilingual AI voice agents on Vapi and RingCentral that answer when lines are busy or the clinic is closed, texting live booking links, transferring to staff, and notifying the team of missed calls.",
    outcome:
      "Live pilot capturing overflow and after-hours demand with automated booking SMS, live transfers, and staff alerts in English and Mandarin.",
    image: "/projects/gallery/voice-agents/01.jpg",
    gallery: [
      "/projects/gallery/voice-agents/01.jpg",
      "/projects/gallery/voice-agents/02.jpg",
      "/projects/gallery/voice-agents/03.jpg",
      "/projects/gallery/voice-agents/04.jpg",
    ],
    galleryLayout: "landscape",
    tags: ["Voice AI", "Vapi", "RingCentral", "Automation"],
  },
  {
    slug: "social-automation",
    title: "AI Social Media Automation",
    category: "marketing",
    client: "Guildford Eye Clinic",
    bottleneck:
      "Manual social posting consumed hours every week across Instagram and Facebook.",
    solution:
      "Automated @guildfordeyeclinic video posts twice weekly and short posts once weekly with AI-driven content pipelines.",
    outcome:
      "Consistent clinic social presence with zero daily manual effort.",
    image: "/projects/instagram-logo.png",
    imageFit: "contain",
    gallery: [
      "/projects/gallery/social-automation/01.jpg",
      "/projects/gallery/social-automation/02.jpg",
      "/projects/gallery/social-automation/03.jpg",
      "/projects/gallery/social-automation/04.jpg",
    ],
    galleryLayout: "vertical",
    logos: [
      "/projects/instagram-logo.png",
      "/projects/youtube-logo.png",
      "/projects/tiktok-logo.svg",
    ],
    links: [
      {
        label: "Instagram @guildfordeyeclinic",
        href: "https://www.instagram.com/guildfordeyeclinic/",
      },
      {
        label: "Facebook @guildfordeyeclinic",
        href: "https://www.facebook.com/people/Guildford-Eye-Clinic/61589361077307/",
      },
    ],
    tags: ["Automation", "Content", "Social"],
  },
  {
    slug: "ai-seo",
    title: "Google SEO + AI SEO",
    category: "marketing",
    client: "Guildford Eye Clinic",
    bottleneck:
      "Guildford Eye Clinic was nearly invisible in search without an agency budget.",
    solution:
      "Built a dual SEO system for the clinic: Google Business Profile optimization plus AI-driven local content strategy.",
    outcome:
      "Improved discoverability on Google Search and Maps without outsourcing.",
    image: "/projects/guildford-hero-oct.jpg",
    gallery: [
      "/projects/gallery/ai-seo/01.jpg",
      "/projects/gallery/ai-seo/02.jpg",
      "/projects/gallery/ai-seo/03.jpg",
      "/projects/gallery/ai-seo/04.jpg",
    ],
    galleryLayout: "contain",
    links: [
      {
        label: "guildfordeyeclinic.ca",
        href: "https://guildfordeyeclinic.ca",
      },
      {
        label: "Google Maps listing",
        href: "https://maps.google.com/?q=Guildford+Eye+Clinic+Surrey+BC",
      },
    ],
    tags: ["SEO", "AI Content", "Analytics"],
  },
  {
    slug: "coverage-system",
    title: "Guildford Coverage System",
    category: "healthcare",
    bottleneck:
      "Scheduling vacation and coverage for 7-8 doctors created constant administrative chaos.",
    solution:
      "Built an automated system that matches vacation requests with available coverage physicians.",
    outcome:
      "Coverage planning runs itself, with fewer gaps and less back-and-forth.",
    gallery: [
      "/projects/gallery/coverage-system/01.jpg",
      "/projects/gallery/coverage-system/02.jpg",
      "/projects/gallery/coverage-system/03.jpg",
      "/projects/gallery/coverage-system/04.jpg",
    ],
    galleryLayout: "contain",
    tags: ["Scheduling", "Healthcare Ops", "Automation"],
  },
  {
    slug: "options-alerts",
    title: "Options Trading Alert System",
    category: "fintech",
    bottleneck:
      "Capturing market opportunities required daily monitoring that wasn't sustainable.",
    solution:
      "Automated sell put / sell call alerts using technical analysis and volatility measures via APIs and MCPs.",
    outcome:
      "Market signals delivered seamlessly to run on any device.",
    gallery: [
      "/projects/gallery/options-alerts/01.jpg",
      "/projects/gallery/options-alerts/02.jpg",
      "/projects/gallery/options-alerts/03.jpg",
      "/projects/gallery/options-alerts/04.jpg",
    ],
    galleryLayout: "contain",
    tags: ["Trading", "Alerts", "Technical Analysis"],
  },
  {
    slug: "childrens-books",
    title: "Children's Books (2 Titles)",
    category: "publishing",
    bottleneck:
      "Publishing children's books traditionally is slow, expensive, and gatekept.",
    solution:
      "AI-assisted creation and production of Captain Clear: The Epic Myopia Wars and Money Adventures of the Meadow.",
    outcome:
      "Two live Amazon titles, from concept to shelf without a publisher.",
    image: "/projects/captain-clear.jpg",
    gallery: [
      "/projects/gallery/childrens-books/01.jpg",
      "/projects/gallery/childrens-books/02.jpg",
      "/projects/gallery/childrens-books/03.jpg",
      "/projects/gallery/childrens-books/04.jpg",
    ],
    galleryLayout: "vertical",
    links: [
      {
        label: "Captain Clear on Amazon",
        href: "https://www.amazon.ca/Captain-Clear-Epic-Myopia-Wars-ebook/dp/B0GQQN25ZJ",
      },
      {
        label: "Money Adventures on Amazon",
        href: "https://www.amazon.ca/Money-Adventures-Meadow-Childrens-Entrepreneurship-ebook/dp/B0GS745M3G",
      },
    ],
    tags: ["Publishing", "AI Writing", "Amazon"],
  },
  {
    slug: "video-cleaner",
    title: "Video Watermark & Logo Removal",
    category: "media",
    bottleneck:
      "Watermarked or logo-stamped footage was unusable for production.",
    solution:
      "Built an AI pipeline to automatically remove watermarks and logos from any video.",
    outcome:
      "Clean, usable video assets without manual editing.",
    gallery: [
      "/projects/gallery/video-cleaner/01.jpg",
      "/projects/gallery/video-cleaner/02.jpg",
      "/projects/gallery/video-cleaner/03.jpg",
      "/projects/gallery/video-cleaner/04.jpg",
    ],
    tags: ["Video AI", "Media", "Automation"],
  },
  {
    slug: "fax-summarizer",
    title: "Fax Referral Summarizer",
    category: "healthcare",
    bottleneck:
      "Inbound fax referrals piled up unstructured and slowed patient intake.",
    solution:
      "AI system that organizes, categorizes, and summarizes incoming fax referrals automatically.",
    outcome:
      "Faster referral processing and cleaner administrative workflows.",
    gallery: [
      "/projects/gallery/fax-summarizer/01.jpg",
      "/projects/gallery/fax-summarizer/02.jpg",
      "/projects/gallery/fax-summarizer/03.jpg",
      "/projects/gallery/fax-summarizer/04.jpg",
    ],
    tags: ["Healthcare", "Document AI", "Summarization"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}