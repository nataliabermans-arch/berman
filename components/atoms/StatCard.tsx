"use client";

import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  value: number;
  suffix?: string;
  label: string;
  variant?: "ink" | "rose";
  className?: string;
}

/**
 * At-a-glance metric card with viewport-triggered numeric ticker.
 * Use the rose variant to emphasize key values against restrained labels.
 */
export function StatCard({
  value,
  suffix,
  label,
  variant = "ink",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border border-line bg-neutral-0 px-6 py-5 shadow-card",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-baseline gap-1 font-cormorant text-5xl font-medium leading-none tabular-nums",
          variant === "rose" ? "text-[var(--color-rose-700)]" : "text-ink",
        )}
      >
        <NumberTicker
          value={value}
          className={cn(
            "font-cormorant text-5xl font-medium tracking-normal",
            variant === "rose" ? "text-[var(--color-rose-700)]" : "text-ink",
          )}
        />
        {suffix ? <span>{suffix}</span> : null}
      </div>
      <p className="font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
    </Card>
  );
}

export default StatCard;
