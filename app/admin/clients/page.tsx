"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/customers"
      title="Clients"
      singular="Client"
      writePermission="customers.write"
      searchKeys={["name", "phone", "email"]}
      fields={[
        { key: "name", label: "Nom", type: "text", required: true },
        { key: "phone", label: "Téléphone", type: "text" },
        { key: "email", label: "E-mail", type: "text" },
        { key: "notes", label: "Notes internes", type: "textarea", full: true },
      ]}
      columns={[
        { header: "Nom", render: (i) => <span className="font-semibold text-slate-deep">{String(i.name)}</span> },
        { header: "Téléphone", render: (i) => i.phone ? <a href={`tel:${String(i.phone).replace(/\s/g, "")}`} className="text-gold-dark">{String(i.phone)}</a> : "—" },
        { header: "E-mail", render: (i) => String(i.email || "—") },
        { header: "Créé le", render: (i) => new Date(String(i.createdAt)).toLocaleDateString("fr-FR") },
      ]}
    />
  );
}