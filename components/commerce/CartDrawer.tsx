"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GrainGradient } from "@paper-design/shaders-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { useCartStore, subtotal, totalItems } from "@/lib/commerce/cart-store";
import type { CartLine } from "@/lib/commerce/types";

const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const total = useCartStore(subtotal);
  const count = useCartStore(totalItems);

  // lock body scroll while open
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, mounted]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#1a0a10",
              zIndex: 199,
              cursor: "pointer",
            }}
            aria-hidden="true"
          />
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: "min(480px, 100vw)",
              background: "#4a1c26",
              color: "#fff5f1",
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-24px 0 60px rgba(0,0,0,0.45)",
            }}
          >
            <GrainGradient
              colors={["#a13a48", "#6a2230", "#1a0a10"]}
              colorBack="#1a0a10"
              shape="sphere"
              speed={1.4}
              scale={0.55}
              noise={0.5}
              softness={0.7}
              intensity={0.35}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                pointerEvents: "none",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <DrawerHeader count={count} onClose={close} />
              <DrawerBody
                lines={lines}
                onSetQuantity={setQuantity}
                onRemove={removeLine}
              />
              {lines.length > 0 && (
                <DrawerFooter total={total} onClose={close} />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerHeader({
  count,
  onClose,
}: {
  count: number;
  onClose: () => void;
}) {
  return (
    <header
      style={{
        padding: "28px 28px 18px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        borderBottom: "1px solid rgba(244,163,170,0.18)",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 36,
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.05,
            color: "#fff5f1",
          }}
        >
          Your <em style={{ color: "#f4a3aa" }}>cart</em>
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,245,241,0.6)",
          }}
        >
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close cart"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "transparent",
          border: "1px solid rgba(217,155,161,0.4)",
          color: "#fff5f1",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </header>
  );
}

function DrawerBody({
  lines,
  onSetQuantity,
  onRemove,
}: {
  lines: CartLine[];
  onSetQuantity: (slug: string, q: number) => void;
  onRemove: (slug: string) => void;
}) {
  if (lines.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "48px 32px",
          gap: 18,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontStyle: "italic",
            color: "#fff5f1",
          }}
        >
          Your cart is empty.
        </p>
        <a
          href="/services/supplements/"
          style={{
            color: "#f4a3aa",
            textDecoration: "none",
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            borderBottom: "1px solid rgba(244,163,170,0.5)",
            paddingBottom: 2,
          }}
        >
          Browse the line →
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 28px 24px",
      }}
    >
      {lines.map((line, idx) => (
        <CartLineRow
          key={line.productSlug}
          line={line}
          showDivider={idx < lines.length - 1}
          onSetQuantity={onSetQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function CartLineRow({
  line,
  showDivider,
  onSetQuantity,
  onRemove,
}: {
  line: CartLine;
  showDivider: boolean;
  onSetQuantity: (slug: string, q: number) => void;
  onRemove: (slug: string) => void;
}) {
  const lineTotal = line.price * line.quantity;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr auto",
        gap: 16,
        padding: "20px 0",
        borderBottom: showDivider ? "1px solid rgba(244,163,170,0.18)" : "none",
      }}
    >
      <div
        style={{
          width: 80,
          height: 100,
          borderRadius: 12,
          overflow: "hidden",
          background:
            "linear-gradient(160deg, #fff5f1 0%, #f6e5e2 60%, #ecd0cc 100%)",
          boxShadow: "inset 0 0 16px rgba(74,28,38,0.08)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={line.image}
          alt={line.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.2,
            color: "#fff5f1",
          }}
        >
          <em style={{ color: "#f4a3aa" }}>{line.name}</em>
        </h3>
        <QuantityStepper
          value={line.quantity}
          onChange={(q) => onSetQuantity(line.productSlug, q)}
        />
        <div
          style={{
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,245,241,0.6)",
          }}
        >
          {formatUSD(line.price)} each
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => onRemove(line.productSlug)}
          aria-label={`Remove ${line.name}`}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,245,241,0.55)",
            cursor: "pointer",
            padding: 4,
            display: "inline-flex",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f4a3aa";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,245,241,0.55)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22,
            fontStyle: "italic",
            color: "#fff5f1",
          }}
        >
          {formatUSD(lineTotal)}
        </div>
      </div>
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (q: number) => void;
}) {
  const btn = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "transparent",
    border: "1px solid rgba(217,155,161,0.4)",
    color: "#fff5f1",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  } as const;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
        style={btn}
      >
        −
      </button>
      <span
        style={{
          minWidth: 18,
          textAlign: "center",
          fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
          fontSize: 13,
          letterSpacing: "0.06em",
          color: "#fff5f1",
        }}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        style={btn}
      >
        +
      </button>
    </div>
  );
}

function DrawerFooter({
  total,
  onClose,
}: {
  total: number;
  onClose: () => void;
}) {
  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        padding: "20px 28px 28px",
        background: "rgba(26,10,16,0.55)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(244,163,170,0.22)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,245,241,0.7)",
          }}
        >
          Subtotal
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontStyle: "italic",
            color: "#fff5f1",
          }}
        >
          {formatUSD(total)}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,245,241,0.5)",
        }}
      >
        Tax + shipping calculated at checkout
      </p>
      <a
        href="/checkout"
        onClick={onClose}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "16px 28px",
          borderRadius: 999,
          background: "#4a1c26",
          color: "#fff5f1",
          textDecoration: "none",
          fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          overflow: "hidden",
          border: "1px solid rgba(244,163,170,0.3)",
        }}
      >
        <span style={{ position: "relative", zIndex: 2 }}>Checkout →</span>
        <BorderBeam
          size={80}
          duration={8}
          colorFrom="#f4a3aa"
          colorTo="#d97580"
          borderWidth={1.5}
        />
      </a>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,245,241,0.7)",
          cursor: "pointer",
          fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          padding: "4px 0",
        }}
      >
        Continue shopping
      </button>
    </footer>
  );
}
