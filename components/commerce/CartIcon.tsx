"use client";

import { useEffect, useState } from "react";
import { useCartStore, totalItems } from "@/lib/commerce/cart-store";

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = useCartStore((s) => s.open);
  const count = useCartStore(totalItems);
  const displayCount = mounted ? count : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart${displayCount > 0 ? ` (${displayCount} items)` : ""}`}
      style={{
        position: "relative",
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "transparent",
        border: "1px solid rgba(217,155,161,0.4)",
        color: "#fff5f1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        marginRight: 12,
        padding: 0,
        transition: "border-color 0.18s ease, transform 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(244,163,170,0.85)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(217,155,161,0.4)";
      }}
    >
      <svg
        width="18"
        height="20"
        viewBox="0 0 18 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 6h14l-1.2 11.4a1.6 1.6 0 0 1-1.6 1.4H4.8a1.6 1.6 0 0 1-1.6-1.4L2 6Z" />
        <path d="M6 6V4.5a3 3 0 0 1 6 0V6" />
      </svg>
      {displayCount > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 9,
            background: "#d97580",
            color: "#fff5f1",
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 0 0 2px rgba(26,10,16,0.6)",
          }}
        >
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </button>
  );
}
