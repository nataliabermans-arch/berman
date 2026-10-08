import type { CSSProperties, ReactNode } from "react";

// The practice's Google Business listing, as Google knows it. Querying by the
// listing name + address makes the embed drop the pin on her actual profile.
const PLACE_QUERY =
  "Jennifer R. Berman, MD, 415 N Crescent Dr #355, Beverly Hills, CA 90210";

// The embed centers on the street address so the pin always lands mid-map;
// "Get directions" uses the listing name so Maps opens her business profile.
const ADDRESS_QUERY = "415 N Crescent Dr, Beverly Hills, CA 90210";

export const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  ADDRESS_QUERY,
)}&z=16&output=embed`;

export const MAP_DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  PLACE_QUERY,
)}`;

const SERIF = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
const MONO = "var(--font-dm-mono), ui-monospace, monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const WINE = "#4a1c26";
const DEEP = "#7a2233";

/** Bare map iframe — used inside existing cards (e.g. the contact page). */
export function LocationMapEmbed({ style }: { style?: CSSProperties }) {
  return (
    <iframe
      src={MAP_EMBED_SRC}
      title="Map: Berman Women's Wellness, 415 N. Crescent Drive, Suite 355, Beverly Hills"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minHeight: 260,
        border: 0,
        borderRadius: 14,
        ...style,
      }}
    />
  );
}

const ROSE = "#f4a3aa";
const CREAM = "#fff5f1";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "84px 1fr",
        gap: 14,
        padding: "14px 0",
        borderTop: "1px solid rgba(255,245,241,0.14)",
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: ROSE,
          paddingTop: 3,
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.55, color: CREAM }}>
        {children}
      </span>
    </div>
  );
}

const pillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "13px 22px",
  borderRadius: 999,
  fontFamily: MONO,
  fontSize: 11.5,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  textDecoration: "none",
};

/** "Visit the practice" panel: address, phone, hours, directions + the map. */
export default function LocationMap() {
  return (
    <section
      aria-labelledby="location-map-heading"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "clamp(28px, 5vw, 64px) clamp(12px, 3vw, 32px)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          borderRadius: "clamp(24px, 3vw, 40px)",
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(244,163,170,0.18) 0%, rgba(244,163,170,0) 55%), linear-gradient(140deg, #6b2a36 0%, #4a1c26 45%, #2a1216 100%)",
          boxShadow: "0 30px 70px rgba(46,26,30,0.28)",
          padding: "clamp(26px, 4.5vw, 56px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "clamp(26px, 4vw, 52px)",
          alignItems: "stretch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: ROSE,
              margin: "0 0 14px",
            }}
          >
            Visit the practice
          </p>
          <h2
            id="location-map-heading"
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(32px, 3.8vw, 50px)",
              lineHeight: 1.05,
              color: CREAM,
              margin: "0 0 24px",
            }}
          >
            Berman Women&apos;s Wellness,{" "}
            <em style={{ fontStyle: "italic", color: ROSE }}>Beverly Hills</em>
          </h2>
          <address style={{ fontStyle: "normal" }}>
            <InfoRow label="Address">
              415 N. Crescent Drive, Suite 355
              <br />
              Beverly Hills, CA 90210
            </InfoRow>
            <InfoRow label="Phone">
              <a href="tel:+13107720072" style={{ color: CREAM, textDecoration: "none" }}>
                (310) 772-0072
              </a>
            </InfoRow>
            <InfoRow label="Hours">Monday – Friday, 9:00 AM – 5:00 PM (PT)</InfoRow>
          </address>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
            <a
              href={MAP_DIRECTIONS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...pillBase, background: CREAM, color: WINE }}
            >
              Get directions →
            </a>
            <a
              href="tel:+13107720072"
              style={{ ...pillBase, border: "1px solid rgba(255,245,241,0.45)", color: CREAM }}
            >
              Call the office
            </a>
          </div>
        </div>
        <div
          style={{
            height: "clamp(300px, 34vw, 440px)",
            borderRadius: "clamp(18px, 2vw, 26px)",
            overflow: "hidden",
            border: "1px solid rgba(244,163,170,0.35)",
            background: "#f3e6e3",
          }}
        >
          <LocationMapEmbed
            style={{
              borderRadius: 0,
              minHeight: 0,
              height: "100%",
              filter: "saturate(0.55) sepia(0.12) contrast(1.02)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
