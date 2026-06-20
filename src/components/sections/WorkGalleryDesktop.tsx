"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CaseStudyLink } from "@/components/CaseStudyLink";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  projects,
  categoryLabels,
  getProjectTier,
  sortProjectsForDisplay,
  type Project,
  type ProjectCategory,
  type ProjectTier,
} from "@/data/projects";
import { ProjectLogoStrip } from "@/components/ui/ProjectLogoStrip";
import {
  getProjectImageClasses,
  getProjectImageUrl,
} from "@/lib/project-media";

gsap.registerPlugin(ScrollTrigger);

const ALL_VIEW_SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5 md:row-span-2",
  "md:col-span-8",
  "md:col-span-4",
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-6",
];

function getBentoSpan(
  project: Project,
  filtered: Project[],
  filter: ProjectCategory | "all"
): string {
  if (filter === "all" && filtered.length === projects.length) {
    const index = filtered.findIndex((p) => p.slug === project.slug);
    return ALL_VIEW_SPANS[index] ?? "md:col-span-6";
  }

  const tier = getProjectTier(project);
  const total = filtered.length;

  if (total === 1) {
    return tier === "minor" ? "md:col-span-6" : "md:col-span-12 md:row-span-2";
  }

  if (tier === "primary") {
    const primaryItems = filtered.filter((p) => getProjectTier(p) === "primary");
    const index = primaryItems.indexOf(project);

    if (primaryItems.length === 1) {
      return "md:col-span-12 md:row-span-2";
    }
    if (primaryItems.length === 2) {
      return index === 0
        ? "md:col-span-7 md:row-span-2"
        : "md:col-span-5 md:row-span-2";
    }

    const spans = [
      "md:col-span-7 md:row-span-2",
      "md:col-span-5 md:row-span-2",
      "md:col-span-12",
    ];
    return spans[index] ?? "md:col-span-6";
  }

  if (tier === "minor") {
    return "md:col-span-4";
  }

  const standardItems = filtered.filter((p) => getProjectTier(p) === "standard");
  const index = standardItems.indexOf(project);
  if (standardItems.length === 1) return "md:col-span-8";
  return index % 2 === 0 ? "md:col-span-6" : "md:col-span-6";
}

function isFeaturedSpan(span: string): boolean {
  return span.includes("row-span-2");
}

type CardVariant = "featured" | "standard" | "compact";

function getCardVariant(project: Project, span: string): CardVariant {
  if (getProjectTier(project) === "minor") return "compact";
  if (isFeaturedSpan(span)) return "featured";
  return "standard";
}

