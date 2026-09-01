"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang, t } = useI18n();
  const base =
    "px-2.5 py-1 text-xs font-bold tracking-wide transition-colors rounded-md";
  const activeCls = "bg-bibi text-white";
  const idleCls =
    tone === "dark"
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-slate-700 hover:text-bibi hover:bg-slate-100";

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={`flex items-center gap-0.5 rounded-lg border px-1 py-0.5 ${
        tone === "dark" ? "border-white/20" : "border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
        className={`${base} ${lang === "fr" ? activeCls : idleCls}`}
      >
        FR
      </button>
      <span
        aria-hidden="true"
        className={tone === "dark" ? "text-white/30" : "text-slate-400"}
      >
        |
      </span>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${base} ${lang === "en" ? activeCls : idleCls}`}
      >
        EN
      </button>
    </div>
  );
}
