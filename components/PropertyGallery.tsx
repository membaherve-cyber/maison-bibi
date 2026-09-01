"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { IconArrowLeft, IconArrowRight, IconClose, IconExpand } from "./icons";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const list = images.length ? images : ["/logo-mark.svg"];
  // Only the primary image is fetched up front; the rest are prefetched once
  // the browser is idle so the gallery stays instant without blocking paint.
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    const run = () => setPrimed(true);
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(run);
      return;
    }
    const timer = window.setTimeout(run, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % list.length), [list.length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + list.length) % list.length),
    [list.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
      touchX.current = null;
    },
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-900"
        {...swipe}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("gallery.fullscreen")}
          className="block w-full cursor-zoom-in"
        >
          <span className="relative block aspect-[4/3] w-full sm:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={list[index]}
              src={list[index]}
              alt={`${title} — ${index + 1}/${list.length}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="lmdb-fade-up absolute inset-0 h-full w-full object-cover"
            />
          </span>
        </button>

        {list.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={t("gallery.prev")}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-deep shadow-lg transition-colors hover:bg-gold sm:left-4 sm:h-12 sm:w-12"
            >
              <IconArrowLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t("gallery.next")}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-deep shadow-lg transition-colors hover:bg-gold sm:right-4 sm:h-12 sm:w-12"
            >
              <IconArrowRight size={22} />
            </button>
          </>
        ) : null}

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-semibold text-white">
          {index + 1} / {list.length}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-deep shadow transition-colors hover:bg-gold"
        >
          <IconExpand size={14} /> {t("gallery.fullscreen")}
        </button>
      </div>

      {list.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-28 ${
                i === index
                  ? "border-gold"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={i === 0 || primed ? img : undefined}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full bg-slate-100 object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("prop.gallery")}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 p-3"
          onClick={() => setOpen(false)}
          {...swipe}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("gallery.close")}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-gold hover:text-slate-deep"
          >
            <IconClose size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[index]}
            alt={`${title} — ${index + 1}/${list.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
          />
          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label={t("gallery.prev")}
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-gold hover:text-slate-deep"
              >
                <IconArrowLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label={t("gallery.next")}
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-gold hover:text-slate-deep"
              >
                <IconArrowRight size={24} />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                {index + 1} / {list.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
