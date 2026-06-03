"use client";

import type { LucideIcon } from "lucide-react";
import {
  HeartPulse,
  Lightbulb,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PhilosophyPrinciplesProps {
  eyebrow?: string;
  heading: string;
  principles: { iconName: string; title: string; description: string }[];
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  heart: HeartPulse,
  heartpulse: HeartPulse,
  idea: Lightbulb,
  lightbulb: Lightbulb,
  microscope: Microscope,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
};

/**
 * Three-card principle grid for practice philosophy and clinical beliefs.
 * Icons are resolved from a small lucide map with a medical fallback.
 */
export function PhilosophyPrinciples({
  eyebrow,
  heading,
  principles,
  className,
}: PhilosophyPrinciplesProps) {
  return (
    <section
      aria-labelledby="philosophy-heading"
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
            id="philosophy-heading"
            className="font-cormorant text-display-3 font-medium leading-tight"
          >
            {heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {principles.map((principle) => {
            const Icon =
              iconMap[principle.iconName.toLowerCase()] ?? Stethoscope;

            return (
              <Card
                key={principle.title}
                className="rounded-lg border border-line bg-white p-container shadow-card"
              >
                <div className="grid size-14 place-items-center rounded-full bg-rose-50 text-rose-700">
                  <Icon aria-hidden="true" className="size-6" />
                </div>
                <h3 className="mt-8 font-cormorant text-3xl font-medium leading-tight text-text-primary">
                  {principle.title}
                </h3>
                <p className="mt-4 font-inter text-sm leading-6 text-text-secondary">
                  {principle.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PhilosophyPrinciples;
