"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  MeshGradient,
  GrainGradient,
  NeuroNoise,
  Warp,
} from "@paper-design/shaders-react";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { BorderBeam } from "@/components/ui/border-beam";
import ReadyToBeHeardSection from "@/components/sections/ReadyToBeHeardSection";
import BermanBriefSection from "@/components/sections/BermanBriefSection";
import { BOOKS, type Book } from "@/lib/books";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 1, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const slideInLeft = (delay = 0, x = 60) => ({
  initial: { opacity: 1, x: -x },
  whileInView: { opacity: 1, x: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.7, delay, ease: EASE },
});

const slideInRight = (delay = 0, x = 60) => ({
  initial: { opacity: 1, x },
  whileInView: { opacity: 1, x: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.7, delay, ease: EASE },
});

const eyebrowDark: React.CSSProperties = {
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: 12,
  color: "#f4a3aa",
  marginBottom: 24,
};

const eyebrowLight: React.CSSProperties = {
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: 12,
  color: "#8a3a44",
  marginBottom: 24,
};

const PRESS_WALL: { quote: string; outlet: string }[] = [
  {
    quote:
      "Required reading. The first serious medical book to take women's sexual health as seriously as it takes the cardiology of middle-aged men.",
    outlet: "The New York Times Book Review",
  },
  {
    quote:
      "An unflinching, plainly written look at what medicine has gotten wrong about women — and what to do about it.",
    outlet: "Oprah Magazine",
  },
  {
    quote:
      "The most useful book about female sexuality published in a generation. It assumes its reader is intelligent.",
    outlet: "Glamour",
  },
  {
    quote:
      "Specific, unembarrassed, grounded in twenty years of seeing patients who had been failed by the standard of care.",
    outlet: "Today Show",
  },
  {
    quote:
      "Two physicians, one diagnostic eye, and a refusal to let the conversation stay polite.",
    outlet: "Good Morning America",
  },
  {
    quote:
      "Reads less like a self-help book and more like the consultation you wish you could have had.",
    outlet: "Vogue",
  },
];

