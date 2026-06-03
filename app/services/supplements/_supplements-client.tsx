"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  GrainGradient,
  MeshGradient,
  NeuroNoise,
} from "@paper-design/shaders-react";

import AddToCartButton from "@/components/commerce/AddToCartButton";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  SUPPLEMENT_BUNDLE,
  SUPPLEMENTS,
  SUPPLEMENTS_HERO,
  SUPPLEMENTS_PHILOSOPHY,
  type Supplement,
} from "@/lib/services/supplements";
import PageTail from "../_page-tail";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const priceToNumber = (price: string) => Number(price.replace(/[^0-9.]/g, ""));

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

function HeroHeadline({
  text,
  italicWord,
  tone,
}: {
  text: string;
  italicWord: string;
  tone: "light" | "dark";
}) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} style={{ display: "block" }}>
          <ItalicHeadline text={line} italicWord={italicWord} tone={tone} />
        </span>
      ))}
    </>
  );
}

const WINE_GLASS_BG =
  "linear-gradient(135deg, rgba(74,28,38,0.92) 0%, rgba(58,20,29,0.92) 100%)";

const floatingSupplementImage = (src: string) =>
  src.replace("/images/supplements/", "/images/supplements/floating/");

const CATEGORY_TONES: Record<
  Supplement["category"],
  { panel: string; glow: string; accent: string }
> = {
  Hormone: {
    panel:
      "linear-gradient(145deg, rgba(92,33,47,0.96), rgba(46,16,25,0.98))",
    glow: "rgba(244,163,170,0.34)",
    accent: "#f4a3aa",
  },
  Libido: {
    panel:
      "linear-gradient(145deg, rgba(101,36,48,0.96), rgba(52,19,31,0.98))",
    glow: "rgba(255,196,185,0.32)",
    accent: "#ffc4b9",
  },
  Gut: {
    panel:
      "linear-gradient(145deg, rgba(67,62,48,0.95), rgba(31,28,23,0.98))",
    glow: "rgba(201,188,142,0.32)",
    accent: "#d9c98d",
  },
  Foundational: {
    panel:
      "linear-gradient(145deg, rgba(74,28,38,0.96), rgba(25,10,16,0.98))",
    glow: "rgba(244,212,212,0.3)",
    accent: "#f4d4d4",
  },
  Stress: {
    panel:
      "linear-gradient(145deg, rgba(58,54,66,0.96), rgba(27,23,34,0.98))",
    glow: "rgba(207,198,232,0.28)",
    accent: "#cfc6e8",
  },
  Hair: {
    panel:
      "linear-gradient(145deg, rgba(72,42,55,0.96), rgba(33,17,26,0.98))",
    glow: "rgba(229,176,199,0.3)",
    accent: "#e5b0c7",
  },
  Metabolic: {
    panel:
      "linear-gradient(145deg, rgba(63,36,31,0.96), rgba(31,17,15,0.98))",
    glow: "rgba(226,165,132,0.3)",
    accent: "#e2a584",
  },
  Skincare: {
    panel:
      "linear-gradient(145deg, rgba(75,66,57,0.95), rgba(34,29,25,0.98))",
    glow: "rgba(239,222,193,0.34)",
    accent: "#efdec1",
  },
};

