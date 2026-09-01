"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { IconArrowLeft } from "./icons";

export function BackButton({ fallback = "/proprietes" }: { fallback?: string }) {
  const router = useRouter();
  const { t } = useI18n();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-deep shadow-sm transition-all hover:-translate-x-0.5 hover:border-gold hover:text-gold-dark"
    >
      <IconArrowLeft size={16} />
      {t("common.back")}
    </button>
  );
}
