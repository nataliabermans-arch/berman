"use client";

import { motion, useReducedMotion } from "motion/react";

import { Spotlight } from "@/components/ui/spotlight";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PressTileProps {
  logoSrc?: string;
  logoAlt: string;
  href?: string;
  className?: string;
}

/**
 * Square press logo tile with a soft gradient field and hover spotlight.
 * Falls back to a grep-replaceable asset placeholder when no logo is supplied.
 */
export function PressTile({
  logoSrc,
  logoAlt,
  href,
  className,
}: PressTileProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasLogo = Boolean(logoSrc && logoSrc !== "PLACEHOLDER");
  const content = (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -12, scale: 1.04 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      }
      className="h-full"
    >
      <Card
        className={cn(
          "group/press relative aspect-square items-center justify-center overflow-hidden rounded-lg border border-line bg-press-tile p-6 shadow-card transition-all duration-300 hover:border-rose-200 hover:shadow-lift",
          className,
        )}
      >
        <Spotlight
          fill="var(--color-rose-100)"
          className="-left-1/4 -top-1/3 opacity-0 transition-opacity duration-300 group-hover/press:opacity-80"
        />
        <div className="relative z-10 flex size-full items-center justify-center">
          {hasLogo ? (
            <img
              src={logoSrc}
              alt={logoAlt}
              className="max-h-[58%] max-w-[72%] object-contain grayscale transition duration-300 group-hover/press:grayscale-0"
            />
          ) : (
            <div
              data-needs-asset="press-logo"
              className="flex size-full items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center font-cormorant text-2xl italic leading-tight text-neutral-600"
            >
              {logoAlt}
            </div>
          )}
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

export default PressTile;
