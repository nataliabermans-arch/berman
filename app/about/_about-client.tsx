"use client";

import { motion } from "motion/react";
import {
  MeshGradient,
  GrainGradient,
  SmokeRing,
} from "@paper-design/shaders-react";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTail from "../services/_page-tail";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const slideInLeft = (delay = 0, x = 80) => ({
  initial: { opacity: 0, x: -x },
  whileInView: { opacity: 1, x: 0 },
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

const TIMELINE: { year: string; title: React.ReactNode; body: string }[] = [
  {
    year: "1995",
    title: (
      <>
        MD, <em style={{ color: "#8a3a44" }}>Boston University</em> School of
        Medicine
      </>
    ),
    body: "Graduated with research focus on urologic conditions in women — a field with almost no published literature at the time.",
  },
  {
    year: "1998",
    title: (
      <>
        Co-founder,{" "}
        <em style={{ color: "#8a3a44" }}>Female Sexual Medicine Center</em> at
        UCLA
      </>
    ),
    body: "The first dedicated clinical center for female sexual health in the United States, established with her sister Dr. Laura Berman.",
  },
  {
    year: "2001",
    title: (
      <>
        <em style={{ color: "#8a3a44" }}>For Women Only</em> — New York Times
        best-seller
      </>
    ),
    body: "Published with Henry Holt & Co. Spent 11 weeks on the NYT Best-Seller list. Became a defining text in the field.",
  },
  {
    year: "2005",
    title: (
      <>
        Secrets of the{" "}
        <em style={{ color: "#8a3a44" }}>Sexually Satisfied Woman</em>
      </>
    ),
    body: "Second NYT best-seller. Made female arousal physiology a household-vocabulary topic.",
  },
  {
    year: "2007",
    title: (
      <>
        Founded private practice,{" "}
        <em style={{ color: "#8a3a44" }}>Beverly Hills</em>
      </>
    ),
    body: "Opened The Berman Women's Wellness Center as a concierge medical practice on Wilshire Boulevard.",
  },
  {
    year: "2015",
    title: (
      <>
        Pioneered combined <em style={{ color: "#8a3a44" }}>regenerative</em>{" "}
        protocols
      </>
    ),
    body: "Among the first U.S. clinicians to combine PRP, peptide therapy, and energy-based devices for vaginal and pelvic health.",
  },
  {
    year: "2024",
    title: (
      <>
        <em style={{ color: "#8a3a44" }}>Telemedicine</em> practice expansion
      </>
    ),
    body: "Extended hormone therapy and consultation services across multiple states.",
  },
];

const PRESS_MARQUEE = [
  "Oprah",
  "Today",
  "Good Morning America",
  "The View",
  "CNN",
  "Larry King Live",
  "Dr. Phil",
  "Discovery",
];

const PRESS_TILES: {
  logo?: string;
  logoScale?: number;
  name: React.ReactNode;
  category?: string;
  meta: string;
  quote?: React.ReactNode;
  span?: "feature" | "tall" | "wide" | "sq";
}[] = [
  {
    span: "feature",
    logo: "/images/press/oprah.png",
    name: "The Oprah Winfrey Show",
    category: "National daytime authority",
    meta: "Recurring · 2001–2010",
    quote: (
      <>
        A national audience learned to talk about{" "}
        <em style={{ color: "#fbd2d2" }}>desire, hormones, pain,</em> and
        intimacy without euphemism.
      </>
    ),
  },
  {
    span: "tall",
    category: "Publishing impact",
    name: (
      <>
        <em style={{ color: "#8a3a44" }}>For Women Only</em>
      </>
    ),
    meta: "Henry Holt · 11 wks NYT",
    quote: (
      <>
        The book that moved female sexual physiology from a clinical specialty
        into household language.
      </>
    ),
  },
  {
    span: "sq",
    logo: "/images/press/today.svg",
    logoScale: 0.96,
    name: "Today Show",
    category: "Morning TV",
    meta: "Recurring",
  },
  {
    span: "sq",
    logo: "/images/press/gma.png",
    logoScale: 1.55,
    name: "Good Morning America",
    category: "Morning TV",
    meta: "Recurring",
  },
  {
    span: "sq",
    logo: "/images/press/cnn-transparent.png",
    logoScale: 0.74,
    name: "The View & CNN",
    category: "News + daytime",
    meta: "Recurring",
  },
  {
    span: "sq",
    logo: "/images/press/the-doctors-transparent.png",
    logoScale: 0.84,
    name: "The Doctors",
    category: "Medical panel",
    meta: "Co-host",
  },
  {
    span: "sq",
    logo: "/images/press/nbc.png",
    logoScale: 0.78,
    name: "NBC",
    category: "Broadcast",
    meta: "Recurring",
  },
  {
    span: "sq",
    logo: "/images/press/conan.webp",
    logoScale: 1.05,
    name: "Late Night",
    category: "Late night",
    meta: "Featured",
  },
];

const PRINCIPLES: { num: string; title: React.ReactNode; body: string }[] = [
  {
    num: "01",
    title: (
      <>
        Women&apos;s symptoms are <em style={{ color: "#f4a3aa" }}>medical</em>,
        not mood.
      </>
    ),
    body: "Low libido, painful sex, and arousal difficulty have measurable physiological causes — vascular, hormonal, neurological, pharmacological. Treat them like the medical issues they are.",
  },
  {
    num: "02",
    title: (
      <>
        The first appointment is{" "}
        <em style={{ color: "#f4a3aa" }}>longer than fifteen minutes</em>.
      </>
    ),
    body: "A real diagnostic conversation can't happen on a 15-minute clock. New patient consultations run 60–90 minutes, with every patient seen by Dr. Berman herself.",
  },
  {
    num: "03",
    title: (
      <>
        The body works as a <em style={{ color: "#f4a3aa" }}>system</em>.
      </>
    ),
    body: "Hormones affect mood and metabolism. Pelvic floor affects continence and pleasure. Sleep affects testosterone. Care planning treats the whole picture, not the loudest symptom.",
  },
];

const GLANCE: { dt: string; dd: React.ReactNode }[] = [
  {
    dt: "Specialty",
    dd: (
      <>
        Board-certified <em style={{ color: "#8a3a44" }}>urologist</em>
      </>
    ),
  },
  {
    dt: "Founded",
    dd: (
      <>
        The Berman Women&apos;s Wellness Center,{" "}
        <em style={{ color: "#8a3a44" }}>Beverly Hills</em>, 2007
      </>
    ),
  },
  {
    dt: "Co-founded",
    dd: (
      <>
        Female Sexual Medicine Center at{" "}
        <em style={{ color: "#8a3a44" }}>UCLA</em>, 1998 — first of its kind in
        the U.S.
      </>
    ),
  },
  {
    dt: "Authored",
    dd: (
      <>
        Two <em style={{ color: "#8a3a44" }}>New York Times</em> best-sellers
      </>
    ),
  },
  {
    dt: "Media",
    dd: <>Oprah · Today · GMA · The View · CNN · Larry King Live</>,
  },
  {
    dt: "Practice",
    dd: <>In-person Beverly Hills + telemedicine across multiple states</>,
  },
];

const eyebrowStyle: React.CSSProperties = {
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: 12,
  color: "#8a3a44",
  marginBottom: 24,
};

const eyebrowDarkStyle: React.CSSProperties = {
  ...eyebrowStyle,
  color: "#7a3942",
};

export default function AboutClient() {
  return (
    <section className="wf" data-id="E">
      {/* Global ambient MeshGradient — fixed cream/blush base behind every section */}
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

      {/* 1. HERO — magazine cover, dark wine GrainGradient shader */}
      <div
        className="e-rounded-section e-hero-bottom-rounded"
        style={{
          position: "relative",
          minHeight: "92vh",
          padding: "180px clamp(24px, 4vw, 56px) 100px",
          color: "#fff5f1",
          overflow: "hidden",
        }}
      >
        <SiteNav />
        <GrainGradient
          aria-hidden="true"
          colors={["#a13a48", "#6a2230", "#1a0a10"]}
          colorBack="#1a0a10"
          shape="sphere"
          speed={1.1}
          scale={0.6}
          noise={0.45}
          softness={0.78}
          intensity={0.4}
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
          className="about-hero-grid"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1440,
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
                color: "rgba(255,245,241,0.7)",
                marginBottom: 28,
              }}
            >
              <span style={{ color: "#fff5f1" }}>About</span> · 01 / 04 ·
              Founder &amp; Director
            </motion.div>
            <motion.h1
              {...fadeUp(0.15, 24)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(56px, 9vw, 144px)",
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
                color: "#fff5f1",
                margin: 0,
                textShadow: "0 4px 40px rgba(74,28,38,.45)",
              }}
            >
              Dr. Jennifer
              <em
                style={{
                  display: "block",
                  fontStyle: "italic",
                  background:
                    "linear-gradient(135deg,#ffeae0,#ffffff 40%,#f4a3aa)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                Berman.
              </em>
            </motion.h1>
            <motion.div
              {...fadeUp(0.28, 16)}
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,245,241,0.85)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "32px 0 28px",
              }}
            >
              <span>Urologist · MD · Founder</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,245,241,0.35)",
                  maxWidth: 120,
                }}
              />
            </motion.div>
            <motion.p
              {...fadeUp(0.4, 16)}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(22px, 2.4vw, 34px)",
                lineHeight: 1.32,
                color: "#fff5f1",
                maxWidth: 560,
                margin: 0,
              }}
            >
              A doctor who built her career proving what the medical
              establishment refused to study — that women&apos;s{" "}
              <em style={{ color: "#ffeae0", fontWeight: 400 }}>
                sexual health
              </em>{" "}
              is a{" "}
              <em style={{ color: "#ffeae0", fontWeight: 400 }}>medical</em>{" "}
              issue, not a mood.
            </motion.p>
          </div>

          <motion.div
            {...slideInRight(0.2, 60)}
            style={{
              position: "relative",
              aspectRatio: "3 / 4",
              width: "100%",
              maxWidth: 540,
              marginLeft: "auto",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid rgba(255,245,241,0.3)",
              boxShadow:
                "0 1.5px 0 rgba(255,245,241,.5) inset, 0 -1px 0 rgba(0,0,0,.3) inset, 0 60px 100px -30px rgba(0,0,0,.55), 0 30px 60px -20px rgba(74,28,38,.6), 0 0 80px -20px rgba(255,234,224,.35)",
              background: "rgba(26,10,16,0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <img
              src="/images/dr-berman/headshot-portrait.webp"
              alt="Dr. Jennifer Berman, 2024 — Beverly Hills"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 18,
                bottom: 18,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,245,241,0.9)",
                background: "rgba(26,10,16,0.45)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,245,241,0.22)",
              }}
            >
              Dr. Berman, 2024 · Beverly Hills
            </span>
          </motion.div>
        </div>

        <motion.div
          {...fadeUp(0.5, 16)}
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1440,
            margin: "56px auto 0",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,245,241,0.78)",
          }}
        >
          <span>
            Board-certified ·{" "}
            <b style={{ color: "#ffeae0", fontWeight: 600 }}>Urology</b>
          </span>
          <span style={{ color: "#d99ba1" }}>·</span>
          <span>
            <b style={{ color: "#ffeae0", fontWeight: 600 }}>2×</b> NYT
            best-seller
          </span>
          <span style={{ color: "#d99ba1" }}>·</span>
          <span>
            Beverly Hills ·{" "}
            <b style={{ color: "#ffeae0", fontWeight: 600 }}>since 2007</b>
          </span>
        </motion.div>
      </div>

      {/* 2. BIO ESSAY — sticky aside + drop-cap article on cream-glass plates */}
      <div
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#4a1c26",
        }}
      >
        <div
          className="about-bio-grid"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) minmax(0, 2fr)",
            gap: "clamp(32px, 6vw, 96px)",
            alignItems: "start",
          }}
        >
          <motion.aside
            {...slideInLeft(0.05, 60)}
            style={{
              position: "sticky",
              top: 120,
              padding: "32px 28px",
              borderRadius: 18,
              background: "rgba(255,245,241,0.7)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(217,155,161,0.35)",
              boxShadow: "0 30px 60px -30px rgba(74,28,38,0.18)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#8a3a44",
                marginBottom: 18,
              }}
            >
              Ch. 02 · At a glance
            </div>
            <dl style={{ margin: 0 }}>
              {GLANCE.map((g, i) => (
                <div
                  key={g.dt}
                  style={{
                    paddingBottom: 14,
                    marginBottom: 14,
                    borderBottom:
                      i < GLANCE.length - 1
                        ? "1px solid rgba(74,28,38,0.1)"
                        : "none",
                  }}
                >
                  <dt
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(74,28,38,0.62)",
                      marginBottom: 6,
                    }}
                  >
                    {g.dt}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      fontFamily: SERIF,
                      fontSize: 19,
                      lineHeight: 1.4,
                      color: "#4a1c26",
                    }}
                  >
                    {g.dd}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.aside>

          <article>
            <motion.div
              {...fadeUp(0.05, 18)}
              style={{ ...eyebrowStyle, marginBottom: 16 }}
            >
              The story
            </motion.div>
            <motion.h2
              {...fadeUp(0.12, 22)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(40px, 5.4vw, 72px)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                color: "#4a1c26",
                margin: "0 0 36px",
              }}
            >
              A career spent making{" "}
              <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                the appointment
              </em>{" "}
              women always needed.
            </motion.h2>

            <motion.p
              {...fadeUp(0.2, 18)}
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(20px, 1.6vw, 24px)",
                lineHeight: 1.55,
                color: "#4a1c26",
                margin: "0 0 28px",
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: "#8a3a44",
                  fontSize: "clamp(64px, 7vw, 96px)",
                  lineHeight: 0.85,
                  float: "left",
                  paddingRight: 14,
                  paddingTop: 6,
                  textShadow: "0 6px 24px rgba(138,58,68,0.18)",
                }}
              >
                W
              </span>
              hen Dr. Jennifer Berman finished her urology residency in the late
              1990s, female sexual dysfunction had no standardized diagnosis, no
              treatment protocol, and very little academic interest. She decided
              that was a problem worth her career.
            </motion.p>

            <motion.p
              {...fadeUp(0.28, 18)}
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(19px, 1.5vw, 22px)",
                lineHeight: 1.6,
                color: "#4a1c26",
                margin: "0 0 32px",
              }}
            >
              She co-founded the{" "}
              <em style={{ color: "#8a3a44" }}>
                Female Sexual Medicine Center at UCLA
              </em>{" "}
              in 1998 — the first of its kind in the United States — and
              co-authored <em style={{ color: "#8a3a44" }}>For Women Only</em>,
              the book that introduced female sexual dysfunction as a clinical
              concept to a mainstream audience. The book became a New York Times
              best-seller. So did the follow-up.
            </motion.p>

            <motion.blockquote
              {...fadeUp(0.36, 22)}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(28px, 3.4vw, 48px)",
                lineHeight: 1.18,
                color: "#4a1c26",
                margin: "44px 0 44px -8px",
                padding: "0 0 0 28px",
                borderLeft: "3px solid #8a3a44",
                position: "relative",
              }}
            >
              &ldquo;Most of what should be a fifteen-minute conversation in an
              exam room{" "}
              <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                never happens
              </em>
              . So I built a practice where it does.&rdquo;
              <cite
                style={{
                  display: "block",
                  marginTop: 18,
                  fontFamily: MONO,
                  fontStyle: "normal",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#8a3a44",
                }}
              >
                — Dr. Berman
              </cite>
            </motion.blockquote>

            <motion.p
              {...fadeUp(0.44, 18)}
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(19px, 1.5vw, 22px)",
                lineHeight: 1.6,
                color: "#4a1c26",
                margin: "0 0 28px",
              }}
            >
              Today, Dr. Berman runs a concierge practice in Beverly Hills
              focused on the medical care women have historically been told to
              grin and bear: arousal disorders, hormonal disruption through
              perimenopause and beyond, vaginal and pelvic floor changes, and
              the cluster of midlife symptoms that get dismissed as &ldquo;just
              stress.&rdquo;
            </motion.p>

            <motion.p
              {...fadeUp(0.52, 18)}
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(19px, 1.5vw, 22px)",
                lineHeight: 1.6,
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Her approach combines pharmacology, regenerative therapies,
              energy-based devices, and the kind of unhurried diagnostic
              listening that has gone missing from most clinical encounters. She
              treats patients in person at her Beverly Hills office and via
              telemedicine across multiple states.
            </motion.p>
          </article>
        </div>
      </div>

      {/* 3. TIMELINE — light smoke-ring panel, distinct from the hero */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#4a1c26",
          overflow: "hidden",
        }}
      >
        <SmokeRing
          aria-hidden="true"
          colors={["#f4a3aa", "#d97580", "#ffeae0", "#fbd2d2"]}
          colorBack="#fff7f3"
          scale={0.95}
          speed={0.45}
          thickness={0.32}
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
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(255,247,243,0.72) 0%, rgba(255,245,241,0.48) 48%, rgba(255,234,224,0.7) 100%)",
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
          <div
            className="about-section-header-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "clamp(32px, 5vw, 64px)",
              marginBottom: "clamp(56px, 7vw, 96px)",
              alignItems: "end",
            }}
          >
            <div>
              <motion.div {...fadeUp(0.05, 16)} style={eyebrowDarkStyle}>
                Career · Selected milestones
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
                Twenty-five years of{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    background: "linear-gradient(135deg,#8a3a44,#d97580)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  quiet
                </em>
                <br />
                authority.
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
                maxWidth: 480,
                margin: 0,
              }}
            >
              From a research thesis with almost no published literature to the
              first U.S. center for female sexual medicine, two best-sellers,
              and a concierge Beverly Hills practice now in its eighteenth year.
            </motion.p>
          </div>

          <div style={{ position: "relative" }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "clamp(60px, 14vw, 200px)",
                width: 1,
                background:
                  "linear-gradient(180deg, transparent, rgba(138,58,68,0.36) 12%, rgba(138,58,68,0.36) 88%, transparent)",
                zIndex: 0,
              }}
            />
            {TIMELINE.map((row, i) => (
              <motion.div
                key={row.year}
                {...slideInLeft(i * 0.06, 60)}
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns:
                    "clamp(80px, 14vw, 220px) minmax(0, 1fr)",
                  gap: "clamp(24px, 4vw, 56px)",
                  padding: "clamp(28px, 4vw, 48px) 0",
                  borderTop:
                    i === 0 ? "none" : "1px solid rgba(74,28,38,0.12)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "clamp(60px, 14vw, 200px)",
                    top: "calc(50% - 7px)",
                    transform: "translateX(-50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#8a3a44",
                    boxShadow:
                      "0 0 0 4px rgba(255,247,243,0.95), 0 0 22px rgba(217,117,128,0.46)",
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(40px, 6vw, 96px)",
                    lineHeight: 1,
                    color: "#8a3a44",
                    textShadow: "0 6px 28px rgba(217,117,128,0.22)",
                  }}
                >
                  {row.year}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 400,
                      fontSize: "clamp(22px, 2.4vw, 32px)",
                      lineHeight: 1.18,
                      color: "#4a1c26",
                      margin: "0 0 12px",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {row.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: "rgba(74,28,38,0.82)",
                      maxWidth: 540,
                      margin: 0,
                    }}
                  >
                    {row.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PRESS WALL — marquee + bento grid, transparent over MeshGradient */}
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
          }}
        >
          <div
            className="about-section-header-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "end",
              marginBottom: 56,
            }}
          >
            <div>
              <motion.div {...fadeUp(0.05, 16)} style={eyebrowStyle}>
                As seen on · Press &amp; media
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
                Twenty years of{" "}
                <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                  cultural
                </em>
                <br />
                fluency.
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
              Dr. Berman has been a recurring medical voice in mainstream media
              since 2001 — translating clinical research into language
              non-specialists can act on.
            </motion.p>
          </div>

          {/* Continuous shader-style marquee — allowed under motion rules */}
          <div
            style={{
              position: "relative",
              margin: "0 calc(-1 * clamp(24px, 4vw, 56px)) 64px",
              padding: "28px 0",
              borderTop: "1px solid rgba(74,28,38,0.12)",
              borderBottom: "1px solid rgba(74,28,38,0.12)",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, rgba(255,245,241,0.55), rgba(255,234,224,0.55))",
            }}
          >
            <div
              className="about-press-marquee-track"
              style={{
                display: "flex",
                width: "max-content",
                animation: "aboutPressMarquee 38s linear infinite",
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(36px, 5vw, 64px)",
                color: "#4a1c26",
                whiteSpace: "nowrap",
                gap: 32,
              }}
            >
              {[0, 1].map((dup) => (
                <span
                  key={dup}
                  aria-hidden={dup === 1 ? "true" : undefined}
                  style={{ display: "inline-flex", gap: 32, paddingRight: 32 }}
                >
                  {PRESS_MARQUEE.map((name, idx) => (
                    <span key={`${dup}-${idx}`}>
                      {name}
                      <em
                        style={{
                          color: "#d99ba1",
                          fontStyle: "italic",
                          margin: "0 24px",
                        }}
                      >
                        ·
                      </em>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className="about-press-grid">
            {PRESS_TILES.map((tile, i) => {
              const span = tile.span ?? "sq";
              const isFeature = span === "feature";

              return (
                <motion.div
                  key={i}
                  className={`about-press-tile about-press-tile--${span}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: isFeature ? -10 : -6,
                    scale: isFeature ? 1.012 : 1.018,
                  }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.65, delay: i * 0.06, ease: EASE }}
                >
                  {isFeature ? (
                    <>
                      <div aria-hidden="true" className="about-press-oprah-mark">
                        Oprah
                      </div>
                      <div className="about-press-feature-top">
                        <div className="about-press-feature-logo">
                          {tile.logo && (
                            <img src={tile.logo} alt="" aria-hidden="true" />
                          )}
                        </div>
                        <div className="about-press-feature-chips">
                          {["Recurring", "2001-2010", "National TV"].map(
                            (chip) => (
                              <span key={chip}>{chip}</span>
                            ),
                          )}
                        </div>
                      </div>
                      <p className="about-press-feature-quote">{tile.quote}</p>
                      <div className="about-press-card-footer">
                        {tile.category && (
                          <div className="about-press-category">
                            {tile.category}
                          </div>
                        )}
                        <div className="about-press-name">{tile.name}</div>
                        <div className="about-press-meta">{tile.meta}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="about-press-card-main">
                        {tile.category && (
                          <div className="about-press-category">
                            {tile.category}
                          </div>
                        )}
                        {tile.logo ? (
                          <div
                            className={`about-press-logo${
                              span === "wide" ? " about-press-logo--wide" : ""
                            }`}
                          >
                            <img
                              src={tile.logo}
                              alt=""
                              aria-hidden="true"
                              style={
                                tile.logoScale
                                  ? {
                                      transform: `scale(${tile.logoScale})`,
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        ) : span === "tall" ? (
                          <div className="about-press-book-stat">
                            <span>11</span>
                            <small>
                              weeks on the
                              <br />
                              NYT list
                            </small>
                          </div>
                        ) : null}
                        {tile.quote && (
                          <p className="about-press-quote">{tile.quote}</p>
                        )}
                      </div>
                      <div className="about-press-card-footer">
                        <div className="about-press-name">{tile.name}</div>
                        <div className="about-press-meta">{tile.meta}</div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. PHILOSOPHY — dark Warp shader + 3 principle cards */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#fff5f1",
          background: "transparent",
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
              <motion.div {...fadeUp(0.05, 16)} style={eyebrowDarkStyle}>
                Philosophy · How this practice works
              </motion.div>
              <motion.h2
                {...fadeUp(0.15, 24)}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 300,
                  fontSize: "clamp(44px, 6vw, 88px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.025em",
                  color: "#3a1518",
                  margin: 0,
                }}
              >
                Three things this
                <br />
                <em
                  style={{
                    fontStyle: "italic",
                    background: "linear-gradient(135deg,#7a3942,#b15862)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  practice believes
                </em>
                .
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
                color: "#5a2228",
                maxWidth: 480,
                margin: 0,
              }}
            >
              Not a mission statement. Three operational rules that shape how
              every appointment, every protocol, and every patient relationship
              is structured.
            </motion.p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 28,
            }}
          >
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.num}
                {...fadeUp(i * 0.1, 32)}
                style={{
                  padding: "40px 32px 36px",
                  borderRadius: 18,
                  background:
                    "linear-gradient(180deg, rgba(74,28,38,0.85) 0%, rgba(26,10,16,0.9) 100%)",
                  border: "1px solid rgba(255,245,241,0.1)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow:
                    "0 30px 60px -30px rgba(0,0,0,0.55), 0 0 60px -20px rgba(244,163,170,0.18) inset",
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 80,
                    lineHeight: 1,
                    background: "linear-gradient(135deg,#ffeae0,#f4a3aa)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    marginBottom: 24,
                  }}
                >
                  {p.num}
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(22px, 2.2vw, 28px)",
                    lineHeight: 1.18,
                    color: "#fff5f1",
                    letterSpacing: "-0.015em",
                    margin: "0 0 14px",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(255,245,241,0.72)",
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. PAGE TAIL — Ready to be heard? + Berman Brief */}
      <PageTail />

      {/* 7. FOOTER */}
      <SiteFooter />
    </section>
  );
}
