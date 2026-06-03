"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { GrainGradient, MeshGradient } from "@paper-design/shaders-react";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { BorderBeam } from "@/components/ui/border-beam";
import PageTail from "@/app/services/_page-tail";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";
const CREAM = "#fff5f1";
const ROSE_LIGHT = "#f4a3aa";

function SuccessBody() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? undefined;

  return (
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

      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "82vh",
          padding: "180px 6vw 120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: CREAM,
          overflow: "hidden",
        }}
      >
        <SiteNav showCart />
        <GrainGradient
          colors={["#a13a48", "#6a2230", "#1a0a10"]}
          colorBack="#1a0a10"
          shape="sphere"
          speed={1.2}
          scale={0.5}
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
          }}
        />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 880 }}>
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
              color: ROSE_LIGHT,
              marginBottom: 28,
            }}
          >
            Confirmed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(48px, 7.4vw, 108px)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              color: CREAM,
              margin: 0,
            }}
          >
            Order{" "}
            <em style={{ color: ROSE_LIGHT, fontStyle: "italic" }}>
              received.
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: "rgba(255,245,241,0.88)",
              maxWidth: 660,
              margin: "32px auto 0",
            }}
          >
            Thank you, friend. Your order is in our queue. We&apos;ll reach out
            within 24 hours to confirm and arrange payment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.34, ease: EASE }}
            style={{
              marginTop: 56,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              alignItems: "center",
            }}
          >
            {orderId ? (
              <div
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: 12,
                  color: CREAM,
                  background: "rgba(255,245,241,0.08)",
                  border: "1px solid rgba(244,163,170,0.35)",
                  padding: "12px 22px",
                  borderRadius: 999,
                }}
              >
                Order ID:{" "}
                <span style={{ color: ROSE_LIGHT, marginLeft: 8 }}>
                  {orderId}
                </span>
              </div>
            ) : null}
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(255,245,241,0.78)",
              }}
            >
              Questions?{" "}
              <a
                href="mailto:concierge@bermanwomenswellness.com"
                style={{
                  color: ROSE_LIGHT,
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(244,163,170,0.5)",
                  paddingBottom: 2,
                }}
              >
                concierge@bermanwomenswellness.com
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.46, ease: EASE }}
            style={{
              marginTop: 56,
              display: "flex",
              gap: 24,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
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
                Continue shopping
              </span>
              <span style={{ position: "relative", zIndex: 2 }}>→</span>
            </a>
            <a
              href="/"
              style={{
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 11,
                color: ROSE_LIGHT,
                textDecoration: "none",
                borderBottom: "1px solid rgba(244,163,170,0.4)",
                paddingBottom: 4,
              }}
            >
              Return home →
            </a>
          </motion.div>
        </div>
      </div>

      <PageTail />
      <SiteFooter />
    </section>
  );
}

export default function Page() {
  return (
    <main data-active="E">
      <Suspense fallback={null}>
        <SuccessBody />
      </Suspense>
    </main>
  );
}
