type LogoSurface = "card" | "mobile" | "hero";
type CardVariant = "featured" | "standard" | "compact";

const logoHeight: Record<LogoSurface, string> = {
  card: "max-h-[88px] md:max-h-[100px]",
  mobile: "max-h-[108px]",
  hero: "max-h-16 md:max-h-20",
};

const featuredLogoHeight = "max-h-[120px] md:max-h-[150px]";
const compactLogoHeight = "max-h-[72px]";

function getLogoFadeClasses(
  surface: LogoSurface,
  variant: CardVariant,
  minor = false
): string {
  if (surface === "mobile") {
    return `mix-blend-luminosity contrast-125 ${
      minor ? "opacity-15" : "opacity-25"
    }`;
  }

  if (surface === "hero") {
    return "mix-blend-luminosity contrast-125 opacity-30";
  }

  const opacity = variant === "compact" ? "opacity-20" : "opacity-30";
  return `mix-blend-luminosity contrast-125 ${opacity} transition-transform duration-700 ease-out group-hover:scale-105`;
}

export function ProjectLogoStrip({
  logos,
  surface = "card",
  variant = "standard",
  minor = false,
}: {
  logos: string[];
  surface?: LogoSurface;
  variant?: CardVariant;
  minor?: boolean;
}) {
  const heightClass =
    surface === "card" && variant === "featured"
      ? featuredLogoHeight
      : surface === "card" && variant === "compact"
        ? compactLogoHeight
        : logoHeight[surface];

  const fadeClass = getLogoFadeClasses(surface, variant, minor);

  const containerClass =
    surface === "hero"
      ? "flex items-center justify-center gap-5 py-6 md:gap-8 md:py-8"
      : "absolute inset-0 flex items-center justify-center gap-3 p-3 md:gap-5 md:p-4";

  return (
    <div className={containerClass}>
      {logos.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`w-auto max-w-[28%] shrink-0 object-contain ${heightClass} ${fadeClass}`}
        />
      ))}
    </div>
  );
}