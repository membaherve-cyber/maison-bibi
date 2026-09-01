"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/testimonials"
      title="Témoignages"
      singular="Témoignage"
      writePermission="testimonials.write"
      searchKeys={["name", "content"]}
      defaults={{ rating: 5, published: true, isDemo: false }}
      fields={[
        { key: "name", label: "Nom du client", type: "text", required: true },
        { key: "location", label: "Localisation", type: "text" },
        { key: "content", label: "Témoignage", type: "textarea", required: true, full: true },
        { key: "photo", label: "Photo", type: "image" },
        { key: "rating", label: "Note sur 5", type: "number" },
        { key: "published", label: "Publié", type: "bool" },
        { key: "isDemo", label: "Contenu de démonstration", type: "bool", help: "Marquer comme démo (non réel)" },
        { key: "position", label: "Ordre", type: "number", advanced: true },
      ]}
      columns={[
        { header: "Client", render: (i) => (
            <span className="font-semibold text-slate-deep">
              {String(i.name)}{i.isDemo ? <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">DÉMO</span> : null}
            </span>) },
        { header: "Témoignage", render: (i) => <span className="text-slate-500">{String(i.content).slice(0, 60)}…</span> },
        { header: "Note", render: (i) => "★".repeat(Number(i.rating ?? 0)) },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}