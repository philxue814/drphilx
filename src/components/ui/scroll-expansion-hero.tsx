"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  clearHomeScrollRestore,
  peekHomeScrollRestore,
} from "@/lib/home-scroll-restore";

const HERO_VIDEO_1080 = "/hero/hero-video-1080.mp4";
const HERO_POSTER_2K = "/hero/hero-poster-2k.webp";
const HERO_AUDIO = "/hero/hero-audio.m4a";
const HERO_FRAME_COUNT = 145;
const WHEEL_STEP = 0.0003;
const TOUCH_DRAG_UP = 0.008 / 3;
const TOUCH_DRAG_DOWN = 0.005 / 3;
const HERO_COPY_FADE_END = 0.5;
const HERO_COPY_CHUNK_BASE_START = 0.16;
const HERO_COPY_CHUNK_STAGGER = 0.08;
const HERO_COPY_CHUNK_SPAN = 0.18;

function heroCopyFade(
  progress: number,
  fadeStart: number,
  fadeEnd: number = 1
) {
  const span = Math.max(fadeEnd - fadeStart, 0.001);
  const t = Math.max(0, Math.min(1, (progress - fadeStart) / span));
  return t * t * (3 - 2 * t);
}

function heroCopyChunkRange(index: number) {
  const start = HERO_COPY_CHUNK_BASE_START + index * HERO_COPY_CHUNK_STAGGER;
  return {
    start,
    end: Math.min(start + HERO_COPY_CHUNK_SPAN, HERO_COPY_FADE_END),
  };
}

function applyHeroCopyChunkFade(
  el: HTMLElement,
  progress: number,
  index: number
) {
  const { start, end } = heroCopyChunkRange(index);
  const fade = heroCopyFade(progress, start, end);
  const lift = 20 - index * 2;
  el.style.opacity = String(fade);
  el.style.transform = `translate3d(0,${lift * (1 - fade)}px,0)`;
}

