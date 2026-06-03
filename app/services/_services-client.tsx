"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MeshGradient,
  GrainGradient,
  NeuroNoise,
} from "@paper-design/shaders-react";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  SERVICES,
  OVERVIEW_HERO,
  OVERVIEW_INTRO,
  OVERVIEW_APPROACH,
  OVERVIEW_QUOTE,
} from "@/lib/services/content";
import PageTail from "./_page-tail";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

/* Split a headline on its italicWord and wrap the matched portion in <em>.
   Tone controls italic emphasis color: deep wine on light bg, light rose on dark bg. */
function ItalicHeadline({
  text,
  italicWord,
  tone = "light",
}: {
  text: string;
  italicWord: string;
  tone?: "light" | "dark";
}) {
  const idx = text.indexOf(italicWord);
  if (idx === -1) return <>{text}</>;
  const pre = text.slice(0, idx);
  const post = text.slice(idx + italicWord.length);
  const emColor = tone === "dark" ? "#f4a3aa" : "#8a3a44";
  return (
    <>
      {pre}
      <em style={{ color: emColor, fontStyle: "italic" }}>{italicWord}</em>
      {post}
    </>
  );
}

const ease = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const viewportOnce = { once: true, margin: "-80px" } as const;

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportOnce,
  transition: { duration: 0.6, delay, ease },
});

