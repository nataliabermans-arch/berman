import type { Metadata } from "next";
import EcwidStore from "@/components/commerce/EcwidStore";

// The real (Ecwid-powered) shop. Gated by middleware under /preview, so it is
// private until you decide to make it public. It activates the moment
// NEXT_PUBLIC_ECWID_STORE_ID is set to your Ecwid store number.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop — Dr. Jennifer Berman",
  robots: { index: false, follow: false },
};

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(ellipse at 30% -5%, rgba(244,212,212,0.5) 0%, transparent 50%), #faf6f3",
  color: "#4a1c26",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const inner: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "clamp(24px, 5vw, 64px) clamp(18px, 5vw, 64px) 96px",
};

export default function Page() {
  const storeId = process.env.NEXT_PUBLIC_ECWID_STORE_ID?.trim();

  return (
    <main style={wrap}>
      <div style={inner}>
        <header style={{ marginBottom: "clamp(28px, 5vw, 52px)" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontSize: 28,
              fontWeight: 600,
              color: "#4a1c26",
              lineHeight: 1,
            }}
          >
            Dr. Jennifer Berman
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(74,28,38,0.6)",
              marginTop: 6,
            }}
          >
            Physician-formulated supplements
          </div>
        </header>

        {storeId ? (
          <EcwidStore storeId={storeId} />
        ) : (
          <div
            style={{
              border: "1px solid rgba(74,28,38,0.12)",
              borderRadius: 18,
              background: "rgba(255,255,255,0.7)",
              padding: "clamp(28px, 5vw, 48px)",
              maxWidth: 640,
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: "clamp(28px, 4vw, 40px)",
                margin: "0 0 12px",
                color: "#4a1c26",
              }}
            >
              The shop is ready for its store key.
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(74,28,38,0.72)",
                margin: 0,
              }}
            >
              Add your Ecwid <strong>Store ID</strong> to the environment as
              <code
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  background: "rgba(74,28,38,0.06)",
                  padding: "2px 7px",
                  borderRadius: 6,
                  margin: "0 4px",
                }}
              >
                NEXT_PUBLIC_ECWID_STORE_ID
              </code>
              and the live Ecwid storefront — catalog, cart, and checkout —
              renders here automatically.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
