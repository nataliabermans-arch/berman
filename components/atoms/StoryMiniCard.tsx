"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StoryMiniCardProps {
  photoSrc?: string;
  name: string;
  age?: string | number;
  treatment: string;
  quote: string;
  className?: string;
}

/**
 * Compact patient story preview with portrait, patient metadata, and quote.
 * Missing portraits render a marked placeholder for downstream asset work.
 */
export function StoryMiniCard({
  photoSrc,
  name,
  age,
  treatment,
  quote,
  className,
}: StoryMiniCardProps) {
  const hasPhoto = Boolean(photoSrc && photoSrc !== "PLACEHOLDER");
  const label = age ? `${name}, ${age}` : name;

  return (
    <Card
      size="sm"
      className={cn(
        "min-w-[220px] flex-row items-center gap-3 rounded-lg border border-line bg-neutral-50 p-3 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-neutral-0 hover:shadow-card",
        className,
      )}
    >
      {hasPhoto ? (
        <img
          src={photoSrc}
          alt={`${name} portrait`}
          className="size-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div
          data-needs-asset="patient-photo"
          aria-label={`${name} portrait placeholder`}
          className="grid size-16 shrink-0 place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-100 font-cormorant text-2xl italic text-neutral-500"
        >
          {name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-inter text-sm font-semibold leading-tight text-text-primary">
          {label}
        </p>
        <p className="mt-1 font-dm-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-tertiary">
          {treatment}
        </p>
        <p className="mt-2 truncate font-cormorant text-xl italic leading-none text-rose-700">
          “{quote}”
        </p>
      </div>
    </Card>
  );
}

export default StoryMiniCard;
