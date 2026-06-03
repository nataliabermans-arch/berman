"use client";

import { motion } from "motion/react";
import { MeshGradient, GrainGradient } from "@paper-design/shaders-react";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTail from "../services/_page-tail";
import { STORIES, type PatientStory } from "@/lib/stories";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const slideInRight = (delay = 0, x = 80) => ({
  initial: { opacity: 0, x },
  whileInView: { opacity: 1, x: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

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

function renderItalicHeadline(headline: string, dark = false): React.ReactNode {
  const parts = headline.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em
          key={i}
          style={{
            fontStyle: "italic",
            color: dark ? "#f4a3aa" : "#8a3a44",
            fontWeight: 400,
          }}
        >
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function StaggeredQuote({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  return (
    <span aria-label={text}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const isItalic = w.toLowerCase().includes("five") || w === "one";
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.025, ease: EASE }}
            style={{ display: "inline-block" }}
          >
            {isItalic ? (
              <em style={{ color: "#f4a3aa", fontStyle: "italic" }}>{w}</em>
            ) : (
              w
            )}
          </motion.span>
        );
      })}
    </span>
  );
}

export default function StoriesClient() {
  const featured = STORIES.find((s) => s.featured) ?? STORIES[0];
  const grid = STORIES;

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

      {/* 1. HERO — light blush GrainGradient */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "78vh",
          padding: "180px clamp(24px, 4vw, 56px) 96px",
          color: "#4a1c26",
          overflow: "hidden",
        }}
      >
        <SiteNav />
        <GrainGradient
          aria-hidden="true"
          colors={["#fff5f1", "#ffeae0", "#f4d4d4"]}
          colorBack="#fff5f1"
          shape="sphere"
          speed={0.7}
          scale={0.7}
          noise={0.32}
          softness={0.85}
          intensity={0.32}
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
            maxWidth: 1100,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowLight}>
            Patient stories · 01 / {STORIES.length.toString().padStart(2, "0")}
          </motion.div>
          <motion.h1
            {...fadeUp(0.15, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(56px, 9vw, 144px)",
              lineHeight: 0.94,
              letterSpacing: "-0.025em",
              color: "#4a1c26",
              margin: 0,
            }}
          >
            In their{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "#8a3a44",
                fontWeight: 400,
              }}
            >
              own
            </em>{" "}
            words.
          </motion.h1>
          <motion.p
            {...fadeUp(0.32, 18)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(22px, 2.4vw, 32px)",
              lineHeight: 1.4,
              color: "#4a1c26",
              opacity: 0.85,
              maxWidth: 720,
              margin: "36px auto 0",
            }}
          >
            {STORIES.length} women, {STORIES.length} different concerns, one
            consistent thread — they were{" "}
            <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
              finally heard.
            </em>
          </motion.p>
        </div>
      </div>

      {/* 2. FEATURED STORY — Sarah */}
      <div
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
            gap: "clamp(40px, 6vw, 96px)",
            alignItems: "center",
          }}
        >
          <motion.div
            {...slideInRight(0.05, -60)}
            style={{
              position: "relative",
              aspectRatio: "3 / 4",
              width: "100%",
              maxWidth: 520,
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid rgba(74,28,38,0.18)",
              boxShadow:
                "0 60px 100px -30px rgba(74,28,38,0.32), 0 30px 60px -20px rgba(74,28,38,0.22)",
              background: "rgba(74,28,38,0.06)",
            }}
          >
            {featured.portraitImage ? (
              <img
                src={featured.portraitImage}
                alt={`${featured.patient.name}, ${featured.patient.age} — ${featured.patient.location}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(74,28,38,0.85), rgba(138,58,68,0.65))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffeae0",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 120,
                }}
              >
                {featured.patient.name.charAt(0)}
              </div>
            )}
            <span
              style={{
                position: "absolute",
                left: 18,
                bottom: 18,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,245,241,0.92)",
                background: "rgba(26,10,16,0.5)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,245,241,0.2)",
              }}
            >
              Featured · {featured.patient.location}
            </span>
          </motion.div>

          <div>
            <motion.div {...fadeUp(0.05, 16)} style={eyebrowLight}>
              Featured story · {featured.category}
            </motion.div>
            <div
              aria-hidden="true"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(120px, 16vw, 220px)",
                lineHeight: 0.7,
                color: "#8a3a44",
                opacity: 0.22,
                margin: "-24px 0 -32px",
              }}
            >
              &ldquo;
            </div>
            <motion.blockquote
              {...fadeUp(0.18, 22)}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(28px, 3.6vw, 52px)",
                lineHeight: 1.16,
                color: "#4a1c26",
                margin: "0 0 36px",
                padding: 0,
              }}
            >
              <StaggeredQuote text="I had been told for five years that everything was in my head. Dr. Berman ran one panel and changed my life in eight weeks." />
            </motion.blockquote>
            <motion.p
              {...fadeUp(0.32, 18)}
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(18px, 1.4vw, 22px)",
                lineHeight: 1.6,
                color: "rgba(74,28,38,0.86)",
                margin: "0 0 36px",
                maxWidth: 620,
              }}
            >
              {featured.excerpt}
            </motion.p>
            <motion.div
              {...fadeUp(0.42, 14)}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 18px",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#8a3a44",
                paddingTop: 22,
                borderTop: "1px solid rgba(74,28,38,0.15)",
              }}
            >
              <span>
                <b style={{ color: "#4a1c26", fontWeight: 600 }}>
                  {featured.patient.name}
                </b>
                , {featured.patient.age}
              </span>
              <span style={{ color: "#d99ba1" }}>·</span>
              <span>{featured.patient.location}</span>
              <span style={{ color: "#d99ba1" }}>·</span>
              <span>treated for {featured.treatedFor.join(", ")}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 3. STORIES GRID */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px) clamp(48px, 6vw, 80px)",
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "end",
              marginBottom: 64,
            }}
          >
            <div>
              <motion.div {...fadeUp(0.05, 16)} style={eyebrowLight}>
                More stories
              </motion.div>
              <motion.h2
                {...fadeUp(0.15, 24)}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: "clamp(44px, 6vw, 88px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.025em",
                  color: "#4a1c26",
                  margin: 0,
                }}
              >
                {STORIES.length} women.{" "}
                <em
                  style={{
                    color: "#8a3a44",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {STORIES.length} different
                </em>
                <br />
                doors in.
              </motion.h2>
            </div>
            <motion.p
              {...fadeUp(0.25, 18)}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(20px, 1.8vw, 26px)",
                lineHeight: 1.5,
                color: "#4a1c26",
                opacity: 0.85,
                maxWidth: 480,
                margin: 0,
              }}
            >
              Every patient arrived with a different question. The thread that
              connects them is the diagnostic conversation that finally
              happened.
            </motion.p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 22,
            }}
          >
            {grid.map((story, i) => (
              <motion.a
                key={story.slug}
                href={`#${story.slug}`}
                {...fadeUp(i * 0.05, 24)}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,245,241,0.72)",
                  border: "1px solid rgba(217,155,161,0.32)",
                  borderRadius: 18,
                  overflow: "hidden",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: "0 20px 40px -28px rgba(74,28,38,0.18)",
                }}
                className="story-card"
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4 / 5",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, rgba(74,28,38,0.78), rgba(138,58,68,0.55))",
                  }}
                >
                  {story.portraitImage ? (
                    <img
                      src={story.portraitImage}
                      alt={`${story.patient.name}, ${story.patient.age}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffeae0",
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: 96,
                        textShadow: "0 4px 24px rgba(26,10,16,0.4)",
                      }}
                    >
                      {story.patient.name.charAt(0)}
                    </div>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#f4a3aa",
                      background: "rgba(26,10,16,0.55)",
                      padding: "5px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(244,163,170,0.3)",
                    }}
                  >
                    {story.category}
                  </span>
                </div>
                <div style={{ padding: "22px 22px 24px" }}>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 400,
                      fontSize: "clamp(20px, 1.8vw, 26px)",
                      lineHeight: 1.18,
                      color: "#4a1c26",
                      letterSpacing: "-0.015em",
                      margin: "0 0 12px",
                    }}
                  >
                    {renderItalicHeadline(story.headline)}
                  </h3>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 400,
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: "rgba(74,28,38,0.78)",
                      margin: "0 0 18px",
                    }}
                  >
                    {story.excerpt.split(".")[0] + "."}
                  </p>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#8a3a44",
                      paddingTop: 14,
                      borderTop: "1px solid rgba(74,28,38,0.12)",
                    }}
                  >
                    <b style={{ color: "#4a1c26", fontWeight: 600 }}>
                      {story.patient.name}
                    </b>
                    , {story.patient.age} · {story.patient.location}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .story-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 30px 60px -28px rgba(74,28,38,0.28);
              }
            `,
          }}
        />
      </div>

      {/* 4. STORY DETAIL EXPANDED */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(48px, 6vw, 80px) clamp(24px, 4vw, 56px) clamp(96px, 12vw, 160px)",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowLight}>
            The full stories
          </motion.div>
          <motion.h2
            {...fadeUp(0.15, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(36px, 4.6vw, 64px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              color: "#4a1c26",
              margin: "0 0 64px",
              maxWidth: 760,
            }}
          >
            Read each one in{" "}
            <em
              style={{
                color: "#8a3a44",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              full.
            </em>
          </motion.h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(64px, 8vw, 112px)",
            }}
          >
            {STORIES.map((story, idx) => (
              <StoryDetail key={story.slug} story={story} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* 5. PRIVACY NOTE */}
      <div
        style={{
          position: "relative",
          padding:
            "clamp(64px, 8vw, 96px) clamp(24px, 4vw, 56px) clamp(96px, 12vw, 140px)",
          color: "#4a1c26",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowLight}>
            A note on privacy
          </motion.div>
          <motion.p
            {...fadeUp(0.15, 18)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(22px, 2.2vw, 30px)",
              lineHeight: 1.45,
              color: "#4a1c26",
              opacity: 0.9,
              margin: 0,
            }}
          >
            Names are real, written and shared with permission. Identifying
            medical detail has been kept{" "}
            <em style={{ color: "#8a3a44", fontStyle: "italic" }}>general</em>{" "}
            per HIPAA. If you would like to share your story, write to us.
          </motion.p>
        </div>
      </div>

      <PageTail />
      <SiteFooter />
    </section>
  );
}

function StoryDetail({ story, index }: { story: PatientStory; index: number }) {
  return (
    <motion.article
      id={story.slug}
      {...fadeUp(0.05, 32)}
      style={{
        scrollMarginTop: 120,
        display: "grid",
        gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)",
        gap: "clamp(28px, 4vw, 56px)",
        paddingTop: index === 0 ? 0 : "clamp(48px, 6vw, 80px)",
        borderTop: index === 0 ? "none" : "1px solid rgba(74,28,38,0.12)",
      }}
    >
      <aside>
        <div
          style={{
            position: "sticky",
            top: 120,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "3 / 4",
              width: "100%",
              maxWidth: 220,
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid rgba(74,28,38,0.18)",
              boxShadow: "0 30px 60px -30px rgba(74,28,38,0.28)",
              background:
                "linear-gradient(135deg, rgba(74,28,38,0.85), rgba(138,58,68,0.6))",
            }}
          >
            {story.portraitImage ? (
              <img
                src={story.portraitImage}
                alt={`${story.patient.name}, ${story.patient.age}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffeae0",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 80,
                }}
              >
                {story.patient.name.charAt(0)}
              </div>
            )}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a3a44",
              lineHeight: 1.6,
            }}
          >
            <b style={{ color: "#4a1c26", fontWeight: 600 }}>
              {story.patient.name}
            </b>
            , {story.patient.age}
            <br />
            {story.patient.location}
            <br />
            <span style={{ color: "#d99ba1" }}>—</span>
            <br />
            {story.category}
          </div>
        </div>
      </aside>

      <div style={{ maxWidth: 760 }}>
        <div style={eyebrowLight}>
          {String(index + 1).padStart(2, "0")} ·{" "}
          {story.treatedFor.slice(0, 2).join(" · ")}
        </div>
        <h3
          style={{
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#4a1c26",
            margin: "0 0 28px",
          }}
        >
          {renderItalicHeadline(story.headline)}
        </h3>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(20px, 1.8vw, 26px)",
            lineHeight: 1.45,
            color: "#8a3a44",
            margin: "0 0 32px",
            paddingLeft: 20,
            borderLeft: "2px solid #d99ba1",
          }}
        >
          {story.excerpt}
        </p>
        <p
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: "clamp(18px, 1.5vw, 21px)",
            lineHeight: 1.65,
            color: "#4a1c26",
            margin: "0 0 32px",
          }}
        >
          {story.body}
        </p>
        <div
          style={{
            padding: "22px 26px",
            borderRadius: 14,
            background: "rgba(255,245,241,0.7)",
            border: "1px solid rgba(217,155,161,0.4)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 20px 40px -28px rgba(74,28,38,0.18)",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8a3a44",
              marginBottom: 8,
            }}
          >
            Outcome
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(17px, 1.4vw, 20px)",
              lineHeight: 1.5,
              color: "#4a1c26",
              margin: 0,
            }}
          >
            {story.outcome}
          </p>
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {story.treatedFor.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8a3a44",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(138,58,68,0.28)",
                background: "rgba(255,245,241,0.4)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
