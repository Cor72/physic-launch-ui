import CTA from "../components/sections/cta/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Items from "../components/sections/items/default";
import Logos from "../components/sections/logos/default";
import Navbar from "../components/sections/navbar/default";
import Pricing from "../components/sections/pricing/default";
import Stats from "../components/sections/stats/default";

export default function Home() {
  return (
    /* All sections share a white theme. overflow-x-clip keeps the FAQ rail sticky. */
    <main
      id="home"
      className="bg-background text-foreground min-h-[100dvh] w-full overflow-x-clip pb-2 sm:pb-3"
    >
      <Navbar />
      <Hero />
      <Logos />
      <Stats />
      <Items />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
