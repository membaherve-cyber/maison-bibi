import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { PageIntro } from "@/components/PageIntro";
import { getAllProperties } from "@/lib/properties";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Propriétés à vendre et à louer à Douala et au Cameroun",
  description:
    "Parcourez toutes les propriétés La Maison Bibi : villas, appartements, duplex, immeubles, bureaux et entrepôts à Douala (Bonapriso, Bonanjo, Akwa, Bali, Bonabéri, Yassa, Youpwe, Logpom) et à Yaoundé.",
  alternates: { canonical: "/proprietes" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [properties, params] = await Promise.all([
    getAllProperties(),
    searchParams,
  ]);

  // Resolved server-side so the filtered grid is present in the initial HTML.
  const initialFilters = {
    transaction: first(params.transaction),
    type: first(params.type),
    city: first(params.city),
    neighborhood: first(params.neighborhood),
    q: first(params.q),
  };

  return (
    <>
      <PageIntro
        eyebrowKey="nav.properties"
        titleKey="page.propertiesTitle"
        subtitleKey="page.propertiesSub"
      />
      <div className="container-page pb-8">
        <PropertyExplorer
          properties={properties}
          initialFilters={initialFilters}
        />
      </div>
    </>
  );
}
