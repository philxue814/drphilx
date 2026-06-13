import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { WorkGalleryMobileChapters } from "@/components/sections/WorkGalleryMobileChapters";
import { WorkGalleryDesktop } from "@/components/sections/WorkGalleryDesktop";

export function WorkGallery() {
  return (
    <SectionWrapper
      id="work"
      priority
      className="py-24 md:py-48 lg:py-52"
    >
      <div className="md:hidden">
        <p className="type-eyebrow text-accent/90">Proof of Work</p>
        <h2 className="type-display mt-5 text-3xl text-white md:text-4xl">
          Systems I&apos;ve built
        </h2>
        <p className="type-body mt-4 text-muted">
          Real projects solving real bottlenecks, in my own businesses first.
        </p>
        <div className="mt-10">
          <WorkGalleryMobileChapters />
        </div>
      </div>

      <WorkGalleryDesktop />
    </SectionWrapper>
  );
}