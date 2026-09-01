import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Maison Bibi",
    short_name: "Bibi",
    description: "Agence immobilière premium à Douala, Cameroun.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    lang: "fr-CM",
    icons: [
      { src: "/logo-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
