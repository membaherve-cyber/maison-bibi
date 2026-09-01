"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <ResourceManager
      endpoint="/api/articles"
      title="Articles"
      singular="Article"
      writePermission="articles.write"
      deletePermission="articles.delete"
      searchKeys={["title", "excerpt"]}
      defaults={{ status: "brouillon", tags: [] }}
      fields={[
        { key: "title", label: "Titre", type: "text", required: true, full: true },
        { key: "excerpt", label: "Chapô / résumé", type: "textarea", full: true },
        { key: "content", label: "Contenu de l'article", type: "richtext", full: true,
          help: "Rédigez en texte simple. Une ligne vide sépare les paragraphes." },
        { key: "image", label: "Image principale", type: "image" },
        { key: "status", label: "Statut", type: "select", options: [
          { value: "brouillon", label: "Brouillon" },
          { value: "planifie", label: "Planifié" },
          { value: "publie", label: "Publié" },
          { value: "archive", label: "Archivé" },
        ] },
        { key: "authorName", label: "Auteur", type: "text" },
        { key: "publishedAt", label: "Date de publication", type: "date" },
        { key: "tags", label: "Mots-clés", type: "tags" },
        { key: "seoTitle", label: "Titre SEO", type: "text", advanced: true },
        { key: "seoDescription", label: "Meta description", type: "textarea", advanced: true },
        { key: "slug", label: "Slug", type: "text", advanced: true, help: "Généré automatiquement si vide" },
      ]}
      columns={[
        { header: "Titre", render: (i) => <span className="font-semibold text-slate-deep">{String(i.title)}</span> },
        { header: "Auteur", render: (i) => String(i.authorName || "—") },
        { header: "Statut", render: (i) => <StatusBadge value={String(i.status)} /> },
        { header: "Créé le", render: (i) => new Date(String(i.createdAt)).toLocaleDateString("fr-FR") },
      ]}
    />
  );
}