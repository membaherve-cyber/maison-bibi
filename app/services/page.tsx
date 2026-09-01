import type { Metadata } from "next";
import { ServicesView } from "@/components/ServicesView";

export const metadata: Metadata = {
  title: "Services immobiliers à Douala — vente, location, gestion locative",
  description:
    "La Maison Bibi accompagne propriétaires, locataires et investisseurs à Douala : vente, location, gestion locative, conseil en investissement et sécurisation juridique.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <ServicesView />;
}
