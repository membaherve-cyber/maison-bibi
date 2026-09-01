import type { Metadata } from "next";
import { ContactView } from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact — La Maison Bibi, agence immobilière à Douala",
  description:
    "Contactez La Maison Bibi à Douala : téléphone, WhatsApp, email lamaisonbibi@gmail.com. Nous répondons sous 24 h ouvrées pour vos projets d'achat, de location ou de gestion.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactView />;
}
