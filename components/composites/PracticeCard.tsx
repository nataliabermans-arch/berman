"use client";

import type { CSSProperties, MouseEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Droplet,
  Droplets,
  Flower2,
  Heart,
  Leaf,
  Scale,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

export interface PracticeCardProps {
  iconName?: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  variant?: "rose" | "ink";
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  droplet: Droplet,
  droplets: Droplets,
  flower: Flower2,
  "flower-2": Flower2,
  heart: Heart,
  leaf: Leaf,
  scale: Scale,
  sparkle: Sparkles,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
};

function getIcon(iconName?: string) {
  if (!iconName) {
    return Sparkles;
  }

  return iconMap[iconName.trim().toLowerCase()] ?? Sparkles;
}

/**
 * Pointer-aware practice specialty card with a tracked rose spotlight sheen.
 * Renders as a link when `href` is supplied and keeps the CTA visible on hover.
 */
export function PracticeCard({
  iconName,
  title,
  description,
  href,
  cta = "Open",
  variant = "rose",
  className,
}: PracticeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = getIcon(iconName);

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--cx",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--cy",
      `${event.clientY - rect.top}px`,
    );
  }

  function handleMouseLeave(event: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    event.currentTarget.style.setProperty("--cx", "50%");
    event.currentTarget.style.setProperty("--cy", "50%");
  }

  const sharedClassName = cn(
    "group relative isolate min-h-[320px] overflow-hidden rounded-lg border p-6 shadow-lift transition-all duration-300",
    "hover:shadow-lift-rose focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20",
    variant === "ink"
      ? "border-ink bg-ink-aurora text-white"
      : "border-line bg-press-tile text-text-primary",
    className,
  );

  const content = (
    <>
      <Spotlight
        fill={variant === "ink" ? "#f4d4d4" : "#8a3a44"}
        className="left-[calc(var(--cx,50%)-35%)] top-[calc(var(--cy,50%)-60%)] h-[120%] w-[120%] opacity-20 transition-opacity duration-300 group-hover:opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          {
            background:
              "radial-gradient(260px circle at var(--cx,50%) var(--cy,50%), rgba(217,155,161,0.24), transparent 62%)",
          } as CSSProperties
        }
      />
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            "mb-12 grid size-12 place-items-center rounded-full border",
            variant === "ink"
              ? "border-white/20 bg-white/10 text-rose-100"
              : "border-line-rose bg-white/70 text-rose-700",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h3 className="max-w-[12ch] font-cormorant text-4xl font-medium leading-[1.02]">
          {title}
        </h3>
        <p
          className={cn(
            "mt-5 line-clamp-4 font-inter text-sm leading-6",
            variant === "ink" ? "text-white/72" : "text-text-secondary",
          )}
        >
          {description}
        </p>
        <span
          className={cn(
            "mt-auto inline-flex items-center gap-2 pt-8 font-dm-mono text-[0.68rem] uppercase tracking-[0.22em]",
            "opacity-70 transition-opacity duration-300 group-hover:opacity-100",
            variant === "ink" ? "text-rose-100" : "text-rose-700",
          )}
        >
          {cta}
          <ArrowRight className="size-4 translate-x-[-2px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className="block focus-visible:outline-none">
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <Card
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={sharedClassName}
          >
            {content}
          </Card>
        </motion.div>
      </a>
    );
  }

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <Card
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={sharedClassName}
      >
        {content}
      </Card>
    </motion.div>
  );
}

export default PracticeCard;
