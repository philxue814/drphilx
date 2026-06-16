"use client";

import type { Project } from "@/data/projects";
import { ProjectGalleryCycle } from "@/components/ui/ProjectGalleryCycle";
import { getProjectGalleryImages } from "@/lib/project-media";

export function ProjectCaseStudyGallery({ project }: { project: Project }) {
  if (getProjectGalleryImages(project).length === 0) return null;

  return <ProjectGalleryCycle project={project} surface="detail" />;
}