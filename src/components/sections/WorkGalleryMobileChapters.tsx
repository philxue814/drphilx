"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CaseStudyLink } from "@/components/CaseStudyLink";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  projects,
  mobileChapterOrder,
  mobileChapterLabels,
  categoryTier,
  sortProjectsForMobileChapter,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { ProjectLogoStrip } from "@/components/ui/ProjectLogoStrip";
import {
  getProjectImageClasses,
  getProjectImageUrl,
} from "@/lib/project-media";

function chapterProjects(category: ProjectCategory): Project[] {
  return sortProjectsForMobileChapter(
    projects.filter((p) => p.category === category),
    category
  );
}

function ProjectPanel({
  project,
  minor,
}: {
  project: Project;
  minor: boolean;
}) {
  return (
    <article
      className={`book-page w-full shrink-0 snap-center snap-always ${
        minor ? "book-page-minor" : ""
      }`}
    >
      {project.logos && project.logos.length > 0 ? (
        <ProjectLogoStrip
          logos={project.logos}
          surface="mobile"
          minor={minor}
        />
      ) : (
        <div
          className={getProjectImageClasses(project, {
            surface: "mobile",
            minor,
          })}
          style={{
            backgroundImage: `url(${getProjectImageUrl(project, "mobile")})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/88 to-[#0a0a0a]/35" />
      <div
        className={`book-page-inner relative flex flex-col ${
          minor ? "gap-2.5" : "gap-3.5"
        }`}
      >
        <div>
          <h4
            className={`font-semibold leading-snug text-white ${
              minor ? "text-base" : "text-lg"
            }`}
          >
            {project.title}
          </h4>
          <p
            className={`mt-2 leading-relaxed text-white/65 ${
              minor ? "text-xs line-clamp-2" : "mt-3 text-sm"
            }`}
          >
            {project.bottleneck}
          </p>
        </div>

        {!minor && (
          <div className="rounded-xl border border-white/10 bg-black/35 p-3.5 backdrop-blur-sm">
            <p className="font-mono text-xs font-medium text-accent">Outcome</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              {project.outcome}
            </p>
          </div>
        )}

        {minor && (
          <p className="text-xs leading-relaxed text-white/45 line-clamp-2">
            {project.outcome}
          </p>
        )}

        <div className={`flex flex-col ${minor ? "gap-2" : "gap-3"}`}>
          {project.links && project.links.length > 0 && (
            <ProjectLinks links={project.links} />
          )}
          <CaseStudyLink
            href={`/work/${project.slug}`}
            className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 font-medium text-white transition-colors hover:border-accent/40 hover:text-accent ${
              minor ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"
            }`}
          >
            Open case study
            <ArrowUpRight size={minor ? 10 : 12} weight="light" />
          </CaseStudyLink>
        </div>
      </div>
    </article>
  );
}

function ChapterSection({
  category,
  isLast,
}: {
  category: ProjectCategory;
  isLast: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);
  const items = chapterProjects(category);
  const multiPanel = items.length > 1;
  const minor = categoryTier[category] === "minor";

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !multiPanel) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActivePanel(Math.min(Math.max(index, 0), items.length - 1));
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: minor ? 12 : 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: minor ? 12 : 24 }}
      transition={{ duration: minor ? 0.4 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full ${isLast ? "" : minor ? "mb-4" : "mb-6"}`}
    >
      <header className={`mb-3 ${minor ? "opacity-70" : ""}`}>
        <p
          className={`book-page-meta ${minor ? "text-white/25 tracking-[0.2em]" : ""}`}
        >
          {mobileChapterLabels[category]}
        </p>
      </header>

      {multiPanel ? (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="book-scroll-track flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {items.map((project) => (
            <ProjectPanel key={project.slug} project={project} minor={minor} />
          ))}
        </div>
      ) : (
        <ProjectPanel project={items[0]} minor={minor} />
      )}

      {multiPanel && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                minor ? "h-0.5" : "h-1"
              } ${
                i === activePanel
                  ? minor
                    ? "w-4 bg-accent/70"
                    : "w-5 bg-accent"
                  : minor
                    ? "w-1.5 bg-white/15"
                    : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}

export function WorkGalleryMobileChapters() {
  return (
    <div className="w-full md:hidden">
      {mobileChapterOrder.map((category, index) => (
        <ChapterSection
          key={category}
          category={category}
          isLast={index === mobileChapterOrder.length - 1}
        />
      ))}
    </div>
  );
}