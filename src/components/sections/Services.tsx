"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Cpu,
  Megaphone,
  GearSix,
  RocketLaunch,
} from "@phosphor-icons/react";
import { services } from "@/data/services";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { SectionHeader } from "@/components/ui/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const icons = [Cpu, Megaphone, GearSix, RocketLaunch];

export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-service-card]", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="services" priority>
      <div ref={sectionRef}>
        <SectionHeader
          priority
          label="What I Solve"
          labelClassName="text-accent-bright"
          title="AI that targets your specific business bottlenecks"
          description="Every engagement starts with your problem, then I design automation that adds real, measurable value to your operations."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((service, i) => {
            const Icon = icons[i];
            return (
              <div key={service.title} data-service-card>
                <GlassPanel className="h-full">
                  <div className="flex h-full flex-col p-8 md:p-10">
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                        <Icon size={22} weight="light" />
                      </div>
                      <span className="max-w-[11rem] text-right text-xs font-semibold leading-snug text-accent-bright">
                        {service.outcome}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-white md:text-2xl">
                      {service.title}
                    </h3>
                    <p className="flex-1 leading-relaxed text-muted">
                      {service.description}
                    </p>
                  </div>
                </GlassPanel>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}