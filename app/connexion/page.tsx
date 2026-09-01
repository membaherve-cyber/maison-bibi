import type { Metadata } from "next";
import { LoginView } from "@/components/LoginView";

export const metadata: Metadata = {
  title: "Connexion au backoffice",
  description: "Espace réservé à l'équipe La Maison Bibi.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginView />;
}
