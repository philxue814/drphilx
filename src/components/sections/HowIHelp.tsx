import { engagementPaths } from "@/data/services";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function HowIHelp() {
  return (
    <SectionWrapper id="how">
      <SectionHeader title="Three ways to work together" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {engagementPaths.map((path, i) => (
          <GlassPanel key={path.title} className="h-full">
            <div className="flex h-full flex-col p-8 md:p-10">
              <span className="mb-6 font-mono text-sm text-white/25">
                0{i + 1}
              </span>
              <h3 className="type-display mb-3 text-xl text-white">
                {path.title}
              </h3>
              <p className="type-body text-sm text-muted">{path.description}</p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </SectionWrapper>
  );
}