import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import type { ProjectLink } from "@/data/projects";

export function ProjectLinks({ links }: { links: ProjectLink[] }) {
  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent/40 hover:text-accent"
        >
          {link.label}
          <ArrowSquareOut size={14} weight="light" />
        </a>
      ))}
    </div>
  );
}