"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 md:px-6 md:pt-6">
      <nav
        className={`flex w-full max-w-4xl items-center justify-between rounded-full border px-6 py-3 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-[#050505]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            : "border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
        }`}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-[-0.02em] text-white transition-colors hover:text-accent"
        >
          Dr Phil <span className="text-accent">X</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer text-sm text-white/50 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="#contact"
          className="btn-shimmer btn-shimmer--primary px-4 py-2 text-xs font-medium shadow-[0_4px_20px_rgba(196,30,58,0.25)] hover:shadow-[0_4px_20px_rgba(196,30,58,0.35)]"
        >
          <span className="shrink-0">Get in Touch</span>
        </Link>
      </nav>
    </header>
  );
}