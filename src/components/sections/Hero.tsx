"use client";

import { ScrollExpandMedia } from "@/components/ui/scroll-expansion-hero";
import { CTAButton } from "@/components/ui/CTAButton";

export function Hero() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/hero/hero-video-1080.mp4"
      posterSrc="/hero/hero-poster-2k.webp"
      scrollToExpand="Scroll to assemble"
      scrubVideo
      actions={
        <>
          <CTAButton href="#work">See My Work</CTAButton>
          <CTAButton href="#contact" variant="secondary">
            Tell Me Your Problem
          </CTAButton>
        </>
      }
    >
      <h1
        data-hero-copy
        className="type-display mx-auto max-w-3xl will-change-[opacity,transform] text-[clamp(1.65rem,5vw,3.5rem)] leading-[1.12] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:max-w-4xl"
      >
        Custom AI Solutions
        <br />
        <span className="text-accent">Automation for</span>
        <br />
        <span className="text-accent">real productivity.</span>
      </h1>
      <p
        data-hero-copy
        className="type-body mx-auto mt-4 max-w-[42ch] will-change-[opacity,transform] text-sm leading-relaxed text-white/70 drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] md:mt-5 md:text-base md:text-white/60 md:drop-shadow-none"
      >
        Suit your exact personal or business needs.
      </p>
    </ScrollExpandMedia>
  );
}