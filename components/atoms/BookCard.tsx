"use client";

import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MovingBorder } from "@/components/ui/moving-border";
import { cn } from "@/lib/utils";

export interface BookCardProps {
  coverSrc?: string;
  title: string;
  subtitle?: string;
  year?: string;
  badge?: string;
  href?: string;
  className?: string;
}

/**
 * Vertical book feature card with optional cover art, badge, and metadata.
 * Missing covers render a marked placeholder for later asset replacement.
 */
export function BookCard({
  coverSrc,
  title,
  subtitle,
  year,
  badge,
  href,
  className,
}: BookCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasCover = Boolean(coverSrc && coverSrc !== "PLACEHOLDER");
  const content = (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.04 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 30, mass: 1 }
      }
      className="h-full"
    >
      <Card
        className={cn(
          "group/book relative h-full gap-0 overflow-hidden rounded-lg border border-line bg-neutral-0 p-4 shadow-card transition-all duration-300 hover:shadow-lift",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/book:opacity-100">
          <MovingBorder duration={3600} rx="18%" ry="18%">
            <div className="size-20 rounded-full bg-rose-300/70 blur-sm" />
          </MovingBorder>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-line bg-card-tinted shadow-inner-light">
            {hasCover ? (
              <img
                src={coverSrc}
                alt={`${title} cover`}
                className="size-full object-cover"
              />
            ) : (
              <div
                data-needs-asset="book-cover"
                className="flex size-full items-center justify-center bg-card-tinted px-5 text-center font-cormorant text-3xl italic leading-none text-ink-700"
              >
                {title}
              </div>
            )}
            {badge ? (
              <Badge className="absolute left-3 top-3 h-auto rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-dm-mono text-[0.58rem] uppercase tracking-[0.16em] text-rose-700">
                {badge}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-2">
            <h3 className="font-cormorant text-3xl font-medium italic leading-none text-text-primary">
              {title}
            </h3>
            {subtitle ? (
              <p className="font-inter text-sm leading-snug text-text-secondary">
                {subtitle}
              </p>
            ) : null}
            {year ? (
              <p className="font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary">
                {year}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
      >
        {content}
      </a>
    );
  }

  return content;
}

export default BookCard;
