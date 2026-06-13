"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

export function BackToWorkLink() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/#work");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-12 inline-flex cursor-pointer items-center gap-2 text-sm text-muted transition-colors hover:text-white"
    >
      <ArrowLeft size={16} weight="light" />
      Back to Work
    </button>
  );
}