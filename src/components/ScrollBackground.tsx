"use client";

import { useEffect, useRef } from "react";
import { isHeroScrollLocked } from "@/lib/hero-scroll-lock";

const BACKSCROLL_FRAME_COUNT = 145;
const LOOP_COUNT = 5;
const FIXED_OPACITY = 0.55;

function backscrollFrameSrc(index: number) {
  return `/backscroll/frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function waitForImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) {
    return img.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      void (img.decode?.().catch(() => undefined) ?? Promise.resolve()).then(
        () => resolve()
      );
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

export function ScrollBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const bufferARef = useRef<HTMLImageElement>(null);
  const bufferBRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;

    let cancelled = false;
    let heroEnd = 0;
    let scrollMax = 1;
    let displayedFrame = -1;
    let activeBuffer: 0 | 1 = 0;
    let framesReady = false;
    let scrollRaf: number | null = null;
    let resizeObserver: ResizeObserver | undefined;

    const cache = Array.from({ length: BACKSCROLL_FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = backscrollFrameSrc(i);
      return img;
    });

    const measureScrollBounds = () => {
      const hero = document.getElementById("hero");
      heroEnd = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      scrollMax = Math.max(
        document.documentElement.scrollHeight - window.innerHeight - heroEnd,
        1
      );
    };

    const pinToViewport = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        root.style.transform = "translate3d(0,0,0)";
        root.style.height = "100dvh";
        return;
      }

      root.style.transform = `translate3d(0, ${viewport.offsetTop}px, 0)`;
      root.style.height = `${viewport.height}px`;
    };

    const swapToFrame = (frameIndex: number) => {
      if (frameIndex === displayedFrame || !framesReady) return;

      const cached = cache[frameIndex];
      const inactive = activeBuffer === 0 ? bufferBRef.current : bufferARef.current;
      const active = activeBuffer === 0 ? bufferARef.current : bufferBRef.current;
      if (!cached?.complete || cached.naturalWidth === 0 || !inactive || !active) {
        return;
      }

      inactive.src = cached.src;
      inactive.style.opacity = "1";
      active.style.opacity = "0";
      activeBuffer = activeBuffer === 0 ? 1 : 0;
      displayedFrame = frameIndex;
    };

    const applyFromScroll = () => {
      pinToViewport();

      if (prefersReduced) {
        media.style.opacity = "0.3";
        return;
      }

      if (isHeroScrollLocked() || window.scrollY < heroEnd) {
        media.style.opacity = "0";
        return;
      }

      media.style.opacity = String(FIXED_OPACITY);

      const raw = Math.min(
        1,
        Math.max(0, (window.scrollY - heroEnd) / scrollMax)
      );
      const frameIndex =
        Math.round(raw * LOOP_COUNT * (BACKSCROLL_FRAME_COUNT - 1)) %
        BACKSCROLL_FRAME_COUNT;
      swapToFrame(frameIndex);
    };

    const scheduleApply = () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        applyFromScroll();
      });
    };

    const primeFirstFrame = async () => {
      const prime = bufferARef.current;
      if (!prime || !cache[0]) return;
      await waitForImage(cache[0]);
      if (cancelled) return;
      prime.src = cache[0].src;
      displayedFrame = 0;
    };

    const preloadAllFrames = async () => {
      const batchSize = 12;
      for (let i = 0; i < cache.length; i += batchSize) {
        if (cancelled) return;
        const batch = cache.slice(i, i + batchSize);
        await Promise.all(batch.map((img) => waitForImage(img)));
      }
      if (!cancelled) framesReady = true;
    };

    const start = async () => {
      measureScrollBounds();
      pinToViewport();
      await primeFirstFrame();
      if (cancelled) return;

      void preloadAllFrames();
      applyFromScroll();
    };

    void start();

    const hero = document.getElementById("hero");
    if (hero) {
      resizeObserver = new ResizeObserver(() => {
        measureScrollBounds();
        scheduleApply();
      });
      resizeObserver.observe(hero);
    }

    window.addEventListener("scroll", scheduleApply, { passive: true });
    window.addEventListener("resize", () => {
      measureScrollBounds();
      pinToViewport();
      scheduleApply();
    });

    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener("resize", scheduleApply);
      viewport.addEventListener("scroll", scheduleApply);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleApply);
      window.removeEventListener("resize", scheduleApply);
      viewport?.removeEventListener("resize", scheduleApply);
      viewport?.removeEventListener("scroll", scheduleApply);
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0 z-0 w-full overflow-hidden bg-[#050505]"
      style={{ height: "100dvh", transform: "translate3d(0,0,0)" }}
      aria-hidden
    >
      <div
        ref={mediaRef}
        className="absolute inset-0 opacity-0"
        style={{ transform: "translateZ(0)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bufferARef}
          alt=""
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bufferBRef}
          alt=""
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0"
        />
      </div>
    </div>
  );
}