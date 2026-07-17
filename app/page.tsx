import HomeHero from "@/components/home/HomeHero";
import Showreel from "@/components/home/Showreel";
import Claim from "@/components/home/Claim";
// About/Intro section parked for a future redesign — re-enable by
// uncommenting the import and the <Intro /> line below.
// import Intro from "@/components/home/Intro";
import SelectedWorks from "@/components/home/SelectedWorks";
import Services from "@/components/home/Services";
import Clients from "@/components/home/Clients";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Showreel />
      <Claim />
      {/* <Intro /> */}
      <SelectedWorks />
      <Services />
      <Clients />
    </>
  );
}
