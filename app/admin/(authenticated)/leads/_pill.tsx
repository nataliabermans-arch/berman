"use client";

import type { Lead } from "@/lib/concierge/types";

export type LeadStatus = Lead["status"];

export const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; color: string; label: string }
> = {
  new: {
    bg: "rgba(217, 155, 161, 0.28)",
    color: "#fff5f1",
    label: "New",
  },
  contacted: {
    bg: "rgba(244, 212, 212, 0.16)",
    color: "#f4d4d4",
    label: "Contacted",
  },
  booked: {
    bg: "rgba(150, 200, 160, 0.2)",
    color: "#cfeacd",
    label: "Booked",
  },
  closed: {
    bg: "rgba(255, 245, 241, 0.08)",
    color: "rgba(255, 245, 241, 0.55)",
    label: "Closed",
  },
};

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  const cfg = STATUS_STYLES[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.55rem",
        borderRadius: "999px",
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