function ServicesOverviewClient() {
  return (
    <section className="wf" data-id="E">
      {/* Global ambient MeshGradient — fixed, behind every section. */}
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

      {/* 1. HERO — light atmospheric GrainGradient (with overlaid SiteNav) */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "78vh",
          padding: "180px 6vw 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#4a1c26",
        }}
      >
        <SiteNav />
        {/* Per-section shader: light cream/blush/rose grain for atmospheric depth */}
        <GrainGradient
          colors={["#ffeae0", "#f4d4d4", "#f4a3aa"]}
          colorBack="#fff5f1"
          shape="sphere"
          speed={0.9}
          scale={0.6}
          noise={0.4}
          softness={0.85}
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
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1080,
            width: "100%",
          }}
        >
          <motion.div
            {...fadeUp(0.05, 18)}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: 12,
              color: "#8a3a44",
              marginBottom: 28,
            }}
          >
            {OVERVIEW_HERO.eyebrow}
          </motion.div>
          <motion.h1
            {...fadeUp(0.15, 24)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1.04,
              letterSpacing: "-0.01em",
              color: "#4a1c26",
              margin: 0,
            }}
          >
            <ItalicHeadline
              text={OVERVIEW_HERO.headline}
              italicWord={OVERVIEW_HERO.italicWord}
            />
          </motion.h1>
          <motion.p
            {...fadeUp(0.28, 20)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: "#4a1c26",
              maxWidth: 760,
              margin: "32px auto 0",
              opacity: 0.92,
            }}
          >
            {OVERVIEW_HERO.sub}
          </motion.p>
          <motion.div
            {...fadeUp(0.4, 16)}
            style={{
              marginTop: 48,
              display: "flex",
              gap: 24,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/contact/"
              data-lead-open
              data-cta="open-form"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "18px 32px",
                borderRadius: 999,
                background: "#4a1c26",
                color: "#fff5f1",
                textDecoration: "none",
                fontFamily: "'DM Mono', ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 12,
                overflow: "hidden",
                transition: "transform 0.3s cubic-bezier(.2,.7,.2,1)",
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
                Ready to be heard?
              </span>
              <span
                aria-hidden="true"
                style={{ position: "relative", zIndex: 2 }}
              >
                →
              </span>
            </a>
            <a
              href="#index"
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 11,
                color: "#8a3a44",
                textDecoration: "none",
                borderBottom: "1px solid rgba(138,58,68,0.4)",
                paddingBottom: 4,
              }}
            >
              Explore each specialty →
            </a>
          </motion.div>
        </div>
      </div>

      {/* 2. INTRO STRIP — transparent over MeshGradient */}
      <div
        style={{
          position: "relative",
          padding: "120px 6vw 88px",
          textAlign: "center",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          <motion.div
            {...fadeUp(0.05, 16)}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: 12,
              color: "#8a3a44",
              marginBottom: 24,
            }}
          >
            {OVERVIEW_INTRO.eyebrow}
          </motion.div>
          <motion.h2
            {...fadeUp(0.15, 22)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(40px, 5.4vw, 72px)",
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              color: "#4a1c26",
              margin: 0,
            }}
          >
            <ItalicHeadline
              text={OVERVIEW_INTRO.headline}
              italicWord={OVERVIEW_INTRO.italicWord}
            />
          </motion.h2>
          <motion.p
            {...fadeUp(0.27, 18)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(19px, 1.5vw, 22px)",
              lineHeight: 1.55,
              color: "#4a1c26",
              marginTop: 28,
              opacity: 0.9,
            }}
          >
            {OVERVIEW_INTRO.sub}
          </motion.p>
        </div>
      </div>

      {/* 3. INDEX — typographic table of contents */}
      <div
        id="index"
        style={{
          position: "relative",
          padding: "96px 6vw 120px",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <motion.div
            {...fadeUp(0.05, 16)}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: 12,
              color: "#8a3a44",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            The Index · Six Specialties
          </motion.div>
          <motion.h3
            {...fadeUp(0.13, 22)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(34px, 4vw, 56px)",
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              color: "#4a1c26",
              margin: "0 0 56px",
              textAlign: "center",
            }}
          >
            What Dr. Berman <em>treats</em>.
          </motion.h3>
          <ul
            className="services-index-list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderTop: "1px solid rgba(74,28,38,0.18)",
            }}
          >
            {SERVICES.map((s, i) => (
              <motion.li
                className="services-index-row"
                key={s.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{
                  duration: 0.55,
                  delay: 0.06 + i * 0.08,
                  ease,
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(110px, 0.6fr) 1.6fr 1.4fr auto",
                  alignItems: "center",
                  gap: 24,
                  padding: "32px 8px",
                  borderBottom: "1px solid rgba(74,28,38,0.18)",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "clamp(22px, 2vw, 28px)",
                    color: "#8a3a44",
                    letterSpacing: "0.02em",
                  }}
                >
                  N° {s.num}
                </span>
                <a
                  href={`/services/${s.slug}`}
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: "clamp(28px, 2.8vw, 44px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.005em",
                    color: "#4a1c26",
                    textDecoration: "none",
                  }}
                >
                  <ItalicHeadline
                    text={s.name}
                    italicWord={s.name.split(" ").slice(-1)[0]}
                  />
                </a>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {s.treatmentChips.slice(0, 3).map((chip) => (
                    <span
                      key={chip}
                      style={{
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        fontSize: 10,
                        color: "#4a1c26",
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(74,28,38,0.22)",
                        background: "rgba(255,245,241,0.5)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <a
                  href={`/services/${s.slug}`}
                  aria-label={`Explore ${s.name}`}
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontSize: 11,
                    color: "#8a3a44",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>Open</span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Times New Roman', serif",
                      fontStyle: "italic",
                      fontSize: 22,
                      color: "#8a3a44",
                    }}
                  >
                    →
                  </span>
                </a>
              </motion.li>
            ))}
            {/* 7th row — Berman Supplements (product line, different CTA) */}
            <motion.li
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{
                duration: 0.55,
                delay: 0.06 + 6 * 0.08,
                ease,
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(110px, 0.6fr) 1.6fr 1.4fr auto",
                alignItems: "center",
                gap: 24,
                padding: "32px 8px",
                borderBottom: "1px solid rgba(74,28,38,0.18)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(22px, 2vw, 28px)",
                  color: "#8a3a44",
                  letterSpacing: "0.02em",
                }}
              >
                N° 07
              </span>
              <a
                href="/services/supplements/"
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontWeight: 400,
                  fontSize: "clamp(28px, 2.8vw, 44px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.005em",
                  color: "#4a1c26",
                  textDecoration: "none",
                }}
              >
                Berman{" "}
                <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                  Supplements
                </em>
              </a>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {["Hormone", "Libido", "Foundational"].map((chip) => (
                  <span
                    key={chip}
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontSize: 10,
                      color: "#4a1c26",
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(74,28,38,0.22)",
                      background: "rgba(255,245,241,0.5)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <a
                href="/services/supplements/"
                aria-label="Shop Berman Supplements"
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: 11,
                  color: "#8a3a44",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Shop</span>
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontSize: 22,
                    color: "#8a3a44",
                  }}
                >
                  →
                </span>
              </a>
            </motion.li>
          </ul>
        </div>
      </div>

      {/* 4. SPREADS — alternating editorial bands, one per specialty */}
      {SERVICES.map((s, i) => {
        const isOdd = i % 2 === 1;
        return (
          <div
            key={s.slug}
            className={isOdd ? "e-rounded-section" : undefined}
            style={{
              position: "relative",
              padding: "120px 6vw",
              color: "#4a1c26",
              overflow: "hidden",
            }}
          >
            {/* Alternating per-section shader: odd indices get a subtle NeuroNoise wash */}
            {isOdd && (
              <NeuroNoise
                colorBack="#fff5f1"
                colorMid="#fef0ee"
                colorFront="#fbd2d2"
                brightness={0.32}
                contrast={0.4}
                scale={1.15}
                speed={0.3}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
            )}
            <motion.div
              className="services-spread-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.55, ease }}
              style={{
                position: "relative",
                zIndex: 10,
                maxWidth: 1280,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 64,
                alignItems: "center",
              }}
            >
              {/* Image — left for even index, right for odd */}
              <motion.div
                initial={{ opacity: 0, x: isOdd ? 80 : -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, ease }}
                style={{
                  order: isOdd ? 2 : 1,
                  borderRadius: 24,
                  overflow: "hidden",
                  aspectRatio: "4 / 5",
                  background: "linear-gradient(135deg,#f4a3aa 0%,#d97580 100%)",
                  boxShadow:
                    "0 30px 80px -30px rgba(74,28,38,0.45), 0 8px 24px -8px rgba(74,28,38,0.25)",
                }}
              >
                <img
                  src={s.spreadImage}
                  alt={s.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isOdd ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                style={{ order: isOdd ? 1 : 2 }}
              >
                <div
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    fontSize: 12,
                    color: "#8a3a44",
                    marginBottom: 20,
                  }}
                >
                  N° {s.num} · {s.name}
                </div>
                <h3
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: "clamp(32px, 3.6vw, 52px)",
                    lineHeight: 1.06,
                    letterSpacing: "-0.005em",
                    color: "#4a1c26",
                    margin: "0 0 24px",
                  }}
                >
                  <ItalicHeadline
                    text={s.treatsHeading.text}
                    italicWord={s.treatsHeading.italicWord}
                  />
                </h3>
                <p
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: "clamp(18px, 1.4vw, 21px)",
                    lineHeight: 1.55,
                    color: "#4a1c26",
                    margin: "0 0 28px",
                    opacity: 0.92,
                  }}
                >
                  {s.spreadLede}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 36,
                  }}
                >
                  {s.treatmentChips.map((chip) => (
                    <span
                      key={chip}
                      style={{
                        fontFamily: "'DM Mono', ui-monospace, monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        fontSize: 10,
                        color: "#4a1c26",
                        padding: "7px 12px",
                        borderRadius: 999,
                        border: "1px solid rgba(74,28,38,0.22)",
                        background: "rgba(255,245,241,0.55)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <a
                  href={`/services/${s.slug}`}
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontSize: 11,
                    color: "#8a3a44",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid rgba(138,58,68,0.4)",
                    paddingBottom: 6,
                  }}
                >
                  <span>Explore {s.name}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        );
      })}

      {/* 5. APPROACH — dark wine GrainGradient sphere */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "140px 6vw 140px",
          color: "#fff5f1",
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
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.div
              {...fadeUp(0.05, 16)}
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 12,
                color: "#f4a3aa",
                marginBottom: 24,
              }}
            >
              {OVERVIEW_APPROACH.eyebrow}
            </motion.div>
            <motion.h2
              {...fadeUp(0.15, 22)}
              style={{
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                fontWeight: 400,
                fontSize: "clamp(36px, 4.6vw, 64px)",
                lineHeight: 1.06,
                letterSpacing: "-0.005em",
                color: "#fff5f1",
                margin: 0,
                maxWidth: 920,
                marginInline: "auto",
              }}
            >
              <ItalicHeadline
                text={OVERVIEW_APPROACH.headline}
                italicWord={OVERVIEW_APPROACH.italicWord}
                tone="dark"
              />
            </motion.h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {OVERVIEW_APPROACH.steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={viewportOnce}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.1,
                  ease,
                }}
                style={{
                  background: "rgba(255,245,241,0.08)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(244,163,170,0.28)",
                  borderRadius: 20,
                  padding: "32px 28px 36px",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: 56,
                    lineHeight: 1,
                    color: "#f4a3aa",
                    marginBottom: 20,
                  }}
                >
                  {step.num}
                </div>
                <h4
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: 28,
                    lineHeight: 1.15,
                    letterSpacing: "-0.005em",
                    color: "#fff5f1",
                    margin: "0 0 14px",
                  }}
                >
                  <ItalicHeadline
                    text={step.title}
                    italicWord={step.italicWord}
                    tone="dark"
                  />
                </h4>
                <p
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: 18,
                    lineHeight: 1.5,
                    color: "rgba(255,245,241,0.86)",
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. PULL QUOTE — light NeuroNoise (matches home e-quote dark block treatment) */}
      <div
        className="e-quote dark"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <NeuroNoise
          colorBack="#fff5f1"
          colorMid="#fef0ee"
          colorFront="#fbd2d2"
          brightness={0.35}
          contrast={0.4}
          scale={1.1}
          speed={0.3}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 10 }}>
          <motion.div
            className="mark"
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={viewportOnce}
          >
            &ldquo;
          </motion.div>
          <blockquote>
            {(() => {
              const body = OVERVIEW_QUOTE.body;
              const [a, b] = OVERVIEW_QUOTE.accentPhrases;
              const ai = body.indexOf(a);
              const bi = body.indexOf(b);
              const seg1 = body.slice(0, ai);
              const seg2 = body.slice(ai + a.length, bi);
              const seg3 = body.slice(bi + b.length);
              const words: Array<{ text: string; accent: boolean }> = [];
              seg1
                .split(/\s+/)
                .filter(Boolean)
                .forEach((w) => words.push({ text: w, accent: false }));
              a.split(/\s+/)
                .filter(Boolean)
                .forEach((w) => words.push({ text: w, accent: true }));
              seg2
                .split(/\s+/)
                .filter(Boolean)
                .forEach((w) => words.push({ text: w, accent: false }));
              b.split(/\s+/)
                .filter(Boolean)
                .forEach((w) => words.push({ text: w, accent: true }));
              seg3
                .split(/\s+/)
                .filter(Boolean)
                .forEach((w) => words.push({ text: w, accent: false }));
              return words.map((w, i) => (
                <motion.span
                  key={i}
                  className={w.accent ? "accent" : undefined}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.18 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  viewport={viewportOnce}
                  style={{ display: "inline-block", marginRight: "0.28em" }}
                >
                  {w.accent ? <em>{w.text}</em> : w.text}
                </motion.span>
              ));
            })()}
          </blockquote>
          <motion.div
            className="by"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={viewportOnce}
          >
            {OVERVIEW_QUOTE.attribution}
          </motion.div>
        </div>
      </div>

      {/* 7 + 8. PAGE TAIL — appointment CTA, then Berman Brief email capture */}
      <PageTail />

      {/* 9. FOOTER */}
      <SiteFooter />
    </section>
  );
}

export default ServicesOverviewClient;
