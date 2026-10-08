import type { CSSProperties } from "react";

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

/** Full-width "find us" section: address, phone, directions + the map. */
export default function LocationMap() {
  return (
    <section
      aria-labelledby="location-map-heading"
      style={{
        position: "relative",
        zIndex: 2,
        background: "#fff7f3",
        padding: "clamp(56px, 8vw, 96px) 20px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(24px, 4vw, 48px)",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: DEEP,
              margin: "0 0 12px",
            }}
          >
            Visit the practice
          </p>
          <h2
            id="location-map-heading"
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(30px, 3.6vw, 44px)",
              lineHeight: 1.1,
              color: WINE,
              margin: "0 0 18px",
            }}
          >
            Berman Women&apos;s Wellness, Beverly Hills
          </h2>
          <address
            style={{
              fontStyle: "normal",
              fontFamily: SANS,
              fontSize: 16,
              lineHeight: 1.7,
              color: WINE,
            }}
          >
            415 N. Crescent Drive, Suite 355
            <br />
            Beverly Hills, CA 90210
            <br />
            <a href="tel:+13107720072" style={{ color: DEEP }}>
              (310) 772-0072
            </a>
            <br />
            Monday – Friday, 9:00 AM – 5:00 PM (PT)
          </address>
          <a
            href={MAP_DIRECTIONS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 22,
              padding: "12px 22px",
              borderRadius: 999,
              background: WINE,
              color: "#fff5f1",
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Get directions →
          </a>
        </div>
        <div
          style={{
            height: "clamp(280px, 34vw, 380px)",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(217,155,161,0.45)",
            boxShadow: "0 10px 30px rgba(74,28,38,0.10)",
          }}
        >
          <LocationMapEmbed style={{ borderRadius: 0, minHeight: 0 }} />
        </div>
      </div>
    </section>
  );
}
