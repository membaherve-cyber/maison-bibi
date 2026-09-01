"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/team"
      title="Notre équipe d'experts"
      singular="Membre"
      writePermission="team.write"
      searchKeys={["name", "role"]}
      defaults={{ published: true, role: "Courtier immobilier" }}
      fields={[
        { key: "name", label: "Nom complet", type: "text", required: true },
        { key: "role", label: "Fonction", type: "text" },
        { key: "photo", label: "Photo", type: "image" },
        { key: "bio", label: "Présentation", type: "textarea", full: true },
        { key: "phone", label: "Téléphone", type: "text" },
        { key: "email", label: "E-mail", type: "text" },
        { key: "position", label: "Ordre", type: "number" },
        { key: "published", label: "Publié", type: "bool" },
      ]}
      columns={[
        { header: "Nom", render: (i) => <span className="font-semibold text-slate-deep">{String(i.name)}</span> },
        { header: "Fonction", render: (i) => String(i.role) },
        { header: "Contact", render: (i) => <span className="text-slate-500">{String(i.phone || i.email || "—")}</span> },
        { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
      ]}
    />
  );
}