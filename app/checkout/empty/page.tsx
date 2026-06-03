"use client";

import { motion } from "motion/react";
import { MeshGradient } from "@paper-design/shaders-react";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { BorderBeam } from "@/components/ui/border-beam";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";
const WINE = "#4a1c26";
const DEEP = "#8a3a44";
const CREAM = "#fff5f1";

export default function Page() {
  return (
    <main data-active="E">
      <section className="wf" data-id="E">
        <MeshGradient
          aria-hidden="true"
          colors={["#fff5f1", "#ffeae0", "#f4d4d4", "#f4a3aa"]}
          speed={0.6}
          distortion={0.6}
          swirl={0.4}
          width="100vw"
          height="100vh"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <SiteNav showCart />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "82vh",
            padding: "200px 6vw 120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: WINE,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: MONO,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: DEEP,
              marginBottom: 28,
            }}
          >
            Checkout
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1.04,
              letterSpacing: "-0.012em",
              color: WINE,
              margin: 0,
              maxWidth: 880,
            }}
          >
            Your cart is{" "}
            <em style={{ color: DEEP, fontStyle: "italic" }}>empty.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(18px, 1.5vw, 22px)",
              lineHeight: 1.55,
              color: "rgba(74,28,38,0.78)",
              maxWidth: 560,
              margin: "28px auto 0",
            }}
          >
            Take a look at the line.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.34, ease: EASE }}
            style={{ marginTop: 48 }}
          >
            <a
              href="/services/supplements/"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "20px 36px",
                borderRadius: 999,
                background:
                  "linear-gradient(180deg,#5a2030 0%,#4a1c26 60%,#3a141d 100%)",
                color: CREAM,
                textDecoration: "none",
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: 12,
                overflow: "hidden",
                border: "1px solid rgba(244,163,170,0.35)",
              }}
            >
              <BorderBeam
                size={80}
                duration={8}
                colorFrom="#f4a3aa"
                colorTo="#d97580"
                borderWidth={1.5}
              />
              <span style={{ position: "relative", zIndex: 2 }}>
                Shop the line
              </span>
              <span style={{ position: "relative", zIndex: 2 }}>→</span>
            </a>
          </motion.div>
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}
