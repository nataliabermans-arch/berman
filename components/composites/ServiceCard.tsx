"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  title: string;
  blurb: string;
  badge?: string;
  imageSrc?: string;
  href: string;
  className?: string;
}

/**
 * Vertical service summary card with image well, badge, description, and CTA.
 * Keeps the media hover treatment CSS-only for later motion polish.
 */
export function ServiceCard({
  title,
  blurb,
  badge,
  imageSrc,
  href,
  className,
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "group h-full rounded-lg border border-line bg-white p-0 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="size-full object-cover transition-transform duration-250 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            data-needs-asset="service-image"
            className="grid size-full place-items-center bg-neutral-100 font-dm-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-tertiary"
          >
            Service image
          </div>
        )}
        {badge ? (
          <Badge className="absolute bottom-4 left-4 rounded-full border-line-rose bg-rose-50 px-3 py-1 font-dm-mono text-[0.65rem] uppercase tracking-[0.16em] text-rose-700">
            {badge}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-cormorant text-3xl font-medium leading-tight text-text-primary">
          {title}
        </h3>
        <p className="mt-4 line-clamp-3 font-inter text-sm leading-6 text-text-secondary">
          {blurb}
        </p>
        <GlowCtaButton
          href={href}
          size="sm"
          variant="secondary"
          className="mt-auto pt-5"
        >
          Learn more
        </GlowCtaButton>
      </div>
    </Card>
  );
}

export default ServiceCard;
