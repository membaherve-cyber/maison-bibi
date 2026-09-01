"use client";

import { SettingsPanels } from "../parametres/page";

export default function Page() {
  return (
    <div>
      <h1 className="font-display text-2xl text-slate-deep sm:text-3xl">SEO</h1>
      <p className="mt-1 text-sm text-slate-500">
        Métadonnées par défaut du site. Chaque propriété et chaque article dispose également de ses
        propres champs SEO dans son éditeur.
      </p>
      <div className="mt-6"><SettingsPanels only={["seo"]} /></div>
    </div>
  );
}