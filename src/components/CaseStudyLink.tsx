"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { saveHomeScrollPosition } from "@/lib/home-scroll-restore";

type CaseStudyLinkProps = ComponentProps<typeof Link>;

export function CaseStudyLink({ onClick, ...props }: CaseStudyLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        saveHomeScrollPosition();
        onClick?.(event);
      }}
    />
  );
}