import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact — Javi Villalba Soler",
  description:
    "Start a project with Javi Villalba Soler — video direction, editing, color and motion.",
};

export default function ContactPage() {
  return <ContactContent />;
}
