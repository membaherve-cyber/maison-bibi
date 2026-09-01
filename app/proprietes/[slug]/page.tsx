import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailView } from "@/components/PropertyDetailView";
import {
  getAllProperties,
  getPropertyBySlug,
  relatedProperties,
} from "@/lib/properties";
import { formatPrice, locationLabel, site } from "@/lib/site";

/**
 * Rendered per request.
 *
 * Incremental static regeneration cannot be used here: when a property is
 * unpublished or deleted the page calls notFound(), and ISR keeps serving the
 * last successful render instead of replacing it with a 404. That would leave
 * withdrawn or sold listings publicly reachable indefinitely. The lookup is a
 * single indexed query, so rendering on demand stays fast while guaranteeing
 * that the page always matches the current inventory.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  // Unknown or withdrawn listing: never let it be indexed.
  if (!property || property.status !== "published") {
    return {
      title: "Propriété introuvable",
      robots: { index: false, follow: false },
    };
  }

  const title = property.seoTitle || `${property.title} — ${formatPrice(property)}`;
  const description =
    property.seoDescription || property.description.slice(0, 155).trim();

  return {
    title,
    description,
    alternates: { canonical: `/proprietes/${property.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${site.url}/proprietes/${property.slug}`,
      images: property.images.slice(0, 3),
      locale: "fr_CM",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: property.images.slice(0, 1),
    },
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || property.status !== "published") notFound();

  const all = await getAllProperties();
  const related = relatedProperties(all, property, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Residence", "Product"],
    name: property.title,
    description: property.description.slice(0, 300),
    image: property.images,
    url: `${site.url}/proprietes/${property.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.city === "Douala" ? "Littoral" : "Centre",
      addressCountry: "CM",
    },
    ...(property.livingArea
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.livingArea,
            unitCode: "MTK",
          },
        }
      : {}),
    ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      seller: { "@type": "RealEstateAgent", name: site.name },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Propriétés",
        item: `${site.url}/proprietes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${property.title} — ${locationLabel(property)}`,
        item: `${site.url}/proprietes/${property.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PropertyDetailView property={property} related={related} />
    </>
  );
}
