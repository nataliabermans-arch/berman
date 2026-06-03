"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  HeartPulse,
  Moon,
  Sparkles,
  Stethoscope,
  Thermometer,
  Zap,
} from "lucide-react";

import CheckChip from "@/components/atoms/CheckChip";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SymptomGridProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  symptoms: { iconName?: string; label: string; description?: string }[];
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  heart: HeartPulse,
  heartpulse: HeartPulse,
  moon: Moon,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  thermometer: Thermometer,
  zap: Zap,
};

/**
 * Responsive symptom card grid for treatment detail pages.
 * Each item supports a mapped lucide icon and optional concise description.
 */
export function SymptomGrid({
  eyebrow,
  heading,
  intro,
  symptoms,
  className,
}: SymptomGridProps) {
  return (
    <section
      aria-labelledby="symptom-grid-heading"
      className={cn(
        "bg-surface-soft px-container py-section text-text-primary",
        className,
      )}
    >
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <p className="mb-4 font-dm-mono text-[0.72rem] uppercase tracking-[0.18em] text-rose-700">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id="symptom-grid-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
          {intro ? (
            <p className="mt-5 font-inter text-base leading-7 text-text-secondary md:text-lg">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {symptoms.map((symptom) => {
            const Icon = symptom.iconName
              ? (iconMap[symptom.iconName.toLowerCase()] ?? Stethoscope)
              : Stethoscope;

            return (
              <Card
                key={symptom.label}
                className="rounded-md border border-line bg-white p-5 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="grid size-10 place-items-center rounded-full bg-rose-50 text-rose-700">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <CheckChip
                    checked
                    className="pointer-events-none px-2 py-1 text-[0.68rem]"
                  >
                    Treatable
                  </CheckChip>
                </div>
                <h3 className="font-inter text-base font-medium leading-snug text-text-primary">
                  {symptom.label}
                </h3>
                {symptom.description ? (
                  <p className="mt-2 line-clamp-1 font-inter text-sm leading-6 text-text-secondary">
                    {symptom.description}
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SymptomGrid;