function heroFrameSrc(index: number) {
  return `/hero/frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

export interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc?: string;
  posterSrc?: string;
  scrollToExpand?: string;
  children?: ReactNode;
  actions?: ReactNode;
  scrubVideo?: boolean;
  audioSrc?: string;
}

export function ScrollExpandMedia({
  mediaType = "video",
  mediaSrc = HERO_VIDEO_1080,
  posterSrc = HERO_POSTER_2K,
  scrollToExpand = "Scroll to assemble",
  children,
  actions,
  scrubVideo = true,
  audioSrc = HERO_AUDIO,
}: ScrollExpandMediaProps) {
  const [showContent, setShowContent] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const sequenceCompleteRef = useRef(false);
  const touchStartYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const showContentRef = useRef(false);

  const frameCacheRef = useRef<HTMLImageElement[]>([]);
  const displayedFrameRef = useRef(-1);
  const activeBufferRef = useRef<0 | 1>(0);

  const posterRef = useRef<HTMLImageElement>(null);
  const bufferARef = useRef<HTMLImageElement>(null);
  const bufferBRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioReadyRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const pendingAudioProgressRef = useRef<number | null>(null);
  const useFrameScrub = mediaType === "video" && scrubVideo;
  const useScrollAudio = useFrameScrub && Boolean(audioSrc);

  const markAudioReady = () => {
    const audio = audioRef.current;
    if (!audio || audioReadyRef.current) return;

    if (
      audio.readyState >= HTMLMediaElement.HAVE_METADATA &&
      audio.duration &&
      Number.isFinite(audio.duration)
    ) {
      audioReadyRef.current = true;
      const pending =
        pendingAudioProgressRef.current ?? progressRef.current;
      if (pending > 0) {
        pendingAudioProgressRef.current = null;
        syncAudio(pending);
      }
    }
  };

  const unlockAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !useScrollAudio || audioUnlockedRef.current) {
      return audioUnlockedRef.current;
    }

    try {
      const previousVolume = audio.volume;
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = previousVolume;
      audioUnlockedRef.current = true;
      return true;
    } catch {
      return false;
    }
  };

  const syncAudio = (progress: number) => {
    const audio = audioRef.current;
    if (!audio || !useScrollAudio || reducedMotionRef.current) return;

    if (progress <= 0) {
      pendingAudioProgressRef.current = null;
      audio.pause();
      if (audio.currentTime > 0) audio.currentTime = 0;
      return;
    }

    if (!audioReadyRef.current) {
      pendingAudioProgressRef.current = progress;
      return;
    }

    const duration = audio.duration;
    if (!duration || !Number.isFinite(duration)) {
      pendingAudioProgressRef.current = progress;
      return;
    }

    pendingAudioProgressRef.current = null;
    const targetTime = Math.min(progress * duration, duration - 0.01);

    void (async () => {
      if (!audioUnlockedRef.current) {
        await unlockAudio();
      }

      try {
        if (audio.paused) {
          await audio.play();
        }
        if (Math.abs(audio.currentTime - targetTime) > 0.04) {
          audio.currentTime = targetTime;
        }
      } catch {
        pendingAudioProgressRef.current = progress;
      }
    })();
  };

  const swapToFrame = (frameIndex: number) => {
    if (frameIndex === displayedFrameRef.current) return;

    const cached = frameCacheRef.current[frameIndex];
    const inactive =
      activeBufferRef.current === 0
        ? bufferBRef.current
        : bufferARef.current;
    const active =
      activeBufferRef.current === 0
        ? bufferARef.current
        : bufferBRef.current;
    if (!cached || !inactive || !active) return;

    const commit = () => {
      if (cached.naturalWidth === 0) return;
      inactive.src = cached.src;
      inactive.style.opacity = "1";
      active.style.opacity = "0";
      activeBufferRef.current = activeBufferRef.current === 0 ? 1 : 0;
      displayedFrameRef.current = frameIndex;
    };

    if (cached.complete) {
      commit();
      return;
    }

    const onLoad = () => {
      cached.removeEventListener("load", onLoad);
      commit();
    };
    cached.addEventListener("load", onLoad);
  };

  const applyVisuals = () => {
    const progress = progressRef.current;

    if (useFrameScrub) {
      const frameIndex = Math.round(progress * (HERO_FRAME_COUNT - 1));
      swapToFrame(frameIndex);
    } else {
      const video = videoRef.current;
      if (video?.duration && Number.isFinite(video.duration)) {
        const frameDuration = 1 / 24;
        const targetTime = progress * video.duration;
        const quantized =
          Math.round(targetTime / frameDuration) * frameDuration;
        if (Math.abs(video.currentTime - quantized) >= frameDuration * 0.5) {
          video.pause();
          video.currentTime = Math.min(quantized, video.duration - 0.001);
        }
      }
    }

    if (hintRef.current) {
      const hintOpacity = Math.max(0, 1 - progress * 1.2);
      hintRef.current.style.opacity = String(hintOpacity);
      hintRef.current.style.visibility =
        progress < 0.92 && hintOpacity > 0.01 ? "visible" : "hidden";
    }

    if (copyRef.current) {
      const chunks = copyRef.current.querySelectorAll<HTMLElement>(
        "[data-hero-copy]"
      );
      chunks.forEach((el, index) =>
        applyHeroCopyChunkFade(el, progress, index)
      );
    }

    syncAudio(progress);
  };

  const scheduleVisuals = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyVisuals();
    });
  };

  const updateProgress = (next: number) => {
    progressRef.current = next;
    scheduleVisuals();

    if (next >= 1) {
      if (!sequenceCompleteRef.current) sequenceCompleteRef.current = true;
      if (!showContentRef.current) {
        showContentRef.current = true;
        setShowContent(true);
      }
    } else if (next < 0.75 && showContentRef.current) {
      showContentRef.current = false;
      setShowContent(false);
    }
  };

  useEffect(() => {
    if (!useFrameScrub) return;

    const cache = Array.from({ length: HERO_FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = heroFrameSrc(i);
      return img;
    });
    frameCacheRef.current = cache;

    const prime = bufferARef.current;
    if (prime) {
      const showFirst = () => {
        if (cache[0]?.complete) {
          prime.src = cache[0].src;
          displayedFrameRef.current = 0;
        }
      };
      if (cache[0]?.complete) showFirst();
      else cache[0]?.addEventListener("load", showFirst, { once: true });
    }
  }, [useFrameScrub]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const reduced = mq.matches;
      reducedMotionRef.current = reduced;
      setReducedMotion(reduced);
      if (reduced) {
        audioRef.current?.pause();
        progressRef.current = 1;
        sequenceCompleteRef.current = true;
        showContentRef.current = true;
        setShowContent(true);
        displayedFrameRef.current = -1;
        applyVisuals();
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const restoreY = peekHomeScrollRestore();
    if (restoreY === null || restoreY <= 0) return;

    if (window.scrollY > 100) {
      clearHomeScrollRestore();
      return;
    }

    clearHomeScrollRestore();

    progressRef.current = 1;
    sequenceCompleteRef.current = true;
    showContentRef.current = true;
    setShowContent(true);
    pendingAudioProgressRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    applyVisuals();

    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const restoreScroll = () => {
      window.scrollTo(0, restoreY);
    };

    restoreScroll();
    requestAnimationFrame(() => {
      restoreScroll();
      requestAnimationFrame(() => {
        restoreScroll();
        html.style.scrollBehavior = previousScrollBehavior;
      });
    });
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const handleWheel = (e: globalThis.WheelEvent) => {
      void unlockAudio();

      if (
        sequenceCompleteRef.current &&
        e.deltaY < 0 &&
        window.scrollY <= 5
      ) {
        sequenceCompleteRef.current = false;
        e.preventDefault();
      } else if (!sequenceCompleteRef.current) {
        e.preventDefault();
        const next = Math.min(
          Math.max(progressRef.current + e.deltaY * WHEEL_STEP, 0),
          1
        );
        updateProgress(next);
      }
    };

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      void unlockAudio();
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      const touchStartY = touchStartYRef.current;
      if (!touchStartY) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (
        sequenceCompleteRef.current &&
        deltaY < -20 &&
        window.scrollY <= 5
      ) {
        sequenceCompleteRef.current = false;
        e.preventDefault();
      } else if (!sequenceCompleteRef.current) {
        e.preventDefault();
        const factor = deltaY < 0 ? TOUCH_DRAG_UP : TOUCH_DRAG_DOWN;
        const next = Math.min(
          Math.max(progressRef.current + deltaY * factor, 0),
          1
        );
        updateProgress(next);
        touchStartYRef.current = touchY;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = 0;
    };

    const handleScroll = () => {
      if (!sequenceCompleteRef.current) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !useScrollAudio) return;

    audioReadyRef.current = false;
    audioUnlockedRef.current = false;
    pendingAudioProgressRef.current = null;
    audio.preload = "auto";
    audio.load();

    const readyEvents = [
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
    ] as const;

    readyEvents.forEach((event) => {
      audio.addEventListener(event, markAudioReady);
    });

    markAudioReady();
    void fetch(audioSrc).catch(() => {});

    return () => {
      readyEvents.forEach((event) => {
        audio.removeEventListener(event, markAudioReady);
      });
    };
  }, [useScrollAudio, audioSrc]);

  useEffect(() => {
    applyVisuals();
  }, [useFrameScrub, mediaSrc]);

  const heroMediaClass =
    "absolute inset-0 h-full w-full object-cover max-md:scale-[0.94] max-md:object-[center_58%] md:object-[center_42%]";

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] overflow-x-hidden bg-[#050505] md:overflow-hidden md:bg-transparent"
    >
      {useScrollAudio && (
        <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" />
      )}
      <div className="pointer-events-none absolute inset-x-0 z-0 max-md:top-11 max-md:h-[72dvh] md:inset-0 md:top-0 md:h-full">
        <div className="absolute inset-0 overflow-hidden bg-[#050505] md:overflow-visible">
          <div className="absolute left-1/2 top-0 h-full w-[112vw] -translate-x-1/2 md:inset-0 md:w-full md:translate-x-0">
            {mediaType === "video" ? (
              useFrameScrub ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={posterRef}
                    src={posterSrc}
                    alt=""
                    className={heroMediaClass}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={bufferARef}
                    alt=""
                    decoding="sync"
                    className={`${heroMediaClass} opacity-100`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={bufferBRef}
                    alt=""
                    decoding="sync"
                    className={`${heroMediaClass} opacity-0`}
                  />
                </>
              ) : (
                <video
                  ref={videoRef}
                  src={mediaSrc}
                  poster={posterSrc}
                  muted
                  playsInline
                  preload="auto"
                  className={heroMediaClass}
                />
              )
            ) : (
              <Image
                src={mediaSrc}
                alt=""
                width={2560}
                height={1440}
                className={heroMediaClass}
                priority
              />
            )}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/25 via-transparent to-[#050505]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050505_100%)] opacity-55" />
      </div>

      {/* Mobile: block parallax streams behind hero copy */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[62dvh] z-[1] md:hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,transparent_0%,#050505_72%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/55 via-[#050505]/94 to-[#050505]" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 pb-10 md:block md:px-0 md:pb-0">
        {scrollToExpand && !reducedMotion && (
          <p
            ref={hintRef}
            className="type-eyebrow pointer-events-none absolute left-4 right-4 top-[64dvh] text-center text-white/35 md:inset-x-10 md:top-[54vh]"
          >
            {scrollToExpand}
          </p>
        )}

        <div
          ref={copyRef}
          className="mx-auto mt-[68dvh] w-full max-w-[42rem] px-1 text-center md:absolute md:inset-x-10 md:top-[62vh] md:mt-0 md:max-w-5xl"
        >
          {children}
          {actions && (
            <motion.div
              className="mt-3 flex flex-col items-center justify-center gap-2.5 sm:mt-7 sm:flex-row sm:gap-4 md:mt-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: showContent ? 1 : 0,
                y: showContent ? 0 : 12,
              }}
              transition={{ duration: 0.5 }}
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ScrollExpandMedia;