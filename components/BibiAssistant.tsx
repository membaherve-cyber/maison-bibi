"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { site, telHref, whatsappHref } from "@/lib/site";
import { IconClose, IconPhone, IconWhatsapp } from "./icons";

type Suggestion = { slug: string; title: string; price: string; location: string };
type Msg = { role: "bibi" | "user"; text: string; suggestions?: Suggestion[] };

export function BibiAssistant() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "bibi", text: t("bibi.welcome") }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setMessages((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, lang }),
      });
      const data = (await res.json()) as { reply: string; suggestions?: Suggestion[] };
      setMessages((m) => [
        ...m,
        { role: "bibi", text: data.reply, suggestions: data.suggestions },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bibi",
          text:
            lang === "en"
              ? "I could not reach the server. You can reach our team on WhatsApp right away."
              : "Je n'arrive pas à joindre le serveur. Vous pouvez contacter notre équipe sur WhatsApp immédiatement.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const quick = [t("bibi.q1"), t("bibi.q2"), t("bibi.q3")];

  return (
    <>
      <div className="fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6">
        {!open ? (
          <div className="relative">
            <span
              className="lmdb-wave absolute inset-0 rounded-full bg-bibi/40"
              aria-hidden="true"
            />
            <span
              className="lmdb-wave absolute inset-0 rounded-full bg-bibi/30"
              style={{ animationDelay: "0.9s" }}
              aria-hidden="true"
            />
            <span
              className="lmdb-wave absolute inset-0 rounded-full bg-gold/30"
              style={{ animationDelay: "1.8s" }}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("bibi.open")}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e0479f] via-[#b5338c] to-[#7d2a76] text-white shadow-xl shadow-fuchsia-900/25 transition-transform hover:scale-105"
            >
              <span className="font-script text-2xl leading-none">Bibi</span>
            </button>
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-x-3 bottom-3 z-[95] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem]">
          <div className="lmdb-pop flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#7d2a76] to-[#b5338c] px-4 py-3 text-white">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <span
                  className="lmdb-wave absolute inset-0 rounded-full bg-white/25"
                  aria-hidden="true"
                />
                <span className="font-script text-lg">B</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-tight">{t("bibi.title")}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  {t("bibi.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("bibi.close")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/20"
              >
                <IconClose size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4"
            >
              {messages.map((m, i) => (
                <div key={i}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "ml-auto bg-slate-deep text-white"
                        : "bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.suggestions?.length ? (
                    <ul className="mt-2 space-y-2">
                      {m.suggestions.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/proprietes/${s.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs transition-colors hover:border-gold"
                          >
                            <span className="block font-semibold text-slate-deep">
                              {s.title}
                            </span>
                            <span className="mt-0.5 block text-slate-500">
                              {s.location} · {s.price}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              {busy ? (
                <div className="flex w-16 items-center justify-center gap-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="lmdb-bar inline-block h-2 w-2 rounded-full bg-slate-300"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-3 pt-3">
              {quick.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-gold hover:text-gold-dark"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("bibi.placeholder")}
                aria-label={t("bibi.placeholder")}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button
                type="submit"
                aria-label={t("common.send")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-deep text-white transition-colors hover:bg-gold hover:text-slate-deep"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4z" />
                </svg>
              </button>
            </form>

            <div className="flex gap-2 border-t border-slate-100 bg-white px-3 pb-3 pt-2">
              <a
                href={whatsappHref(
                  "Bonjour La Maison Bibi, j'ai une question sur vos biens.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <IconWhatsapp size={14} /> WhatsApp
              </a>
              <a
                href={telHref(site.phones[0])}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-deep"
              >
                <IconPhone size={14} /> {site.phones[0]}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
