"use client";

import type { CSSProperties, ReactNode } from "react";
import type { OrderStatus } from "@/lib/commerce/types";

export const COLORS = {
  bg: "#1a0a10",
  cream: "#fff5f1",
  creamMuted: "rgba(255, 245, 241, 0.7)",
  creamFaint: "rgba(255, 245, 241, 0.5)",
  rose: "#d99ba1",
  roseSoft: "#f4d4d4",
  wineDeep: "#4a1c26",
  wineMid: "#6a2230",
  wineLine: "rgba(217, 155, 161, 0.18)",
  glassBg: "rgba(74, 28, 38, 0.4)",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { bg: string; color: string; label: string }> =
    {
      paid: {
        bg: "rgba(217, 155, 161, 0.18)",
        color: "#f4d4d4",
        label: "Paid",
      },
      awaiting_stripe_setup: {
        bg: "rgba(255, 245, 241, 0.08)",
        color: "rgba(255, 245, 241, 0.7)",
        label: "Awaiting Stripe",
      },
      pending_payment: {
        bg: "rgba(255, 245, 241, 0.08)",
        color: "rgba(255, 245, 241, 0.7)",
        label: "Pending Payment",
      },
      fulfilled: {
        bg: "rgba(120, 180, 140, 0.18)",
        color: "#bce0c5",
        label: "Fulfilled",
      },
      cancelled: {
        bg: "rgba(180, 90, 90, 0.22)",
        color: "#f4b8b8",
        label: "Cancelled",
      },
      refunded: {
        bg: "rgba(180, 130, 90, 0.18)",
        color: "#e8c8a8",
        label: "Refunded",
      },
    };
  const cfg = map[status] ?? map.pending_payment;
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

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: COLORS.glassBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${COLORS.wineLine}`,
        borderRadius: "10px",
        padding: "1.25rem 1.4rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: COLORS.rose,
      }}
    >
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "var(--font-cormorant), serif",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "2.5rem",
        lineHeight: 1.1,
        margin: 0,
        color: COLORS.cream,
      }}
    >
      {children}
    </h1>
  );
}

export function Money({ value }: { value: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-cormorant), serif",
        fontStyle: "italic",
      }}
    >
      {`$${value.toFixed(2)}`}
    </span>
  );
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function shortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
