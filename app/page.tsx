import { HomeSessionGate } from "../components/auth/home-session-gate";
import CTA from "../components/sections/cta/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Items from "../components/sections/items/default";
import Logos from "../components/sections/logos/default";
import Navbar from "../components/sections/navbar/default";
import Pricing from "../components/sections/pricing/default";
import Stats from "../components/sections/stats/default";
import { LayoutLines } from "../components/ui/layout-lines";

export default function Home() {
  return (
    <HomeSessionGate>
      <main
        id="home"
        className="bg-background text-foreground min-h-[100dvh] w-full"
      >
        <LayoutLines />
        <Navbar />
        <Hero />
        <Logos />
        <Items />
        <Stats />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </HomeSessionGate>
  );
}
