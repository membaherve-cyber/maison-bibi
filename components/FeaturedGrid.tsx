"use client";

import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertyQuickView } from "./PropertyQuickView";
import type { Property } from "@/lib/types";

export function FeaturedGrid({ properties }: { properties: Property[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const current = index !== null ? properties[index] : null;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p, i) => (
          <PropertyCard
            key={p.id}
            property={p}
            priority={i < 3}
            onQuickView={() => setIndex(i)}
          />
        ))}
      </div>

      {current ? (
        <PropertyQuickView
          property={current}
          onClose={() => setIndex(null)}
          onPrevProperty={
            index !== null && index > 0 ? () => setIndex((i) => (i ?? 0) - 1) : undefined
          }
          onNextProperty={
            index !== null && index < properties.length - 1
              ? () => setIndex((i) => (i ?? 0) + 1)
              : undefined
          }
        />
      ) : null}
    </>
  );
}
