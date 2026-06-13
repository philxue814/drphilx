import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-px shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-all duration-300 hover:border-accent/25 hover:shadow-[0_8px_40px_rgba(196,30,58,0.08)] ${className}`}
    >
      <div className="rounded-[calc(1rem-1px)] bg-[#0a0a0a]/80">
        {children}
      </div>
    </div>
  );
}