import type { Metadata } from "next";
import StudioContent from "@/components/studio/StudioContent";

export const metadata: Metadata = {
  title: "Studio — Javi Villalba Soler",
  description:
    "Independent video director and editor based in Madrid. Approach, capabilities and recognitions.",
};

export default function StudioPage() {
  return <StudioContent />;
}
