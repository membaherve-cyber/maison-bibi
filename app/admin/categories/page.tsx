"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/property-categories"
      title="Catégories de biens"
      singular="Catégorie"
      writePermission="categories.write"
      searchKeys={["name"]}
      defaults={{ published: true, position: 0 }}
      fields={[
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "position", label: "Ordre d'affichage", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "published", label: "Publiée", type: "bool", help: "Visible sur le site" },
        { key: "slug", label: "Slug", type: "text", advanced: true, help: "Généré automatiquement si vide" },
      ]}
      columns={[
        { header: "Nom", render: (i) => <span className="font-semibold text-slate-deep">{String(i.name)}</span> },
        { header: "Slug", render: (i) => <span className="text-slate-500">{String(i.slug)}</span> },
        { header: "Ordre", render: (i) => String(i.position ?? 0) },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}