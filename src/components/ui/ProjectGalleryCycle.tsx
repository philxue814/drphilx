"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";
import {
  getProjectGalleryImages,
  getProjectGalleryLayout,
  type ImageSurface,
} from "@/lib/project-media";

const CYCLE_MS = 4200;

interface ProjectGalleryCycleProps {
  project: Project;
  surface?: ImageSurface;
  compact?: boolean;
  minor?: boolean;
  className?: string;
}

function stackDepth(index: number, active: number, total: number) {
  return (index - active + total) % total;
}

function getStackTransform(
  depth: number,
  surface: ImageSurface,
  options: { compact: boolean; minor: boolean }
) {
  if (depth === 0) {
    return { x: 0, y: 0, scale: 1, opacity: 1 };
  }

  const { compact, minor } = options;

  const presets =
    surface === "detail"
      ? [
          { x: 0, y: 0, scale: 1, opacity: 1 },
          { x: 10, y: 14, scale: 0.96, opacity: 0.94 },
          { x: 18, y: 24, scale: 0.92, opacity: 0.84 },
          { x: 24, y: 32, scale: 0.88, opacity: 0.72 },
        ]
      : minor
        ? [
            { x: 0, y: 0, scale: 1, opacity: 1 },
            { x: 4, y: 6, scale: 0.95, opacity: 0.88 },
            { x: 7, y: 10, scale: 0.91, opacity: 0.72 },
            { x: 10, y: 13, scale: 0.88, opacity: 0.58 },
          ]
        : compact
          ? [
              { x: 0, y: 0, scale: 1, opacity: 1 },
              { x: 6, y: 9, scale: 0.94, opacity: 0.9 },
              { x: 10, y: 14, scale: 0.89, opacity: 0.74 },
              { x: 13, y: 18, scale: 0.86, opacity: 0.6 },
            ]
          : [
              { x: 0, y: 0, scale: 1, opacity: 1 },
              { x: 8, y: 12, scale: 0.93, opacity: 0.92 },
              { x: 14, y: 20, scale: 0.88, opacity: 0.78 },
              { x: 18, y: 26, scale: 0.84, opacity: 0.64 },
            ];

  return presets[Math.min(depth, presets.length - 1)];
}

function getStackShadow(depth: number, surface: ImageSurface) {
  if (surface === "detail") {
    if (depth === 0) {
      return "0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)";
    }
    if (depth === 1) {
      return "0 18px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)";
    }
    return "0 10px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)";
  }

  if (depth === 0) {
    return "0 22px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)";
  }
  if (depth === 1) {
    return "0 14px 32px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.05)";
  }
  return "0 8px 20px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.04)";
}

function getDetailFrameClass(layout: ReturnType<typeof getProjectGalleryLayout>) {
  switch (layout) {
    case "vertical":
      return "mx-auto mb-10 aspect-[9/16] w-full max-w-[300px] sm:max-w-[320px]";
    case "contain":
      return "mx-auto mb-10 aspect-[3/4] w-full max-w-md";
    default:
      return "mx-auto mb-10 aspect-[16/10] w-full max-w-2xl";
  }
}

export function ProjectGalleryCycle({
  project,
  surface = "detail",
  compact = false,
  minor = false,
  className = "",
}: ProjectGalleryCycleProps) {
  const images = getProjectGalleryImages(project);
  const layout = getProjectGalleryLayout(project);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  if (images.length === 0) return null;

  const isDetail = surface === "detail";
  const objectFit = layout === "contain" ? "object-contain" : "object-cover";

  const insetClass = isDetail
    ? "inset-[5%_7%_9%_3%]"
    : surface === "mobile"
      ? minor
        ? "inset-[10%_12%_14%_8%]"
        : "inset-[8%_10%_12%_6%]"
      : compact
        ? "inset-[10%_14%_16%_8%]"
        : "inset-[9%_11%_14%_7%]";

  const advance = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div
      className={`relative ${
        isDetail
          ? getDetailFrameClass(layout)
          : `absolute inset-0 ${className}`
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <button
        type="button"
        aria-label={`Cycle project photos, showing ${activeIndex + 1} of ${images.length}`}
        className={`relative h-full w-full ${isDetail ? "cursor-pointer" : "pointer-events-none"}`}
        onClick={isDetail ? advance : undefined}
      >
        <div className={`absolute ${insetClass}`} aria-live="polite">
          {images.map((src, index) => {
            const depth = stackDepth(index, activeIndex, images.length);
            const transform = getStackTransform(depth, surface, {
              compact,
              minor,
            });
            const zIndex = images.length - depth;

            return (
              <div
                key={src}
                aria-hidden={depth !== 0}
                className="absolute inset-0 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#050505] transition-[transform,opacity,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                style={{
                  transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
                  opacity: transform.opacity,
                  zIndex,
                  boxShadow: getStackShadow(depth, surface),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className={`h-full w-full ${objectFit}`}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </button>
    </div>
  );
}