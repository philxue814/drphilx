"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  clearHomeScrollRestore,
  peekHomeScrollRestore,
} from "@/lib/home-scroll-restore";
import { setHeroScrollLocked } from "@/lib/hero-scroll-lock";

const HERO_VIDEO_1080 = "/hero/hero-video-1080.mp4";
const HERO_POSTER_2K = "/hero/hero-poster-2k.webp";
const HERO_POSTER_VERTICAL = "/hero/frames-vertical/frame_0001.jpg";
const HERO_AUDIO = "/hero/hero-audio.m4a";
const HERO_FRAME_COUNT = 145;
const MOBILE_BREAKPOINT = "(max-width: 767px)";
const WHEEL_STEP = 0.0003;
const TOUCH_DRAG_UP = 0.008 / 3;
const TOUCH_DRAG_DOWN = 0.005 / 3;
const HERO_COPY_FADE_END = 0.72;
const HERO_COPY_CHUNK_BASE_START = 0.22;
const HERO_COPY_CHUNK_STAGGER = 0.12;
const HERO_COPY_CHUNK_SPAN = 0.35;

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

function heroFrameSrc(index: number, vertical: boolean) {
  const folder = vertical ? "frames-vertical" : "frames";
  return `/hero/${folder}/frame_${String(index + 1).padStart(4, "0")}.jpg`;
}

function readMobileHeroViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
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
  const [useVerticalFrames, setUseVerticalFrames] = useState(
    readMobileHeroViewport
  );
  const useVerticalFramesRef = useRef(useVerticalFrames);

  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const sequenceCompleteRef = useRef(false);
  const touchStartYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const showContentRef = useRef(false);

  const frameCacheRef = useRef<HTMLImageElement[]>([]);
  const displayedFrameRef = useRef(-1);
  const activeBufferRef = useRef<0 | 1>(0);

  const bufferAMobileRef = useRef<HTMLImageElement>(null);
  const bufferBMobileRef = useRef<HTMLImageElement>(null);
  const bufferADesktopRef = useRef<HTMLImageElement>(null);
  const bufferBDesktopRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioReadyRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const unlockInFlightRef = useRef<Promise<boolean> | null>(null);
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
        syncAudio(pending);
      }
    }
  };

  const unlockAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !useScrollAudio || audioUnlockedRef.current) {
      return audioUnlockedRef.current;
    }

    if (!audioReadyRef.current) {
      return false;
    }

    const previousVolume = audio.volume;

    try {
      const pendingProgress =
        pendingAudioProgressRef.current ?? progressRef.current;
      audio.volume = 0;

      if (
        pendingProgress > 0 &&
        audio.duration &&
        Number.isFinite(audio.duration)
      ) {
        audio.currentTime = Math.min(
          pendingProgress * audio.duration,
          audio.duration - 0.01
        );
      }

      await audio.play();
      audio.pause();
      audioUnlockedRef.current = true;
      return true;
    } catch {
      return false;
    } finally {
      audio.volume = previousVolume;
    }
  };

  const ensureAudioUnlocked = () => {
    if (audioUnlockedRef.current) {
      return Promise.resolve(true);
    }

    if (!unlockInFlightRef.current) {
      unlockInFlightRef.current = unlockAudio().finally(() => {
        unlockInFlightRef.current = null;
      });
    }

    return unlockInFlightRef.current;
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

    const targetTime = Math.min(progress * duration, duration - 0.01);

    void (async () => {
      const unlocked = await ensureAudioUnlocked();
      if (!unlocked) {
        pendingAudioProgressRef.current = progress;
        return;
      }

      pendingAudioProgressRef.current = null;

      try {
        if (Math.abs(audio.currentTime - targetTime) > 0.04) {
          audio.currentTime = targetTime;
        }
        if (audio.paused) {
          await audio.play();
        }
      } catch {
        pendingAudioProgressRef.current = progress;
      }
    })();
  };

  const getActiveBuffers = () => {
    const vertical = useVerticalFramesRef.current;
    return {
      bufferA: vertical ? bufferAMobileRef.current : bufferADesktopRef.current,
      bufferB: vertical ? bufferBMobileRef.current : bufferBDesktopRef.current,
    };
  };

  const swapToFrame = (frameIndex: number) => {
    if (frameIndex === displayedFrameRef.current) return;

    const cached = frameCacheRef.current[frameIndex];
    const { bufferA, bufferB } = getActiveBuffers();
    const inactive = activeBufferRef.current === 0 ? bufferB : bufferA;
    const active = activeBufferRef.current === 0 ? bufferA : bufferB;
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

  const syncHeroScrollLock = () => {
    if (reducedMotionRef.current) {
      setHeroScrollLocked(false);
      return;
    }
    setHeroScrollLocked(!sequenceCompleteRef.current);
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
      setHeroScrollLocked(false);
    } else if (next < 0.75 && showContentRef.current) {
      showContentRef.current = false;
      setShowContent(false);
    }

    if (next < 1) {
      syncHeroScrollLock();
    }
  };

  useEffect(() => {
    useVerticalFramesRef.current = useVerticalFrames;
  }, [useVerticalFrames]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    const sync = () => {
      const mobile = mq.matches;
      useVerticalFramesRef.current = mobile;
      setUseVerticalFrames(mobile);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!useFrameScrub) return;

    const vertical = readMobileHeroViewport();
    useVerticalFramesRef.current = vertical;
    displayedFrameRef.current = -1;
    activeBufferRef.current = 0;

    const cache = Array.from({ length: HERO_FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = heroFrameSrc(i, vertical);
      return img;
    });
    frameCacheRef.current = cache;

    const { bufferA, bufferB } = getActiveBuffers();
    if (bufferB) {
      bufferB.style.opacity = "0";
      bufferB.removeAttribute("src");
    }

    if (bufferA) {
      const showFirst = () => {
        if (!cache[0]?.complete) return;
        bufferA.src = cache[0].src;
        bufferA.style.opacity = "1";
        displayedFrameRef.current = 0;
      };
      if (cache[0]?.complete) showFirst();
      else cache[0]?.addEventListener("load", showFirst, { once: true });
    }

    applyVisuals();
  }, [useFrameScrub, useVerticalFrames, posterSrc]);

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
        setHeroScrollLocked(false);
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
    setHeroScrollLocked(false);
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

    syncHeroScrollLock();

    const handleWheel = (e: globalThis.WheelEvent) => {
      void ensureAudioUnlocked();

      if (
        sequenceCompleteRef.current &&
        e.deltaY < 0 &&
        window.scrollY <= 5
      ) {
        sequenceCompleteRef.current = false;
        syncHeroScrollLock();
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
      void ensureAudioUnlocked();
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
        syncHeroScrollLock();
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

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      setHeroScrollLocked(false);
      window.removeEventListener("wheel", handleWheel);
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
    unlockInFlightRef.current = null;
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
    "absolute inset-0 h-full w-full object-contain object-center md:object-cover md:object-[center_42%]";

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden bg-[#050505] md:bg-transparent"
    >
      {useScrollAudio && (
        <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" />
      )}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 h-full w-full">
            {mediaType === "video" ? (
              useFrameScrub ? (
                <>
                  <div className="absolute inset-0 md:hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={HERO_POSTER_VERTICAL}
                      alt=""
                      fetchPriority="high"
                      className={heroMediaClass}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={bufferAMobileRef}
                      src={HERO_POSTER_VERTICAL}
                      alt=""
                      decoding="sync"
                      fetchPriority="high"
                      className={`${heroMediaClass} opacity-100`}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={bufferBMobileRef}
                      alt=""
                      decoding="sync"
                      className={`${heroMediaClass} opacity-0`}
                    />
                  </div>
                  <div className="absolute inset-0 hidden md:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterSrc}
                      alt=""
                      className={heroMediaClass}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={bufferADesktopRef}
                      src={posterSrc}
                      alt=""
                      decoding="sync"
                      className={`${heroMediaClass} opacity-100`}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={bufferBDesktopRef}
                      alt=""
                      decoding="sync"
                      className={`${heroMediaClass} opacity-0`}
                    />
                  </div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-transparent to-[#050505]/70 max-md:from-[#050505]/35 max-md:to-[#050505]/90 md:from-[#050505]/25 md:to-[#050505]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050505_100%)] opacity-15 md:opacity-55" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-4 pb-10 md:block md:px-0 md:pb-0">
        {scrollToExpand && !reducedMotion && (
          <p
            ref={hintRef}
            className="type-eyebrow pointer-events-none mb-3 text-center text-white/35 md:absolute md:inset-x-10 md:bottom-auto md:top-[54vh] md:mb-0"
          >
            {scrollToExpand}
          </p>
        )}

        <div
          ref={copyRef}
          className="mx-auto w-full max-w-[42rem] px-1 text-center md:absolute md:inset-x-10 md:top-[62vh] md:max-w-5xl"
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