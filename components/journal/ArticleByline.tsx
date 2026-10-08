"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

const SERIF = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const MONO = "var(--font-dm-mono), ui-monospace, monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const WINE = "#4a1c26";
const DEEP = "#7a2233";

const pill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 16px",
  borderRadius: 999,
  border: "1px solid rgba(138,58,68,0.35)",
  background: "rgba(255,245,241,0.75)",
  color: DEEP,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  lineHeight: 1,
};

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

/**
 * Top-of-article byline: date, read time and author as three buttons.
 * The author button opens a short About popup linking to the full bio.
 */
export default function ArticleByline({
  publishedAt,
  dateLabel,
  readTime,
}: {
  publishedAt: string;
  dateLabel: string;
  readTime: number;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <div
        className="article-byline"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginTop: 36,
        }}
      >
        <span style={pill}>
          <CalendarIcon />
          <time dateTime={publishedAt}>{dateLabel}</time>
        </span>
        <span style={pill}>
          <ClockIcon />
          {readTime} min read
        </span>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            ...pill,
            cursor: "pointer",
            background: WINE,
            borderColor: WINE,
            color: "#fff5f1",
          }}
        >
          <PersonIcon />
          Dr. Jennifer Berman, MD
        </button>
      </div>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(46,26,30,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-popup-name"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 460,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff7f3",
              borderRadius: 20,
              padding: "28px 26px 26px",
              boxShadow: "0 24px 60px rgba(46,26,30,0.35)",
              textAlign: "left",
            }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(138,58,68,0.3)",
                background: "transparent",
                color: WINE,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dr-berman/headshot-portrait.webp"
                alt="Dr. Jennifer Berman"
                width={72}
                height={72}
                style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", objectPosition: "center top" }}
              />
              <div>
                <p
                  id="author-popup-name"
                  style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.1, color: WINE, margin: 0 }}
                >
                  Dr. Jennifer Berman, MD
                </p>
                <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: DEEP, margin: "6px 0 0" }}>
                  Urologist · Berman Women&apos;s Wellness
                </p>
              </div>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: WINE, margin: "0 0 10px" }}>
              Urologist whose practice focuses on menopause and hormone therapy, female sexual medicine, and
              pelvic and urinary health. Co-founded UCLA&apos;s Female Sexual Medicine Center in 2001.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: WINE, margin: "0 0 20px" }}>
              Author of two New York Times bestsellers, <em>For Women Only</em> and{" "}
              <em>Secrets of the Sexually Satisfied Woman</em>, and founder of Berman Women&apos;s Wellness in
              Beverly Hills.
            </p>
            <Link
              href="/about/"
              style={{
                display: "inline-block",
                padding: "11px 20px",
                borderRadius: 999,
                background: WINE,
                color: "#fff5f1",
                fontFamily: MONO,
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Read full bio →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
