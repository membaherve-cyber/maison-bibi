"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/homepage-sections"
      title="Sections de la page d'accueil"
      singular="Section"
      writePermission="homepage.write"
      searchKeys={["title", "blockType"]}
      defaults={{ enabled: true, config: {} }}
      fields={[
        { key: "blockType", label: "Type de bloc", type: "select", required: true, options: [
          { value: "hero", label: "Bannière (Hero)" },
          { value: "property-grid", label: "Grille de propriétés" },
          { value: "property-carousel", label: "Carrousel de propriétés" },
          { value: "services", label: "Services" },
          { value: "cta", label: "Appel à l'action" },
          { value: "gallery", label: "Galerie" },
          { value: "testimonials", label: "Témoignages" },
          { value: "articles", label: "Articles" },
          { value: "faq", label: "FAQ" },
          { value: "image-text", label: "Image + texte" },
          { value: "contact", label: "Contact" },
          { value: "location", label: "Localisation" },
          { value: "custom", label: "Contenu personnalisé" },
        ] },
        { key: "title", label: "Titre affiché", type: "text" },
        { key: "subtitle", label: "Sous-titre", type: "textarea", full: true },
        { key: "position", label: "Ordre", type: "number" },
        { key: "enabled", label: "Activée", type: "bool" },
      ]}
      columns={[
        { header: "Bloc", render: (i) => <span className="font-semibold text-slate-deep">{String(i.blockType)}</span> },
        { header: "Titre", render: (i) => String(i.title || "—") },
        { header: "Ordre", render: (i) => String(i.position ?? 0) },
        { header: "Statut", render: (i) => <StatusBadge value={i.enabled ? "published" : "draft"} /> },
      ]}
    />
  );
}