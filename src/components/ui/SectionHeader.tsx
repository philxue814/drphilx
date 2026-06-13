interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  priority?: boolean;
  centered?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  priority = false,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-8 md:mb-16 ${priority ? "md:mb-20" : ""} ${
        centered ? "mx-auto text-center" : "max-w-3xl"
      }`}
    >
      {label && (
        <p className="type-eyebrow mb-4 text-accent/90">{label}</p>
      )}
      <h2
        className={`type-display text-white ${
          priority
            ? "text-4xl md:text-5xl lg:text-6xl"
            : "text-3xl md:text-4xl lg:text-[2.75rem]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`type-body-lg mt-4 text-muted md:mt-6 ${
            centered ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}