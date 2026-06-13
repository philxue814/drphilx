"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BACKSCROLL_FRAME_COUNT = 145;
const FRAME_LERP = 0.14;
const OPACITY_LERP = 0.1;
const SCRUB_SMOOTHING = 6;
const LOOP_COUNT = 5;
const OPACITY_MIN = 0.3;
const OPACITY_MAX = 0.75;

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

function backscrollFrameSrc(index: number) {
  return `/backscroll/frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function getHeroEnd() {
  const hero = document.getElementById("hero");
  return hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
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
  const targetVirtualRef = useRef(0);
  const currentVirtualRef = useRef(0);
  const targetOpacityRef = useRef(0);
  const displayOpacityRef = useRef(0);
  const displayedFrameRef = useRef(-1);
  const activeBufferRef = useRef<0 | 1>(0);
  const frameCacheRef = useRef<HTMLImageElement[]>([]);
  const framesReadyRef = useRef(false);
  const swapPendingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const media = mediaRef.current;
    if (!media) return;

    let cancelled = false;
    let scrollTrigger: ScrollTrigger | undefined;

    const cache = Array.from({ length: BACKSCROLL_FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = backscrollFrameSrc(i);
      return img;
    });
    frameCacheRef.current = cache;

    const primeFirstFrame = async () => {
      const prime = bufferARef.current;
      if (!prime || !cache[0]) return;
      await waitForImage(cache[0]);
      if (cancelled) return;
      prime.src = cache[0].src;
      await waitForImage(prime);
      if (cancelled) return;
      displayedFrameRef.current = 0;
    };

    const preloadAllFrames = async () => {
      const batchSize = 12;
      for (let i = 0; i < cache.length; i += batchSize) {
        if (cancelled) return;
        const batch = cache.slice(i, i + batchSize);
        await Promise.all(batch.map((img) => waitForImage(img)));
      }
      if (!cancelled) framesReadyRef.current = true;
    };

    const swapToFrame = (frameIndex: number) => {
      if (
        frameIndex === displayedFrameRef.current ||
        swapPendingRef.current ||
        !framesReadyRef.current
      ) {
        return;
      }

      const cached = frameCacheRef.current[frameIndex];
      const inactive =
        activeBufferRef.current === 0
          ? bufferBRef.current
          : bufferARef.current;
      const active =
        activeBufferRef.current === 0
          ? bufferARef.current
          : bufferBRef.current;
      if (!cached?.complete || cached.naturalWidth === 0 || !inactive || !active) {
        return;
      }

      swapPendingRef.current = true;
      inactive.src = cached.src;

      void waitForImage(inactive).then(() => {
        swapPendingRef.current = false;
        if (cancelled || inactive.naturalWidth === 0) return;

        inactive.style.opacity = "1";
        active.style.opacity = "0";
        activeBufferRef.current = activeBufferRef.current === 0 ? 1 : 0;
        displayedFrameRef.current = frameIndex;
      });
    };

    const tick = () => {
      currentVirtualRef.current = lerp(
        currentVirtualRef.current,
        targetVirtualRef.current,
        FRAME_LERP
      );

      const frameIndex =
        Math.round(currentVirtualRef.current) % BACKSCROLL_FRAME_COUNT;
      swapToFrame(frameIndex);

      displayOpacityRef.current = lerp(
        displayOpacityRef.current,
        targetOpacityRef.current,
        OPACITY_LERP
      );
      media.style.opacity = String(displayOpacityRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    const bindScroll = () => {
      scrollTrigger?.kill();
      const heroEnd = getHeroEnd();

      scrollTrigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: () => `${getHeroEnd()} top`,
        end: "max",
        scrub: SCRUB_SMOOTHING,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const eased = self.progress * self.progress * (3 - 2 * self.progress);
          targetVirtualRef.current =
            eased * LOOP_COUNT * (BACKSCROLL_FRAME_COUNT - 1);
          targetOpacityRef.current =
            OPACITY_MIN + eased * (OPACITY_MAX - OPACITY_MIN);
        },
        onLeaveBack: () => {
          targetVirtualRef.current = 0;
          targetOpacityRef.current = 0;
        },
      });

      if (window.scrollY < heroEnd) {
        targetVirtualRef.current = 0;
        targetOpacityRef.current = 0;
      }
    };

    const start = async () => {
      await primeFirstFrame();
      if (cancelled) return;

      if (prefersReduced) {
        displayOpacityRef.current = 0.3;
        media.style.opacity = "0.3";
        return;
      }

      void preloadAllFrames();
      bindScroll();
      ScrollTrigger.refresh();
      rafRef.current = requestAnimationFrame(tick);
    };

    void start();

    const handleResize = () => {
      bindScroll();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      scrollTrigger?.kill();
      window.removeEventListener("resize", handleResize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]"
      aria-hidden
    >
      <div
        ref={mediaRef}
        className="absolute inset-0 opacity-0 will-change-[opacity]"
        style={{ transform: "translateZ(0)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bufferARef}
          alt=""
          decoding="sync"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-100"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bufferBRef}
          alt=""
          decoding="sync"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-0"
        />
      </div>
    </div>
  );
}