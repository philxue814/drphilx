import { processSteps } from "@/data/services";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function Process() {
  return (
    <SectionWrapper id="process">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-medium tracking-wide text-accent">
            Process
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            From bottleneck to working system
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            A structured path from understanding your problem to a deployed,
            maintainable AI solution.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:border-accent/25 hover:shadow-[0_8px_32px_rgba(196,30,58,0.06)]"
            >
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-accent/60">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}