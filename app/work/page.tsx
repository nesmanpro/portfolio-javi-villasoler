import type { Metadata } from "next";
import WorkIndex from "@/components/work/WorkIndex";

export const metadata: Metadata = {
  title: "Work — Javi Villasoler",
  description:
    "Selected films: brand films, music videos, commercials and documentaries.",
};

export default function WorkPage() {
  return <WorkIndex />;
}