export default function SupplementsClient() {
  const heroProducts = [SUPPLEMENTS[0], SUPPLEMENTS[1], SUPPLEMENTS[3]];

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

      {/* HERO — dark wine, premium tone */}
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
          color: "#fff5f1",
        }}
      >
        <SiteNav />
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
        <div style={{ position: "relative", zIndex: 10, maxWidth: 980 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#f4a3aa",
              marginBottom: 32,
            }}
          >
            {SUPPLEMENTS_HERO.eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(48px, 7.4vw, 108px)",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              color: "#fff5f1",
              margin: 0,
            }}
          >
            <HeroHeadline
              text={SUPPLEMENTS_HERO.headline}
              italicWord={SUPPLEMENTS_HERO.italicWord}
              tone="dark"
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: "rgba(255,245,241,0.88)",
              maxWidth: 720,
              margin: "36px auto 0",
            }}
          >
            {SUPPLEMENTS_HERO.sub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.34, ease: EASE }}
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
              href="#shop"
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "20px 36px",
                borderRadius: 999,
                background:
                  "linear-gradient(180deg,#5a2030 0%,#4a1c26 60%,#3a141d 100%)",
                color: "#fff5f1",
                textDecoration: "none",
                fontFamily: "'DM Mono', ui-monospace, monospace",
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
            <a
              href="#philosophy"
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: 11,
                color: "#f4a3aa",
                textDecoration: "none",
                borderBottom: "1px solid rgba(244,163,170,0.4)",
                paddingBottom: 4,
              }}
            >
              How I choose ↓
            </a>
          </motion.div>
          <motion.div
            className="supplements-hero-shelf"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.46, ease: EASE }}
          >
            {heroProducts.map((product, i) => (
              <div
                key={product.slug}
                className="hero-shelf-item"
                style={
                  {
                    "--shelf-rotate": `${(i - 1) * 5}deg`,
                    "--shelf-y": `${i === 1 ? -10 : 8}px`,
                  } as CSSProperties
                }
              >
                <img
                  src={floatingSupplementImage(product.image)}
                  alt=""
                  aria-hidden="true"
                />
                <span>{product.category}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* FEATURED BUNDLE — flagship product */}
      <div
        id="shop"
        style={{
          position: "relative",
          padding: "120px 6vw 80px",
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
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#8a3a44",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            The flagship · Bundle
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(36px, 4.6vw, 64px)",
              lineHeight: 1.06,
              letterSpacing: "-0.01em",
              color: "#4a1c26",
              margin: "0 0 64px",
              textAlign: "center",
              maxWidth: 880,
              marginInline: "auto",
            }}
          >
            <ItalicHeadline
              text="Hormone Balance Essentials."
              italicWord="Essentials."
            />
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
              maxWidth: 1180,
              margin: "0 auto",
            }}
            className="bundle-grid"
          >
            <div
              className="bundle-media"
              style={{
                position: "relative",
                aspectRatio: "4 / 5",
                borderRadius: 24,
                overflow: "hidden",
                background: WINE_GLASS_BG,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(244,163,170,0.28)",
                boxShadow:
                  "0 40px 80px -30px rgba(74,28,38,0.55), 0 12px 28px -12px rgba(74,28,38,0.3)",
              }}
            >
              {/* subtle rose ambient glow behind the bottle */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 50% 55%, rgba(244,163,170,0.22) 0%, rgba(244,163,170,0) 60%)",
                  pointerEvents: "none",
                }}
              />
              <div aria-hidden="true" className="bundle-product-shadow" />
              <img
                src={floatingSupplementImage(SUPPLEMENT_BUNDLE.image)}
                alt={SUPPLEMENT_BUNDLE.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  position: "relative",
                  zIndex: 1,
                }}
                className="bundle-product-img"
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: 11,
                  color: "#8a3a44",
                  marginBottom: 24,
                }}
              >
                Foundational stack
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontWeight: 400,
                  fontSize: "clamp(36px, 4vw, 56px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.005em",
                  color: "#4a1c26",
                  margin: "0 0 24px",
                }}
              >
                The starter stack for{" "}
                <em
                  style={{
                    color: "#8a3a44",
                    fontStyle: "italic",
                  }}
                >
                  hormonal women.
                </em>
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                  fontWeight: 400,
                  fontSize: "clamp(18px, 1.4vw, 21px)",
                  lineHeight: 1.55,
                  color: "#4a1c26",
                  margin: "0 0 32px",
                  opacity: 0.9,
                }}
              >
                {SUPPLEMENT_BUNDLE.tagline}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  marginBottom: 36,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontSize: 36,
                    color: "#4a1c26",
                  }}
                >
                  {SUPPLEMENT_BUNDLE.price}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 10,
                    color: "rgba(74,28,38,0.55)",
                  }}
                >
                  Three bottles · 30-day supply
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 28,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <AddToCartButton
                  productSlug={SUPPLEMENT_BUNDLE.slug}
                  name={SUPPLEMENT_BUNDLE.name}
                  price={priceToNumber(SUPPLEMENT_BUNDLE.price)}
                  image={SUPPLEMENT_BUNDLE.image}
                />
                <Link
                  href={`/services/supplements/${SUPPLEMENT_BUNDLE.slug}`}
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
                  Read full description →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* PRODUCT GRID — luxury product cards */}
      <div
        className="supplements-shop-section"
        style={{
          position: "relative",
          padding: "60px 6vw 140px",
          color: "#4a1c26",
          overflow: "hidden",
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
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: 11,
              color: "#8a3a44",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Shop singles
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(34px, 4.4vw, 56px)",
              lineHeight: 1.06,
              letterSpacing: "-0.005em",
              color: "#4a1c26",
              margin: "0 0 64px",
              textAlign: "center",
              maxWidth: 880,
              marginInline: "auto",
            }}
          >
            Eight bottles,{" "}
            <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
              chosen with care.
            </em>
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 32,
            }}
          >
            {SUPPLEMENTS.map((product, i) => {
              const tone = CATEGORY_TONES[product.category];

              return (
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{
                    duration: 0.6,
                    delay: 0.06 + (i % 3) * 0.08,
                    ease: EASE,
                  }}
                  whileHover={{ y: -6 }}
                  className="supplement-card"
                  style={
                    {
                      "--supp-panel": tone.panel,
                      "--supp-glow": tone.glow,
                      "--supp-accent": tone.accent,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 24,
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, rgba(255,250,247,0.86), rgba(255,239,234,0.74))",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      border: "1px solid rgba(217,155,161,0.3)",
                      color: "inherit",
                      transition: "box-shadow 0.4s ease",
                      position: "relative",
                    } as CSSProperties
                  }
                >
                <Link
                  href={`/services/supplements/${product.slug}`}
                  aria-label={`View ${product.name} details`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                />
                <div
                  className="supplement-media"
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1.04",
                    background: "var(--supp-panel)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderBottom: "1px solid rgba(244,163,170,0.18)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 50% 55%, rgba(244,163,170,0.22) 0%, rgba(244,163,170,0) 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div aria-hidden="true" className="supplement-product-shadow" />
                  <img
                    src={floatingSupplementImage(product.image)}
                    alt={product.name}
                    style={{
                      width: "88%",
                      height: "88%",
                      objectFit: "contain",
                      transition: "transform 0.6s cubic-bezier(0.2,0.7,0.2,1)",
                      position: "relative",
                      zIndex: 1,
                    }}
                    className="supplement-img"
                  />
                </div>
                <div
                  style={{
                    padding: "32px 28px 28px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    position: "relative",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: 10,
                      color: "#8a3a44",
                      marginBottom: 14,
                    }}
                  >
                    {product.category}
                  </div>
                  <h3
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Times New Roman', serif",
                      fontWeight: 400,
                      fontSize: 32,
                      lineHeight: 1.05,
                      letterSpacing: "-0.005em",
                      color: "#4a1c26",
                      margin: "0 0 14px",
                    }}
                  >
                    <ItalicHeadline
                      text={product.name}
                      italicWord={product.italicWord}
                    />
                  </h3>
                  <p
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', 'Times New Roman', serif",
                      fontWeight: 400,
                      fontSize: 17,
                      lineHeight: 1.5,
                      color: "#4a1c26",
                      margin: "0 0 24px",
                      opacity: 0.85,
                      flex: 1,
                    }}
                  >
                    {product.tagline}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(74,28,38,0.15)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', 'Times New Roman', serif",
                        fontStyle: "italic",
                        fontSize: 24,
                        color: "#4a1c26",
                      }}
                    >
                      {product.price}
                    </span>
                    <div
                      style={{
                        position: "relative",
                        zIndex: 3,
                        pointerEvents: "auto",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <AddToCartButton
                        productSlug={product.slug}
                        name={product.name}
                        price={priceToNumber(product.price)}
                        image={product.image}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: 10,
                      color: "rgba(74,28,38,0.55)",
                    }}
                  >
                    View details →
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PHILOSOPHY — three rules with light NeuroNoise */}
      <div
        id="philosophy"
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "140px 6vw",
          color: "#4a1c26",
        }}
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
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.55, ease: EASE }}
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                fontSize: 11,
                color: "#8a3a44",
                marginBottom: 24,
              }}
            >
              {SUPPLEMENTS_PHILOSOPHY.eyebrow}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              style={{
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                fontWeight: 400,
                fontSize: "clamp(36px, 4.6vw, 64px)",
                lineHeight: 1.06,
                letterSpacing: "-0.005em",
                color: "#4a1c26",
                margin: 0,
                maxWidth: 920,
                marginInline: "auto",
              }}
            >
              <ItalicHeadline
                text={SUPPLEMENTS_PHILOSOPHY.headline}
                italicWord={SUPPLEMENTS_PHILOSOPHY.italicWord}
              />
            </motion.h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 28,
            }}
          >
            {SUPPLEMENTS_PHILOSOPHY.rules.map((rule, i) => (
              <motion.div
                key={rule.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.1,
                  ease: EASE,
                }}
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(217,155,161,0.35)",
                  borderRadius: 20,
                  padding: "36px 32px 40px",
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
                    color: "#8a3a44",
                    marginBottom: 24,
                  }}
                >
                  {rule.num}
                </div>
                <h4
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: 26,
                    lineHeight: 1.18,
                    letterSpacing: "-0.005em",
                    color: "#4a1c26",
                    margin: "0 0 16px",
                  }}
                >
                  <ItalicHeadline
                    text={rule.title}
                    italicWord={rule.italicWord}
                  />
                </h4>
                <p
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', 'Times New Roman', serif",
                    fontWeight: 400,
                    fontSize: 17,
                    lineHeight: 1.55,
                    color: "#4a1c26",
                    margin: 0,
                    opacity: 0.88,
                  }}
                >
                  {rule.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* PAGE TAIL — appointment CTA, then Berman Brief */}
      <PageTail />

      {/* FOOTER */}
      <SiteFooter />

      {/* Card hover treatment — image zoom + lift shadow */}
      <style jsx global>{`
        .supplements-hero-shelf {
          width: min(520px, 100%);
          margin: 58px auto 0;
          display: flex;
          align-items: end;
          justify-content: center;
          gap: clamp(12px, 2vw, 22px);
          pointer-events: none;
        }

        .hero-shelf-item {
          position: relative;
          width: clamp(82px, 8vw, 112px);
          min-height: clamp(114px, 11vw, 146px);
          display: grid;
          place-items: center;
          padding: 12px 10px 22px;
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255, 245, 241, 0.14), rgba(255, 245, 241, 0.04)),
            rgba(255, 245, 241, 0.05);
          border: 1px solid rgba(255, 245, 241, 0.18);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 24px 46px -32px rgba(0, 0, 0, 0.72);
          transform: translateY(var(--shelf-y)) rotate(var(--shelf-rotate));
        }

        .hero-shelf-item::after {
          content: "";
          position: absolute;
          left: 22%;
          right: 22%;
          bottom: 18px;
          height: 8px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.22);
          filter: blur(6px);
        }

        .hero-shelf-item img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: clamp(88px, 8.8vw, 120px);
          object-fit: contain;
          filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.22));
        }

        .hero-shelf-item span {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 8px;
          z-index: 2;
          overflow: hidden;
          color: rgba(255, 245, 241, 0.72);
          font-family: "DM Mono", ui-monospace, monospace;
          font-size: 8px;
          letter-spacing: 0.16em;
          line-height: 1.2;
          text-transform: uppercase;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bundle-media {
          isolation: isolate;
        }

        .bundle-media::after {
          content: "";
          position: absolute;
          inset: auto 12% 8% 12%;
          height: 18%;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.26);
          filter: blur(20px);
          transform: perspective(900px) rotateX(68deg);
          z-index: 0;
        }

        .bundle-product-shadow {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: 13%;
          height: 26px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.28);
          filter: blur(16px);
          z-index: 0;
        }

        .bundle-product-img {
          filter: drop-shadow(0 28px 32px rgba(0, 0, 0, 0.28));
          transform: translateY(-1%) scale(0.95);
        }

        .supplements-shop-section {
          background:
            linear-gradient(116deg, rgba(255, 245, 241, 0.62) 0%, rgba(255, 250, 247, 0.96) 46%, rgba(245, 219, 213, 0.72) 100%),
            linear-gradient(180deg, rgba(255, 245, 241, 0.92), rgba(255, 250, 247, 0.82));
        }

        .supplements-shop-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(90deg, rgba(74, 28, 38, 0.055) 1px, transparent 1px),
            linear-gradient(180deg, rgba(74, 28, 38, 0.04) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
        }

        .supplements-shop-section::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74, 28, 38, 0.2), transparent);
        }

        .supplement-card {
          isolation: isolate;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.76),
            0 22px 48px -34px rgba(74, 28, 38, 0.5);
        }

        .supplement-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.54), transparent 34%),
            linear-gradient(180deg, transparent 0%, rgba(74, 28, 38, 0.045) 100%);
          z-index: 0;
        }

        .supplement-media {
          isolation: isolate;
        }

        .supplement-media::before {
          content: "";
          position: absolute;
          inset: 16px;
          border-radius: 22px;
          border: 1px solid rgba(255, 245, 241, 0.14);
          background:
            linear-gradient(145deg, rgba(255, 245, 241, 0.14), transparent 42%),
            linear-gradient(315deg, rgba(0, 0, 0, 0.18), transparent 48%);
          z-index: 0;
        }

        .supplement-media::after {
          content: "";
          position: absolute;
          left: 16%;
          right: 16%;
          bottom: 13%;
          height: 28px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.26);
          filter: blur(16px);
          transform: perspective(800px) rotateX(64deg);
          z-index: 0;
        }

        .supplement-product-shadow {
          position: absolute;
          left: 20%;
          right: 20%;
          bottom: 18%;
          height: 18px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.24);
          filter: blur(14px);
          z-index: 0;
        }

        .supplement-img {
          filter: drop-shadow(0 26px 26px rgba(0, 0, 0, 0.26));
          transform: translateY(-1%);
        }

        .supplement-card:hover {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.84),
            0 34px 68px -24px rgba(74, 28, 38, 0.42),
            0 8px 20px -8px rgba(74, 28, 38, 0.22);
        }
        .supplement-card:hover .supplement-img {
          transform: translateY(-4%) scale(1.06);
        }
        @media (max-width: 880px) {
          .bundle-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }

          .supplements-hero-shelf {
            margin-top: 44px;
          }
        }

        @media (max-width: 560px) {
          .supplements-hero-shelf {
            display: none;
          }

          .hero-shelf-item {
            width: 31%;
            min-height: 94px;
            padding: 8px 6px 18px;
            border-radius: 14px;
          }

          .hero-shelf-item img {
            height: 72px;
          }

          .hero-shelf-item span {
            font-size: 7px;
          }
        }
      `}</style>
    </section>
  );
}
