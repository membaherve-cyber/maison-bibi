"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/appointments"
      title="Rendez-vous"
      singular="Rendez-vous"
      writePermission="appointments.write"
      searchKeys={["customerName", "propertyTitle"]}
      defaults={{ status: "demande" }}
      fields={[
        { key: "customerName", label: "Client", type: "text", required: true },
        { key: "customerPhone", label: "Téléphone", type: "text" },
        { key: "scheduledAt", label: "Date et heure", type: "date", required: true },
        { key: "propertyTitle", label: "Bien concerné", type: "text" },
        { key: "location", label: "Lieu", type: "text" },
        { key: "status", label: "Statut", type: "select", options: [
          { value: "demande", label: "Demandé" },
          { value: "confirme", label: "Confirmé" },
          { value: "reporte", label: "Reporté" },
          { value: "termine", label: "Terminé" },
          { value: "annule", label: "Annulé" },
        ] },
        { key: "notes", label: "Notes", type: "textarea", full: true },
      ]}
      columns={[
        { header: "Client", render: (i) => <span className="font-semibold text-slate-deep">{String(i.customerName)}</span> },
        { header: "Date", render: (i) => new Date(String(i.scheduledAt)).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) },
        { header: "Bien", render: (i) => <span className="text-slate-500">{String(i.propertyTitle || "—").slice(0, 40)}</span> },
        { header: "Statut", render: (i) => <StatusBadge value={String(i.status)} /> },
      ]}
    />
  );
}