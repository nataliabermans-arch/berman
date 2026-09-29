"use client";

import { useEffect, useState } from "react";

type SnipcartStore = {
  getState: () => { cart?: { items?: { count?: number } } };
  subscribe: (cb: () => void) => () => void;
};
type SnipcartGlobal = { store?: SnipcartStore };

/**
 * Cart button in the nav. Snipcart binds the open-cart behaviour to the
 * `snipcart-checkout` class, so there is no click handler of ours; the count
 * is read reactively from Snipcart's own store and the badge hides at zero.
 */
export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const bind = () => {
      const snipcart = (window as unknown as { Snipcart?: SnipcartGlobal })
        .Snipcart;
      const store = snipcart?.store;
      if (!store) return;
      const read = () =>
        setCount(store.getState().cart?.items?.count ?? 0);
      read();
      unsubscribe = store.subscribe(read);
    };

    if ((window as unknown as { Snipcart?: SnipcartGlobal }).Snipcart) bind();
    else document.addEventListener("snipcart.ready", bind, { once: true });

    return () => {
      unsubscribe?.();
      document.removeEventListener("snipcart.ready", bind);
    };
  }, []);

  return (
    <button
      type="button"
      className="snipcart-checkout"
      aria-label={`Open cart${count > 0 ? ` (${count} items)` : ""}`}
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
      {count > 0 && (
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
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
