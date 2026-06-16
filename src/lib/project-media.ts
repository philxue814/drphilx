import type { Project } from "@/data/projects";

export const PROJECT_GALLERY_SIZE = 4;

export type ImageSurface = "card" | "mobile" | "hero" | "detail";

export type GalleryLayout = "vertical" | "contain" | "landscape";

export function getProjectGalleryLayout(project: Project): GalleryLayout {
  return project.galleryLayout ?? "landscape";
}

export function getProjectGalleryImages(project: Project): string[] {
  if (project.gallery && project.gallery.length > 0) {
    return project.gallery.slice(0, PROJECT_GALLERY_SIZE);
  }

  if (project.image) {
    return [project.image];
  }

  return [];
}

export function getProjectImageUrl(
  project: Project,
  size: "card" | "hero" | "mobile" = "card"
): string {
  if (project.image) return project.image;

  const widths = { card: 1920, hero: 1400, mobile: 1200 };
  const heights = { card: 1080, hero: 800, mobile: 800 };

  return `https://picsum.photos/seed/${project.slug}/${widths[size]}/${heights[size]}`;
}

export function getProjectImageClasses(
  project: Project,
  options: {
    surface?: ImageSurface;
    compact?: boolean;
    minor?: boolean;
  } = {}
): string {
  const { surface = "card", compact = false, minor = false } = options;

  if (project.imageFit === "contain") {
    const hover =
      surface === "card"
        ? "transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        : "";
    return `absolute inset-0 bg-contain bg-center bg-no-repeat opacity-95 ${hover}`;
  }

  const opacity =
    surface === "mobile"
      ? minor
        ? "opacity-15"
        : "opacity-25"
      : compact
        ? "opacity-20"
        : "opacity-30";

  const hover =
    surface === "card"
      ? "transition-transform duration-700 ease-out group-hover:scale-105"
      : "";

  return `absolute inset-0 bg-cover bg-center mix-blend-luminosity contrast-125 ${opacity} ${hover}`.trim();
}

export function getProjectHeroImageClasses(project: Project): string {
  if (project.imageFit === "contain") {
    return "h-64 bg-contain bg-center bg-no-repeat md:h-80";
  }

  return "h-64 bg-cover bg-center md:h-80";
}