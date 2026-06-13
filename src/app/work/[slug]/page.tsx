import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { BackToWorkLink } from "@/components/BackToWorkLink";
import {
  projects,
  getProjectBySlug,
  categoryLabels,
} from "@/data/projects";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProjectLinks } from "@/components/ui/ProjectLinks";
import { ProjectLogoStrip } from "@/components/ui/ProjectLogoStrip";
import {
  getProjectHeroImageClasses,
  getProjectImageUrl,
} from "@/lib/project-media";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };

  return {
    title: `${project.title} | Dr Phil X`,
    description: project.bottleneck,
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const gallery =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : [getProjectImageUrl(project, "hero")];

  return (
    <main className="ambient-glow min-h-[100dvh] overflow-x-hidden bg-[#050505] px-6 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <BackToWorkLink />

        <div className="mb-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808]">
          {project.logos && project.logos.length > 0 ? (
            <ProjectLogoStrip logos={project.logos} surface="hero" />
          ) : (
            <div
              className={getProjectHeroImageClasses(project)}
              style={{
                backgroundImage: `url(${getProjectImageUrl(project, "hero")})`,
              }}
            />
          )}
        </div>

        {gallery.length > 1 && (
          <div className="mb-10 grid grid-cols-2 gap-4">
            {gallery.map((src) => (
              <div
                key={src}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.08] bg-[#080808]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 400px"
                />
              </div>
            ))}
          </div>
        )}

        <span className="mb-4 inline-block rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
          {categoryLabels[project.category]}
        </span>

        {project.client && (
          <p className="mb-3 font-mono text-xs tracking-wide text-white/40 uppercase">
            {project.client}
          </p>
        )}

        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {project.title}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {project.links && project.links.length > 0 && (
          <div className="mt-8">
            <ProjectLinks links={project.links} />
          </div>
        )}

        <div className="mt-16 space-y-5">
          <GlassPanel>
            <div className="p-8 md:p-10">
              <p className="mb-2 text-sm font-medium text-accent">The Bottleneck</p>
              <p className="text-lg leading-relaxed text-white/75">
                {project.bottleneck}
              </p>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="p-8 md:p-10">
              <p className="mb-2 text-sm font-medium text-accent">The Solution</p>
              <p className="text-lg leading-relaxed text-white/75">
                {project.solution}
              </p>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="p-8 md:p-10">
              <p className="mb-2 text-sm font-medium text-accent">The Outcome</p>
              <p className="text-lg leading-relaxed text-white/75">
                {project.outcome}
              </p>
            </div>
          </GlassPanel>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/#contact"
            className="btn-shimmer btn-shimmer--primary group gap-3 px-6 py-3 text-sm font-medium shadow-[0_4px_24px_rgba(196,30,58,0.25)] hover:shadow-[0_4px_24px_rgba(196,30,58,0.35)]"
          >
            <span className="shrink-0">Have a similar bottleneck?</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={14} weight="light" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}