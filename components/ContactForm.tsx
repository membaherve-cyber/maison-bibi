"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const field =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-deep outline-none transition-colors focus:border-gold";
const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export function ContactForm({
  propertyId,
  propertyTitle,
  compact = false,
}: {
  propertyId?: number;
  propertyTitle?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: propertyTitle
      ? `Bonjour, je souhaite plus d'informations sur « ${propertyTitle} ».`
      : "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyId, propertyTitle, sourcePage: typeof window !== "undefined" ? window.location.pathname : "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "failed");
      setState("done");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        {t("common.thanks")}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className={label} htmlFor="c-name">
            {t("common.name")} *
          </label>
          <input
            id="c-name"
            required
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className={label} htmlFor="c-phone">
            {t("common.phone")} *
          </label>
          <input
            id="c-phone"
            required
            type="tel"
            className={field}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="c-email">
          {t("common.email")}
        </label>
        <input
          id="c-email"
          type="email"
          className={field}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className={label} htmlFor="c-message">
          {t("common.message")}
        </label>
        <textarea
          id="c-message"
          rows={compact ? 3 : 5}
          className={field}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {state === "error" ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {t("common.error")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-deep px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-gold hover:text-slate-deep disabled:opacity-60"
      >
        {state === "sending" ? t("common.sending") : t("common.send")}
      </button>
    </form>
  );
}
