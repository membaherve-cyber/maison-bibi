"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/gallery"
      title="Galerie"
      singular="Image"
      writePermission="gallery.write"
      searchKeys={["title", "category"]}
      defaults={{ published: true, category: "Général" }}
      fields={[
        { key: "image", label: "Image", type: "image", required: true },
        { key: "title", label: "Titre", type: "text" },
        { key: "category", label: "Catégorie", type: "text" },
        { key: "alt", label: "Texte alternatif", type: "text", help: "Description pour l'accessibilité" },
        { key: "caption", label: "Légende", type: "textarea", full: true },
        { key: "position", label: "Ordre", type: "number" },
        { key: "published", label: "Publiée", type: "bool" },
      ]}
      columns={[
        { header: "Image", render: (i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(i.image)} alt="" className="h-11 w-16 rounded object-cover" loading="lazy" />) },
        { header: "Titre", render: (i) => <span className="font-semibold text-slate-deep">{String(i.title || "—")}</span> },
        { header: "Catégorie", render: (i) => String(i.category) },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}