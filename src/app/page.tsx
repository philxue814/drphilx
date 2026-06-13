import { Nav } from "@/components/Nav";
import { ScrollBackground } from "@/components/ScrollBackground";
import { Hero } from "@/components/sections/Hero";
import { WorkGallery } from "@/components/sections/WorkGallery";
import { Services } from "@/components/sections/Services";
import { HowIHelp } from "@/components/sections/HowIHelp";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <ScrollBackground />
      <main className="relative z-10 w-full max-w-full overflow-x-hidden">
        <Nav />
        <Hero />
        <WorkGallery />
        <Services />
        <HowIHelp />
        <About />
        <Contact />
        <Footer />
      </main>
    </>
  );
}