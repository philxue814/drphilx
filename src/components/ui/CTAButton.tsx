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
    "btn-shimmer group gap-2 px-4 py-2 text-xs font-medium md:gap-3 md:px-6 md:py-3 md:text-sm";

  const styles =
    variant === "primary"
      ? "btn-shimmer--primary shadow-[0_4px_24px_rgba(196,30,58,0.25)] hover:shadow-[0_4px_32px_rgba(196,30,58,0.35)]"
      : "btn-shimmer--secondary";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span className="shrink-0">{children}</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-8 md:w-8">
        <ArrowUpRight
          size={14}
          weight="light"
          className="max-md:scale-[0.85]"
        />
      </span>
    </Link>
  );
}