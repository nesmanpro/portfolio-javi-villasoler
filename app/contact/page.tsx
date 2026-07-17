import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact — Javi Villasoler",
  description:
    "Start a project with Javi Villasoler — video direction, editing, color and motion.",
};

export default function ContactPage() {
  return <ContactContent />;
}
