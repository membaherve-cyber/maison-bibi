import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { getAllProperties } from "@/lib/properties";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title:
    "La Maison Bibi — Immobilier premium à Douala : villas, appartements, bureaux",
  description:
    "Trouvez la propriété qui correspond à vos projets. Villas, appartements, immeubles et entrepôts à vendre et à louer à Douala (Bonapriso, Bonanjo, Akwa, Bonabéri, Yassa) et à Yaoundé.",
  alternates: { canonical: "/" },
};

const districtImages: Record<string, string> = {
  Bonapriso:
    "https://images.pexels.com/photos/28915352/pexels-photo-28915352.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000",
  Akwa: "https://images.pexels.com/photos/33296769/pexels-photo-33296769.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000",
  Bonanjo:
    "https://images.pexels.com/photos/9514349/pexels-photo-9514349.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000",
  "Bonabéri":
    "https://images.pexels.com/photos/30304298/pexels-photo-30304298.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000",
  Yassa:
    "https://images.pexels.com/photos/18887138/pexels-photo-18887138.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=1000",
};

export default async function HomePage() {
  const properties = await getAllProperties();
  const featured = [
    ...properties.filter((p) => p.featured),
    ...properties.filter((p) => !p.featured),
  ].slice(0, 6);

  const districtCounts = new Map<string, number>();
  for (const p of properties) {
    if (!p.neighborhood) continue;
    districtCounts.set(p.neighborhood, (districtCounts.get(p.neighborhood) ?? 0) + 1);
  }
  const districts = Array.from(districtCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      image: districtImages[name] ?? districtImages.Bonapriso,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.name,
    description:
      "Agence immobilière premium à Douala : vente, location et gestion de villas, appartements, immeubles et espaces professionnels.",
    email: site.email,
    telephone: site.phones,
    url: site.url,
    areaServed: ["Douala", "Yaoundé", "Cameroun"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Douala",
      addressCountry: "CM",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeView
        featured={featured}
        districts={districts}
        counts={{ total: properties.length, districts: districtCounts.size }}
      />
    </>
  );
}
