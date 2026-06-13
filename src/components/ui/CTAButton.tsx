import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function CTAButton({
  href,
  children,
  variant = "primary",
}: CTAButtonProps) {
  const base =
    "btn-shimmer group gap-3 px-6 py-3 text-sm font-medium";

  const styles =
    variant === "primary"
      ? "btn-shimmer--primary shadow-[0_4px_24px_rgba(196,30,58,0.25)] hover:shadow-[0_4px_32px_rgba(196,30,58,0.35)]"
      : "btn-shimmer--secondary";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span className="shrink-0">{children}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight size={14} weight="light" />
      </span>
    </Link>
  );
}