"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { cn } from "@/lib/utils";

export interface ChoiceCardProps {
  mode: "in-person" | "telehealth";
  title: string;
  blurb: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc?: string;
  className?: string;
}

/**
 * Two-up booking choice card for in-person and telehealth visit paths.
 * Includes a mode chip, editorial image well, short copy, and glow CTA.
 */
export function ChoiceCard({
  mode,
  title,
  blurb,
  ctaLabel,
  ctaHref,
  imageSrc,
  className,
}: ChoiceCardProps) {
  const isInPerson = mode === "in-person";

  return (
    <Card
      className={cn(
        "group min-h-[520px] rounded-lg border p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        isInPerson
          ? "border-ink bg-ink-aurora text-white"
          : "border-line bg-footer-bloom text-text-primary",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <span
            className={cn(
              "rounded-full border px-3 py-1 font-dm-mono text-[0.65rem] uppercase tracking-[0.2em]",
              isInPerson
                ? "border-white/20 bg-white/10 text-white/80"
                : "border-line-rose bg-rose-50 text-rose-700",
            )}
          >
            {isInPerson ? "In-person" : "Telehealth"}
          </span>
          <Button
            render={<a href={ctaHref} aria-label={ctaLabel} />}
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full border",
              isInPerson
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-line text-rose-700 hover:bg-rose-50",
            )}
          >
            →
          </Button>
        </div>

        <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-white/20 bg-neutral-100">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              data-needs-asset="choice-bg"
              className={cn(
                "grid size-full place-items-center font-dm-mono text-[0.65rem] uppercase tracking-[0.18em]",
                isInPerson
                  ? "bg-white/10 text-white/55"
                  : "bg-neutral-100 text-text-tertiary",
              )}
            >
              Choice image
            </div>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="font-cormorant text-4xl font-medium leading-[1.02]">
            {title}
          </h3>
          <p
            className={cn(
              "mt-4 line-clamp-2 font-inter text-base leading-7",
              isInPerson ? "text-white/72" : "text-text-secondary",
            )}
          >
            {blurb}
          </p>
          <GlowCtaButton
            href={ctaHref}
            variant={isInPerson ? "secondary" : "primary"}
            className="mt-7"
          >
            {ctaLabel}
          </GlowCtaButton>
        </div>
      </div>
    </Card>
  );
}

export default ChoiceCard;
