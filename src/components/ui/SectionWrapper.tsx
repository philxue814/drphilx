import { ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  priority?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className = "",
  priority = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`relative px-6 ${
        priority ? "py-36 md:py-52" : "py-28 md:py-40"
      } md:px-10 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}