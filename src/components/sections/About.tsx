import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function About() {
  return (
    <SectionWrapper id="about">
      <GlassPanel>
        <div className="grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-2 md:p-14">
          <div>
            <h2 className="type-display text-3xl text-white md:text-4xl lg:text-[2.75rem]">
              Dr Phil X
            </h2>
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/40">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Builder
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Consultant
              </span>
              <span className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-accent/90">
                Coach
              </span>
            </div>
          </div>
          <div className="space-y-4 type-body-lg text-muted">
            <p>
              I&apos;m a business owner building AI automation for businesses,
              including my own. I&apos;m already financially independent, so this
              work is passion driven: real systems I run every day, not templates
              or theory.
            </p>
            <p>
              I work with select businesses that want the same edge: custom
              solutions, not templates. Implementation, consulting, or coaching,
              whatever gets you from problem to working system fastest.
            </p>
          </div>
        </div>
      </GlassPanel>
    </SectionWrapper>
  );
}