function FeaturedBook({ book, flip }: { book: Book; flip: boolean }) {
  const paragraphs = book.description.split("\n").filter(Boolean);
  const imageBlock = (
    <motion.div
      {...(flip ? slideInRight(0.05) : slideInLeft(0.05))}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 520,
      }}
    >
      <img
        src={book.coverImage}
        alt={`${book.title} — book cover`}
        loading="lazy"
        style={{
          maxWidth: "100%",
          maxHeight: 560,
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 6,
          boxShadow:
            "0 32px 64px -16px rgba(0,0,0,0.55), 0 8px 24px -8px rgba(74,28,38,0.5)",
          transform: "rotate(-1.2deg)",
        }}
      />
    </motion.div>
  );

  const italicTitle = book.title
    .split(book.italicWord)
    .reduce<React.ReactNode[]>((acc, part, idx, arr) => {
      acc.push(part);
      if (idx < arr.length - 1) {
        acc.push(
          <em
            key={`em-${idx}`}
            style={{ color: "#8a3a44", fontStyle: "italic" }}
          >
            {book.italicWord}
          </em>,
        );
      }
      return acc;
    }, []);

  const copyBlock = (
    <div>
      <motion.div {...fadeUp(0.1, 16)} style={eyebrowLight}>
        {book.publishedYear} · {book.publisher}
      </motion.div>
      <motion.h2
        {...fadeUp(0.18, 24)}
        style={{
          fontFamily: SERIF,
          fontWeight: 300,
          fontSize: "clamp(40px, 5.4vw, 80px)",
          lineHeight: 0.96,
          letterSpacing: "-0.02em",
          color: "#4a1c26",
          margin: 0,
        }}
      >
        {italicTitle}
      </motion.h2>
      {book.subtitle && (
        <motion.p
          {...fadeUp(0.26, 16)}
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(18px, 1.6vw, 22px)",
            lineHeight: 1.45,
            color: "#8a3a44",
            margin: "20px 0 0",
            maxWidth: "44ch",
          }}
        >
          {book.subtitle}
        </motion.p>
      )}
      <div style={{ marginTop: 32 }}>
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            {...fadeUp(0.32 + i * 0.06, 14)}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(17px, 1.35vw, 19px)",
              lineHeight: 1.65,
              color: "#4a1c26",
              margin: "0 0 18px",
              maxWidth: "62ch",
            }}
          >
            {para}
          </motion.p>
        ))}
      </div>

      <motion.div
        {...fadeUp(0.5, 14)}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 32,
        }}
      >
        {book.awards.map((a) => (
          <span
            key={a}
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a3a44",
              padding: "8px 14px",
              border: "1px solid rgba(138,58,68,0.3)",
              borderRadius: 999,
              background: "rgba(255,245,241,0.55)",
            }}
          >
            {a}
          </span>
        ))}
      </motion.div>

      <motion.div
        {...fadeUp(0.6, 14)}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          marginTop: 36,
        }}
      >
        {book.buyLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 28px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #4a1c26 0%, #6a2230 50%, #8a3a44 100%)",
              color: "#fff5f1",
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              overflow: "hidden",
              boxShadow: "0 18px 40px -16px rgba(74,28,38,0.55)",
            }}
          >
            <BorderBeam
              size={80}
              duration={8}
              colorFrom="#f4a3aa"
              colorTo="#d97580"
              borderWidth={1.5}
            />
            <span className="relative z-10">{link.label} →</span>
          </a>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        padding:
          "clamp(80px, 10vh, 140px) clamp(24px, 4vw, 56px) clamp(80px, 10vh, 140px)",
      }}
      id={book.slug}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1fr)",
          gap: "clamp(40px, 6vw, 96px)",
          alignItems: "center",
        }}
      >
        {flip ? copyBlock : imageBlock}
        {flip ? imageBlock : copyBlock}
      </div>
    </div>
  );
}

