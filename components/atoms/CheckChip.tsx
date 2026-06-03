"use client";

import type { MouseEventHandler, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CheckChipProps {
  children: ReactNode;
  checked?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: ReactNode;
  className?: string;
}

/**
 * Compact selectable pill for filters and treatment interests.
 * Shows a check or dot indicator while preserving an optional custom icon.
 */
export function CheckChip({
  children,
  checked = false,
  onClick,
  icon,
  className,
}: CheckChipProps) {
  return (
    <Badge
      render={<button type="button" aria-pressed={checked} onClick={onClick} />}
      variant="outline"
      className={cn(
        "h-auto rounded-full border px-3 py-1.5 font-inter text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20",
        checked
          ? "border-line-rose bg-rose-50 text-rose-900 shadow-subtle"
          : "border-line bg-neutral-100 text-text-secondary hover:border-rose-200 hover:bg-neutral-50 hover:text-text-primary",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border text-[0.58rem] leading-none transition-colors",
          checked
            ? "border-rose-500 bg-rose-500 text-white"
            : "border-neutral-300 bg-neutral-0 text-neutral-500",
        )}
      >
        {icon ?? (checked ? "✓" : "")}
      </span>
      <span>{children}</span>
    </Badge>
  );
}

export default CheckChip;
