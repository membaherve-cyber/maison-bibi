export function BuildingLoader({
  label = "Chargement…",
  fullscreen = false,
}: {
  label?: string;
  fullscreen?: boolean;
}) {
  const bars = [
    { x: 6, w: 12, h: 26, d: "0s" },
    { x: 22, w: 14, h: 40, d: "0.15s" },
    { x: 40, w: 16, h: 54, d: "0.3s" },
    { x: 60, w: 14, h: 36, d: "0.45s" },
    { x: 78, w: 12, h: 46, d: "0.6s" },
  ];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullscreen ? "min-h-[60vh]" : "py-16"
      }`}
    >
      <svg width="104" height="80" viewBox="0 0 96 72" aria-hidden="true">
        {bars.map((b) => (
          <g key={b.x}>
            <rect
              className="lmdb-bar"
              x={b.x}
              y={62 - b.h}
              width={b.w}
              height={b.h}
              rx="2"
              fill="#0f172a"
              style={{ animationDelay: b.d }}
            />
          </g>
        ))}
        <rect x="0" y="62" width="96" height="5" rx="2.5" fill="#d4af37" />
      </svg>
      <p className="text-sm font-medium tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="lmdb-shimmer relative h-56 w-full overflow-hidden bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-5 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}
