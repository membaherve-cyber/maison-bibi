"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/services"
      title="Services"
      singular="Service"
      writePermission="services.write"
      searchKeys={["name"]}
      defaults={{ published: true, icon: "🏠" }}
      fields={[
        { key: "name", label: "Nom du service", type: "text", required: true },
        { key: "icon", label: "Icône (emoji)", type: "text" },
        { key: "shortDescription", label: "Description courte", type: "textarea" },
        { key: "description", label: "Description complète", type: "textarea" },
        { key: "image", label: "Image", type: "image" },
        { key: "position", label: "Ordre", type: "number" },
        { key: "published", label: "Publié", type: "bool" },
        { key: "nameEn", label: "Nom (EN)", type: "text", advanced: true },
        { key: "descriptionEn", label: "Description (EN)", type: "textarea", advanced: true },
      ]}
      columns={[
        { header: "Service", render: (i) => <span className="font-semibold text-slate-deep">{String(i.icon)} {String(i.name)}</span> },
        { header: "Description", render: (i) => <span className="text-slate-500">{String(i.shortDescription ?? "").slice(0, 60)}</span> },
        { header: "Ordre", render: (i) => String(i.position ?? 0) },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}