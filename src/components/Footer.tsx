import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-semibold text-white">
            Dr Phil <span className="text-accent">X</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Custom AI automation for business bottlenecks
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/40">
          <Link href="#work" className="cursor-pointer transition-colors hover:text-white">
            Work
          </Link>
          <Link href="#services" className="cursor-pointer transition-colors hover:text-white">
            Services
          </Link>
          <Link href="#contact" className="cursor-pointer transition-colors hover:text-white">
            Contact
          </Link>
        </div>
        <p className="text-sm text-white/25">
          &copy; {new Date().getFullYear()} DrPhilX.com
        </p>
      </div>
    </footer>
  );
}