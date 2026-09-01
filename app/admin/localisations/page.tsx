"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/locations"
      title="Localisations"
      singular="Localisation"
      writePermission="locations.write"
      searchKeys={["neighborhood", "city"]}
      defaults={{ region: "Littoral", city: "Douala", published: true }}
      fields={[
        { key: "neighborhood", label: "Quartier", type: "text", required: true },
        { key: "city", label: "Ville", type: "text" },
        { key: "region", label: "Région", type: "text" },
        { key: "position", label: "Ordre", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "published", label: "Publiée", type: "bool" },
        { key: "latitude", label: "Latitude", type: "text", advanced: true },
        { key: "longitude", label: "Longitude", type: "text", advanced: true },
      ]}
      columns={[
        { header: "Quartier", render: (i) => <span className="font-semibold text-slate-deep">{String(i.neighborhood)}</span> },
        { header: "Ville", render: (i) => String(i.city) },
        { header: "Région", render: (i) => String(i.region) },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}