"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/data/services";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

gsap.registerPlugin(ScrollTrigger);

export function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !sectionRef.current || !pinRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=180%",
          pin: pinRef.current,
          pinSpacing: true,
        });

        gsap.from("[data-process-step]", {
          x: 24,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
            end: "+=140%",
            scrub: 1,
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <SectionWrapper id="process" className="!py-24 md:!py-32">
      <div ref={sectionRef} className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div ref={pinRef} className="md:min-h-[40vh]">
          <SectionHeader
            title="From bottleneck to working system"
            description="A structured path from understanding your problem to a deployed, maintainable AI solution."
          />
        </div>

        <div className="flex flex-col gap-4">
          {processSteps.map((step) => (
            <div key={step.step} data-process-step>
              <GlassPanel>
                <div className="flex items-start gap-4 p-6">
                  <span className="font-mono text-sm text-accent/60">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.description}</p>
                  </div>
                </div>
              </GlassPanel>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}