function ProjectCard({
  project,
  span,
  variant,
}: {
  project: Project;
  span: string;
  variant: CardVariant;
}) {
  const compact = variant === "compact";
  const featured = variant === "featured";

  return (
    <CaseStudyLink
      href={`/work/${project.slug}`}
      data-work-card
      data-work-tier={getProjectTier(project)}
      data-work-featured={featured ? "true" : "false"}
      className={`group relative h-full cursor-pointer overflow-hidden border border-white/[0.08] bg-[#080808]/80 transition-[border-color,box-shadow] duration-500 hover:border-accent/35 hover:shadow-[0_20px_60px_rgba(196,30,58,0.12)] ${span} ${
        compact ? "rounded-xl" : "rounded-2xl"
      }`}
    >
      <div
        className={
          featured
            ? "grid h-full min-h-[460px] grid-rows-[1fr_auto] md:min-h-[520px] md:grid-cols-[1.05fr_0.95fr] md:grid-rows-1"
            : compact
              ? "flex h-full min-h-[200px] flex-row"
              : "flex h-full min-h-[260px] flex-col"
        }
      >
        <div
          className={`relative overflow-hidden ${
            featured
              ? "min-h-[220px] md:min-h-full"
              : compact
                ? "h-full w-[38%] shrink-0 min-h-[200px]"
                : "h-36 shrink-0"
          }`}
        >
          {project.logos && project.logos.length > 0 ? (
            <ProjectLogoStrip
              logos={project.logos}
              surface="card"
              variant={compact ? "compact" : featured ? "featured" : "standard"}
            />
          ) : (
            <div
              data-work-image
              className={getProjectImageClasses(project, {
                surface: "card",
                compact,
              })}
              style={{
                backgroundImage: `url(${getProjectImageUrl(project, "card")})`,
              }}
            />
          )}
          <div
            className={`absolute inset-0 ${
              compact
                ? "bg-gradient-to-r from-transparent via-[#050505]/30 to-[#050505]/92"
                : "bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-[#050505]/25 md:to-[#050505]/90"
            }`}
          />
        </div>

        <div
          className={`relative flex flex-col justify-between ${
            compact ? "flex-1 p-5" : "p-7 md:p-8 lg:p-9"
          }`}
        >
          <div>
            <p
              className={`font-mono tracking-wide text-white/35 ${
                compact ? "text-[10px]" : "text-[11px]"
              }`}
            >
              {categoryLabels[project.category]}
            </p>
            <h3
              className={`type-display mt-2 text-white transition-colors duration-300 group-hover:text-accent ${
                featured
                  ? "text-2xl leading-tight lg:text-[1.75rem]"
                  : compact
                    ? "text-base leading-snug"
                    : "text-lg leading-snug lg:text-xl"
              }`}
            >
              {project.title}
            </h3>
            <p
              className={`mt-2 leading-relaxed text-muted ${
                featured
                  ? "text-base line-clamp-3"
                  : compact
                    ? "text-xs line-clamp-2"
                    : "text-sm line-clamp-2"
              }`}
            >
              {project.bottleneck}
            </p>
          </div>

          <div
            className={`flex items-end justify-between gap-3 ${
              compact
                ? "mt-4 border-t border-white/[0.05] pt-3"
                : "mt-6 border-t border-white/[0.06] pt-5"
            }`}
          >
            <p
              className={`leading-relaxed text-white/55 ${
                featured
                  ? "line-clamp-2 text-sm"
                  : compact
                    ? "line-clamp-1 text-xs text-white/40"
                    : "line-clamp-1 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              }`}
            >
              {project.outcome}
            </p>
            <span
              className={`flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 group-hover:border-accent group-hover:bg-accent/10 group-hover:text-accent ${
                compact ? "h-8 w-8" : "h-10 w-10"
              }`}
            >
              <ArrowUpRight size={compact ? 14 : 16} weight="light" />
            </span>
          </div>
        </div>
      </div>
    </CaseStudyLink>
  );
}

export function WorkGalleryDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = sortProjectsForDisplay(projects, "all");

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !sectionRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        if (pinRef.current && gridRef.current) {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 12%",
            end: () =>
              `+=${Math.max(gridRef.current?.offsetHeight ?? 0, 600) * 0.72}`,
            pin: pinRef.current,
            pinSpacing: true,
            anticipatePin: 1,
          });
        }

        const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]");
        cards.forEach((card) => {
          const image = card.querySelector("[data-work-image]");
          const tier = card.dataset.workTier as ProjectTier | undefined;
          const yOffset = tier === "minor" ? 16 : 32;

          gsap.fromTo(
            card,
            { opacity: tier === "minor" ? 0.65 : 0.5, y: yOffset },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                end: "top 55%",
                scrub: 0.6,
              },
            }
          );
          if (image) {
            gsap.fromTo(
              image,
              { scale: tier === "minor" ? 0.92 : 0.86 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top 95%",
                  end: "top 50%",
                  scrub: 0.8,
                },
              }
            );
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative hidden md:block">
      <div
        className="pointer-events-none absolute -right-20 top-1/4 h-[420px] w-[420px] rounded-full bg-accent/8 blur-[120px]"
        aria-hidden
      />

      <div className="grid grid-cols-12 gap-x-10 lg:gap-x-14">
        <aside ref={pinRef} className="col-span-4 self-start xl:col-span-3">
          <p className="type-eyebrow text-accent/90">Proof of Work</p>
          <h2 className="type-display mt-5 max-w-[16ch] text-4xl text-white lg:text-5xl xl:text-[3.25rem]">
            Systems I&apos;ve built
          </h2>
          <p className="type-body mt-6 text-muted">
            Real projects solving real bottlenecks, in my own businesses first.
          </p>
        </aside>

        <div ref={gridRef} className="col-span-8 xl:col-span-9">
          <div className="grid auto-rows-[minmax(200px,auto)] grid-flow-dense grid-cols-12 gap-4 lg:gap-5">
            {filtered.map((project) => {
              const span = getBentoSpan(project, filtered, "all");
              const variant = getCardVariant(project, span);

              return (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  span={span}
                  variant={variant}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}