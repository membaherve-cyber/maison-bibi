"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/admin/ui";

export default function Page() {
  return (
    <div className="space-y-10">
      <ResourceManager
        endpoint="/api/ai-knowledge"
        title="Assistant IA — base de connaissances"
        singular="Connaissance"
        writePermission="ai.write"
        searchKeys={["title", "content"]}
        defaults={{ published: true, category: "Général", keywords: [] }}
        fields={[
          { key: "title", label: "Titre", type: "text", required: true },
          { key: "category", label: "Catégorie", type: "text" },
          { key: "content", label: "Réponse fournie par Bibi", type: "textarea", required: true, full: true,
            help: "Bibi utilise ce texte tel quel. N'y indiquez que des informations vérifiées." },
          { key: "keywords", label: "Mots-clés déclencheurs", type: "tags", full: true,
            help: "Séparés par des virgules, par exemple : frais, honoraires, commission" },
          { key: "published", label: "Active", type: "bool" },
          { key: "position", label: "Ordre", type: "number", advanced: true },
        ]}
        columns={[
          { header: "Titre", render: (i) => <span className="font-semibold text-slate-deep">{String(i.title)}</span> },
          { header: "Catégorie", render: (i) => String(i.category) },
          { header: "Mots-clés", render: (i) => <span className="text-slate-500">{(Array.isArray(i.keywords) ? i.keywords as string[] : []).join(", ") || "—"}</span> },
          { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
        ]}
      />

      <ResourceManager
        endpoint="/api/faqs"
        title="Questions fréquentes"
        singular="Question"
        writePermission="ai.write"
        searchKeys={["question"]}
        defaults={{ published: true, category: "Général" }}
        fields={[
          { key: "question", label: "Question", type: "text", required: true, full: true },
          { key: "answer", label: "Réponse", type: "textarea", required: true, full: true },
          { key: "category", label: "Catégorie", type: "text" },
          { key: "position", label: "Ordre", type: "number" },
          { key: "published", label: "Publiée", type: "bool" },
        ]}
        columns={[
          { header: "Question", render: (i) => <span className="font-semibold text-slate-deep">{String(i.question).slice(0, 70)}</span> },
          { header: "Catégorie", render: (i) => String(i.category) },
          { header: "Statut", render: (i) => <StatusBadge value={i.published ? "published" : "draft"} /> },
        ]}
      />
    </div>
  );
}