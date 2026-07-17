"use client";

import Marquee from "@/components/Marquee";
import SplitReveal from "@/components/SplitReveal";
import { useMarqueeContent } from "@/hooks/useContent";

export default function Clients() {
  const { data: marquee } = useMarqueeContent();

  return (
    <section data-theme-section="light" className="py-[14vh] overflow-hidden">
      <div className="px-[4vw] mb-10">
        <SplitReveal as="p" className="label-mono opacity-50">
          {marquee.sectionLabel}
        </SplitReveal>
      </div>
      <Marquee
        items={marquee.clientNames}
        durationSeconds={marquee.scrollDurationSeconds}
      />
    </section>
  );
}
