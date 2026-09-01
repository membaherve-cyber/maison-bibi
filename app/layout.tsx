import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BibiAssistant } from "@/components/BibiAssistant";
import { PwaRegister } from "@/components/PwaRegister";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default:
      "La Maison Bibi — Agence immobilière premium à Douala, Cameroun",
    template: "%s | La Maison Bibi",
  },
  description:
    "Villas, appartements, immeubles, bureaux et entrepôts à vendre et à louer à Douala : Bonapriso, Bonanjo, Akwa, Bonabéri, Yassa, et à Yaoundé. Biens vérifiés, accompagnement premium.",
  keywords: [
    "immobilier Douala",
    "villa à vendre Douala",
    "appartement à louer Akwa",
    "immobilier Bonapriso",
    "immobilier Bonanjo",
    "entrepôt Bonabéri",
    "entrepôt Bonanjo",
    "bureau Bali",
    "immobilier Logpom",
    "immobilier Youpwe",
    "maison Yassa",
    "immobilier Cameroun",
    "immobilier Yaoundé Bastos",
    "agence immobilière Littoral",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "fr_CM",
    siteName: site.name,
    title: "La Maison Bibi — Immobilier premium à Douala",
    description:
      "Trouvez la propriété qui correspond à vos projets à Douala et au Cameroun.",
    images: ["/images/hero-douala.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Maison Bibi — Immobilier premium à Douala",
    description:
      "Villas, appartements et espaces professionnels vérifiés à Douala et au Cameroun.",
    images: ["/images/hero-douala.jpg"],
  },
  icons: { icon: "/logo-mark.svg" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Parisienne&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-slate-deep antialiased">
        <I18nProvider>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-deep"
          >
            Aller au contenu
          </a>
          <Header />
          <main id="contenu" className="flex-1">{children}</main>
          <Footer />
          <BibiAssistant />
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