export default function BooksClient() {
  const excerptBook = BOOKS[0];
  const dropCapCss = `
    .e-books-excerpt-prose::first-letter {
      font-family: ${SERIF};
      font-style: italic;
      font-size: clamp(72px, 8vw, 112px);
      line-height: 0.85;
      float: left;
      padding: 8px 14px 0 0;
      color: #4a1c26;
      font-weight: 400;
    }
  `;

  return (
    <section className="wf" data-id="E">
      <style dangerouslySetInnerHTML={{ __html: dropCapCss }} />

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

      {/* 1. HERO */}
      <div
        className="e-rounded-section rounded-b-3xl rounded-t-none"
        style={{
          position: "relative",
          minHeight: "82vh",
          padding: "180px clamp(24px, 4vw, 56px) 120px",
          color: "#4a1c26",
          overflow: "hidden",
        }}
      >
        <SiteNav />
        <Warp
          aria-hidden="true"
          colors={["#ffeae0", "#f4d4d4", "#f4a3aa", "#fff5f1"]}
          speed={0.4}
          scale={1.2}
          rotation={-4}
          distortion={0.18}
          swirl={0.6}
          swirlIterations={6}
          shape="checks"
          shapeScale={0.22}
          style={{
            position: "absolute",
            inset: "-20% -20% -10%",
            width: "140%",
            height: "140%",
            zIndex: 0,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <GrainGradient
          aria-hidden="true"
          colors={["#fff5f1", "#ffeae0", "#f4d4d4", "#f4a3aa"]}
          colorBack="#fff5f1"
          shape="sphere"
          speed={0.85}
          scale={0.8}
          noise={0.3}
          softness={0.85}
          intensity={0.32}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "end",
          }}
        >
          <div>
            <motion.div
              {...fadeUp(0.05, 16)}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(74,28,38,0.7)",
                marginBottom: 28,
              }}
            >
              <span style={{ color: "#4a1c26" }}>Books</span> · 02 / 04 ·
              Two-time New York Times bestselling author
            </motion.div>
            <motion.h1
              {...fadeUp(0.15, 24)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(56px, 8.6vw, 132px)",
                lineHeight: 0.94,
                letterSpacing: "-0.025em",
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Books that
              <em
                style={{
                  display: "block",
                  fontStyle: "italic",
                  color: "#8a3a44",
                }}
              >
                changed
              </em>
              the conversation.
            </motion.h1>
          </div>
          <motion.div
            {...fadeUp(0.32, 18)}
            style={{ paddingBottom: 12, maxWidth: 520 }}
          >
            <p
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(18px, 1.6vw, 22px)",
                lineHeight: 1.55,
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Two New York Times bestsellers, written for the women whose
              doctors weren&apos;t trained to help them — and the partners,
              clinicians, and friends who needed a vocabulary that did not yet
              exist. Together, they helped name the modern field of{" "}
              <em style={{ color: "#8a3a44" }}>female sexual medicine</em> and
              made arousal physiology a household-vocabulary topic for the first
              time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 2. FEATURED BOOK 1 — For Women Only (image left, copy right) */}
      <FeaturedBook book={BOOKS[0]} flip={false} />

      {/* 3. FEATURED BOOK 2 — Secrets... (copy left, image right) */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "2rem",
        }}
      >
        <NeuroNoise
          aria-hidden="true"
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
            borderRadius: "inherit",
          }}
        />
        <FeaturedBook book={BOOKS[1]} flip={true} />
      </div>

      {/* 4. PRESS WALL */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(80px, 10vh, 140px) clamp(24px, 4vw, 56px) clamp(80px, 10vh, 140px)",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1320,
            margin: "0 auto",
          }}
        >
          <motion.div {...fadeUp(0, 16)} style={eyebrowLight}>
            Press
          </motion.div>
          <motion.h2
            {...fadeUp(0.1, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(44px, 5.6vw, 88px)",
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              color: "#4a1c26",
              margin: "0 0 64px",
              maxWidth: "16ch",
            }}
          >
            What <em style={{ color: "#8a3a44" }}>they wrote.</em>
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 360px))",
              gap: 24,
              justifyContent: "center",
            }}
          >
            {PRESS_WALL.map((p, i) => (
              <motion.figure
                key={p.outlet}
                {...fadeUp(0.12 + i * 0.06, 24)}
                style={{
                  position: "relative",
                  background: "rgba(255,245,241,0.65)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(217,155,161,0.35)",
                  borderRadius: 22,
                  padding: "36px 32px 32px",
                  margin: 0,
                  boxShadow:
                    "0 18px 44px -22px rgba(74,28,38,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 24,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 64,
                    lineHeight: 1,
                    color: "#d99ba1",
                    fontWeight: 400,
                  }}
                >
                  &ldquo;
                </span>
                <blockquote
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 22,
                    lineHeight: 1.45,
                    color: "#4a1c26",
                    margin: "28px 0 24px",
                  }}
                >
                  {p.quote}
                </blockquote>
                <figcaption
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#8a3a44",
                  }}
                >
                  — {p.outlet}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>

      {/* 5. EXCERPT */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding:
            "clamp(80px, 10vh, 140px) clamp(24px, 4vw, 56px) clamp(80px, 10vh, 140px)",
          overflow: "hidden",
          borderRadius: "2rem",
        }}
      >
        <NeuroNoise
          aria-hidden="true"
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
            borderRadius: "inherit",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 920,
            margin: "0 auto",
          }}
        >
          <motion.div {...fadeUp(0, 16)} style={eyebrowLight}>
            From the page · {excerptBook.title}
          </motion.div>
          <motion.h2
            {...fadeUp(0.1, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(44px, 5.6vw, 88px)",
              lineHeight: 0.96,
              letterSpacing: "-0.02em",
              color: "#4a1c26",
              margin: "0 0 56px",
            }}
          >
            An <em style={{ color: "#8a3a44" }}>excerpt.</em>
          </motion.h2>

          <motion.div
            {...fadeUp(0.2, 24)}
            className="e-books-excerpt-prose"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(19px, 1.55vw, 21px)",
              lineHeight: 1.7,
              color: "#4a1c26",
              maxWidth: "64ch",
            }}
          >
            {excerptBook.excerpt
              .split("\n")
              .filter(Boolean)
              .map((para, i) => (
                <p
                  key={i}
                  style={{
                    margin: i === 0 ? "0 0 22px" : "0 0 22px",
                  }}
                >
                  {para}
                </p>
              ))}
          </motion.div>

          <motion.div
            {...fadeUp(0.42, 14)}
            style={{
              marginTop: 40,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a3a44",
            }}
          >
            — {excerptBook.title}, {excerptBook.publisher},{" "}
            {excerptBook.publishedYear}
          </motion.div>
        </div>
      </div>

      {/* 6. WHY THESE BOOKS STILL MATTER */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(80px, 10vh, 140px) clamp(24px, 4vw, 56px) clamp(80px, 10vh, 140px)",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.7fr) minmax(0, 1fr)",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "start",
          }}
        >
          <div>
            <motion.div {...fadeUp(0, 16)} style={eyebrowLight}>
              Twenty years later
            </motion.div>
            <motion.h2
              {...fadeUp(0.1, 24)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(40px, 5vw, 76px)",
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Why they <em style={{ color: "#8a3a44" }}>still matter.</em>
            </motion.h2>
            <motion.div
              {...fadeUp(0.18, 18)}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 32,
                marginBottom: 36,
              }}
            >
              <Image
                src="/images/dr-berman/headshot-portrait.webp"
                alt="Dr. Jennifer Berman"
                width={1400}
                height={2113}
                sizes="(min-width: 1024px) 320px, 70vw"
                style={{
                  width: "100%",
                  maxWidth: 320,
                  height: "auto",
                  borderRadius: 24,
                  border: "1px solid rgba(255,245,241,0.55)",
                  boxShadow:
                    "0 28px 72px -34px rgba(74,28,38,0.45), 0 10px 28px -18px rgba(74,28,38,0.4)",
                }}
              />
            </motion.div>
          </div>
          <div>
            <motion.p
              {...fadeUp(0.2, 18)}
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(18px, 1.45vw, 21px)",
                lineHeight: 1.65,
                color: "#4a1c26",
                margin: "0 0 22px",
              }}
            >
              The Women&apos;s Health Initiative results have been re-evaluated.
              Bioidentical hormone therapy has moved from fringe to standard of
              care for the patients it&apos;s indicated for. The vocabulary
              these books gave women — vascular insufficiency, androgen decline,
              arousal-disorder differential — is now the vocabulary{" "}
              <em style={{ color: "#8a3a44" }}>any</em> reasonable clinic uses.
              That part has changed.
            </motion.p>
            <motion.p
              {...fadeUp(0.3, 18)}
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(18px, 1.45vw, 21px)",
                lineHeight: 1.65,
                color: "#4a1c26",
                margin: "0 0 22px",
              }}
            >
              What hasn&apos;t changed is the fifteen-minute appointment, the
              referral to a therapist, the panel that wasn&apos;t drawn, the
              SSRI no one warned would do this. Women still walk into clinics
              with sexual complaints and walk out with the same answers their
              mothers got. The infrastructure of care still lags the science by
              twenty years.
            </motion.p>
            <motion.p
              {...fadeUp(0.4, 18)}
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(18px, 1.45vw, 21px)",
                lineHeight: 1.65,
                color: "#4a1c26",
                margin: 0,
              }}
            >
              These two books are still in print because the gap between what
              medicine knows and what most women are offered is still wide
              enough to need a bridge. They are the bridge most patients reach
              for first.
            </motion.p>
          </div>
        </div>
      </div>

      <ReadyToBeHeardSection />
      <BermanBriefSection />
      <SiteFooter />
    </section>
  );
}
