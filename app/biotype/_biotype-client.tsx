"use client";

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
import { openLeadCapture } from "@/components/lead/LeadCapture";
import PageTail from "../services/_page-tail";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const PATHWAYS: {
  category: string;
  title: React.ReactNode;
  body: string;
  snps: string[];
}[] = [
  {
    category: "Hormone Metabolism",
    title: (
      <>
        Estrogen &amp; <em style={{ color: "#8a3a44" }}>Progesterone</em>{" "}
        Pathways
      </>
    ),
    body: "Determines how your body breaks down and clears estrogen — critical for selecting the safest, most effective hormone therapy for you.",
    snps: ["CYP1A1", "CYP1B1", "COMT"],
  },
  {
    category: "Hormone Sensitivity",
    title: (
      <>
        Estrogen &amp; <em style={{ color: "#8a3a44" }}>Androgen</em> Receptors
      </>
    ),
    body: "Reveals how sensitive your cells are to estrogen and testosterone — informing whether hormone therapy is likely to help, and at what dose.",
    snps: ["ESR1", "ESR2", "AR", "SHBG"],
  },
  {
    category: "Detoxification & Methylation",
    title: (
      <>
        Liver &amp; <em style={{ color: "#8a3a44" }}>Cellular Clearance</em>
      </>
    ),
    body: "Identifies variants that affect how efficiently your body detoxifies hormones and environmental compounds — guiding methylation and nutrient support.",
    snps: ["MTHFR", "GSTM1", "GSTT1", "CYP3A4"],
  },
  {
    category: "Inflammation & Stress",
    title: (
      <>
        Immune &amp; <em style={{ color: "#8a3a44" }}>Cortisol</em> Response
      </>
    ),
    body: "Maps your inflammatory tendencies and stress hormone regulation — key drivers of fatigue, weight gain, mood changes, and cardiovascular risk in menopause.",
    snps: ["IL6", "NR3C1", "TNF-alpha"],
  },
  {
    category: "Sexual Health",
    title: (
      <>
        Arousal, Sensation &amp;{" "}
        <em style={{ color: "#8a3a44" }}>Blood Flow</em>
      </>
    ),
    body: "Evaluates the genetic drivers of libido, genital blood flow, lubrication, and orgasmic function — enabling targeted, non-invasive or hormonal therapies.",
    snps: ["NOS3", "OXTR", "PDE5A", "GCH1"],
  },
  {
    category: "Metabolic Health",
    title: (
      <>
        Weight, Insulin &amp;{" "}
        <em style={{ color: "#8a3a44" }}>Hormonal Balance</em>
      </>
    ),
    body: "Identifies PCOS-related and metabolic variants that influence weight, insulin sensitivity, and hormone levels — guiding dietary and therapeutic interventions.",
    snps: ["FTO", "INSR", "LHCGR", "THADA"],
  },
];

const STEPS: { num: string; title: string; body: React.ReactNode }[] = [
  {
    num: "01",
    title: "Simple Saliva Sample",
    body: (
      <>
        A painless, at-home cheek swab is all it takes. Your sample is processed
        by a <em style={{ color: "#f4a3aa" }}>CLIA-certified</em> laboratory and
        analyzed for over 25 clinically relevant genetic markers.
      </>
    ),
  },
  {
    num: "02",
    title: "Genomic Analysis",
    body: (
      <>
        Our platform evaluates SNPs across hormone metabolism, detoxification,
        inflammation, neurotransmitter balance, and receptor sensitivity to
        build your individual{" "}
        <em style={{ color: "#f4a3aa" }}>biotype profile</em>.
      </>
    ),
  },
  {
    num: "03",
    title: "Personalized Care Plan",
    body: (
      <>
        Dr. Berman reviews your results and translates them into a clear,{" "}
        <em style={{ color: "#f4a3aa" }}>actionable</em> treatment plan —
        covering HRT options, nutraceuticals, peptides, and lifestyle
        interventions tailored to your biology.
      </>
    ),
  },
];

const STATS: { value: string; label: string }[] = [
  { value: "25+", label: "Genetic markers evaluated" },
  { value: "200+", label: "Women in pilot cohort" },
  { value: "80%", label: "Reported improved symptom management" },
];

const DELIVERABLES: {
  title: React.ReactNode;
  body: React.ReactNode;
  icon: React.ReactNode;
}[] = [
  {
    title: (
      <>
        Personalized <em style={{ color: "#8a3a44" }}>Genomic Report</em>
      </>
    ),
    body: "A clear breakdown of your results across all six pathways, with plain-language explanations of what each finding means for your health.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: (
      <>
        Hormone Therapy <em style={{ color: "#8a3a44" }}>Guidance</em>
      </>
    ),
    body: (
      <>
        Specific recommendations for HRT type, route, and dosing — based on how
        your body metabolizes and responds to estrogen and testosterone —{" "}
        <em style={{ color: "#8a3a44" }}>not a generic protocol</em>.
      </>
    ),
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: (
      <>
        <em style={{ color: "#8a3a44" }}>Non-Hormonal</em> Options
      </>
    ),
    body: (
      <>
        Genomically-matched recommendations for nutraceuticals, adaptogens,
        peptides, and lifestyle strategies for women who{" "}
        <em style={{ color: "#8a3a44" }}>cannot or prefer not</em> to use
        hormones.
      </>
    ),
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <path
          d="M12 3c4 4 4 9 0 13M12 3c-4 4-4 9 0 13M12 16v5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: (
      <>
        <em style={{ color: "#8a3a44" }}>Sexual Health</em> Plan
      </>
    ),
    body: (
      <>
        Targeted insights and treatment options for libido, vaginal health, and
        arousal — based on your{" "}
        <em style={{ color: "#8a3a44" }}>OXTR, NOS3, ESR, and PDE5A</em>{" "}
        variants.
      </>
    ),
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <path
          d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: (
      <>
        Methylation &amp; <em style={{ color: "#8a3a44" }}>Detox Support</em>
      </>
    ),
    body: (
      <>
        Identification of <em style={{ color: "#8a3a44" }}>MTHFR</em> and
        detoxification variants that require targeted folate, B-vitamin, or
        liver support protocols for safe hormone clearance.
      </>
    ),
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="16" r="3" />
        <path d="M10.2 10.2l3.6 3.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: (
      <>
        Long-Term <em style={{ color: "#8a3a44" }}>Monitoring</em>
      </>
    ),
    body: "Your biotype doesn't change — but your needs do. Dr. Berman's team offers ongoing tracking and protocol refinement as your health evolves over time.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a3a44"
        strokeWidth="1.4"
      >
        <path
          d="M3 17l5-6 4 3 6-8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 6h4v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const FIT_LIST: React.ReactNode[] = [
  <>
    You&apos;re in perimenopause or menopause and symptoms are affecting your{" "}
    <em style={{ color: "#f4a3aa" }}>quality of life</em>
  </>,
  <>
    You&apos;ve tried hormone therapy but haven&apos;t found the right fit — or{" "}
    <em style={{ color: "#f4a3aa" }}>you&apos;re afraid to start</em>
  </>,
  <>
    You want to understand{" "}
    <em style={{ color: "#f4a3aa" }}>why you feel the way you do</em> — and what
    to actually do about it
  </>,
  <>
    You&apos;re experiencing{" "}
    <em style={{ color: "#f4a3aa" }}>sexual health changes</em> and want
    targeted, evidence-based options
  </>,
  <>
    You&apos;re 35–55 and want a{" "}
    <em style={{ color: "#f4a3aa" }}>proactive, data-driven</em> approach to
    your health before symptoms escalate
  </>,
  <>
    You prefer <em style={{ color: "#f4a3aa" }}>personalized medicine</em> over
    trial-and-error prescribing
  </>,
];

const QUOTE_PART_1 = ["This", "is", "not", "just", "a", "test."];
const QUOTE_PART_2 = ["It’s", "a", "new", "standard", "in"];
const QUOTE_PART_3_ACCENT = ["female-centered,", "data-driven", "medicine."];
const QUOTE_PART_4 = [
  "By",
  "decoding",
  "each",
  "woman’s",
  "genomic",
  "profile,",
  "we",
  "can",
  "deliver",
  "the",
  "right",
  "treatment",
  "—",
  "at",
  "the",
  "right",
  "time",
  "—",
  "with",
  "measurable",
  "outcomes.",
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
  color: "#f4a3aa",
};

export default function BiotypeClient() {
  const openConcierge = () => openLeadCapture();

  return (
    <section className="wf" data-id="E">
      {/* Page-scoped CSS for one-offs (SWC parser bug avoidance: dangerouslySetInnerHTML, not styled-jsx) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .biotype-pathway-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(20px, 2.4vw, 32px);
            }
            @media (max-width: 1024px) {
              .biotype-pathway-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (max-width: 640px) {
              .biotype-pathway-grid { grid-template-columns: 1fr; }
            }
            .biotype-deliverable-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(20px, 2.4vw, 32px);
            }
            @media (max-width: 1024px) {
              .biotype-deliverable-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (max-width: 640px) {
              .biotype-deliverable-grid { grid-template-columns: 1fr; }
            }
            .biotype-step-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(20px, 2.4vw, 36px);
            }
            @media (max-width: 900px) {
              .biotype-step-grid { grid-template-columns: 1fr; }
            }
            .biotype-stats {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: clamp(24px, 4vw, 64px);
              align-items: end;
            }
            @media (max-width: 760px) {
              .biotype-stats { grid-template-columns: 1fr; gap: 48px; text-align: center; }
            }
            .biotype-hero-cta {
              position: relative;
              display: inline-flex;
              align-items: center;
              gap: 10px;
              padding: 18px 32px;
              border-radius: 999px;
              border: 1px solid rgba(255,245,241,0.3);
              background: rgba(26,10,16,0.35);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              color: #fff5f1;
              font-family: ${MONO};
              font-size: 12px;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              cursor: pointer;
              overflow: hidden;
            }
            .biotype-hero-cta-secondary {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              padding: 18px 28px;
              color: rgba(255,245,241,0.85);
              font-family: ${MONO};
              font-size: 12px;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              text-decoration: none;
              border-bottom: 1px solid rgba(255,245,241,0.35);
            }
            .biotype-snp-pill {
              display: inline-block;
              padding: 5px 10px;
              margin: 0 6px 6px 0;
              border-radius: 999px;
              border: 1px solid rgba(217,155,161,0.55);
              background: rgba(255,245,241,0.55);
              color: #8a3a44;
              font-family: ${MONO};
              font-size: 10px;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .biotype-pathway-card,
            .biotype-deliverable-card {
              position: relative;
              padding: clamp(28px, 2.4vw, 36px);
              border-radius: 18px;
              background: rgba(255,245,241,0.7);
              backdrop-filter: blur(14px);
              -webkit-backdrop-filter: blur(14px);
              border: 1px solid rgba(217,155,161,0.35);
              box-shadow: 0 30px 60px -30px rgba(74,28,38,0.18);
              color: #4a1c26;
              display: flex;
              flex-direction: column;
              gap: 14px;
            }
            .biotype-step-card {
              position: relative;
              padding: clamp(28px, 2.4vw, 40px);
              border-radius: 18px;
              background: rgba(255,245,241,0.08);
              backdrop-filter: blur(14px);
              -webkit-backdrop-filter: blur(14px);
              border: 1px solid rgba(255,245,241,0.18);
              color: #fff5f1;
              display: flex;
              flex-direction: column;
              gap: 14px;
              min-height: 280px;
            }
            .biotype-fit-row {
              display: flex;
              gap: 18px;
              align-items: flex-start;
              padding: 18px 0;
              border-bottom: 1px solid rgba(244,163,170,0.18);
            }
            .biotype-fit-row:last-child { border-bottom: none; }
          `,
        }}
      />

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

      {/* 1. HERO — dark wine GrainGradient sphere shader */}
      <div
        className="e-rounded-section"
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
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,245,241,0.7)",
              marginBottom: 36,
            }}
          >
            Dr. Jennifer Berman, MD ·{" "}
            <span style={{ color: "#fff5f1" }}>
              Precision Women&apos;s Health
            </span>
          </motion.div>

          <motion.div
            {...fadeUp(0.12, 18)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(28px, 3.4vw, 36px)",
              lineHeight: 1.18,
              color: "rgba(255,245,241,0.78)",
              maxWidth: 820,
              marginBottom: 28,
            }}
          >
            Your DNA. Your <em style={{ color: "#f4a3aa" }}>Menopause</em>. Your
            Plan.
          </motion.div>

          <motion.h1
            {...fadeUp(0.2, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(64px, 11vw, 168px)",
              lineHeight: 0.92,
              letterSpacing: "-0.025em",
              color: "#fff5f1",
              margin: 0,
              textShadow: "0 4px 40px rgba(74,28,38,.45)",
            }}
          >
            The Menopause{" "}
            <em
              style={{
                fontStyle: "italic",
                background:
                  "linear-gradient(135deg,#ffeae0,#ffffff 40%,#f4a3aa)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Biotype.
            </em>
            <span
              aria-hidden="true"
              style={{
                fontFamily: MONO,
                fontSize: "0.18em",
                color: "#f4a3aa",
                verticalAlign: "super",
                marginLeft: 6,
              }}
            >
              ™
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.3, 16)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(22px, 2vw, 26px)",
              lineHeight: 1.45,
              color: "rgba(255,245,241,0.92)",
              maxWidth: 720,
              margin: "44px 0 0",
            }}
          >
            The Menopause Biotype™ decodes your unique genetic profile to
            deliver a personalized, evidence-based approach to perimenopause and
            menopause care —{" "}
            <em style={{ color: "#f4a3aa", fontWeight: 400 }}>
              no more guesswork.
            </em>
          </motion.p>

          <motion.div
            {...fadeUp(0.42, 16)}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 18,
              marginTop: 56,
            }}
          >
            <button
              type="button"
              className="biotype-hero-cta"
              onClick={openConcierge}
            >
              <BorderBeam
                size={80}
                duration={8}
                colorFrom="#f4a3aa"
                colorTo="#d97580"
                borderWidth={1.5}
              />
              <span style={{ position: "relative", zIndex: 1 }}>
                Request a consultation →
              </span>
            </button>
            <a href="#how-it-works" className="biotype-hero-cta-secondary">
              Learn how it works ↓
            </a>
          </motion.div>
        </div>
      </div>

      {/* 2. WHAT IS — transparent intro on MeshGradient */}
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
            maxWidth: 1080,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowStyle}>
            What is the Menopause Biotype™
          </motion.div>
          <motion.h2
            {...fadeUp(0.12, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(40px, 5.6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "#4a1c26",
              margin: "0 0 56px",
            }}
          >
            A DNA-guided roadmap for your{" "}
            <em style={{ color: "#8a3a44", fontWeight: 300 }}>
              midlife health.
            </em>
          </motion.h2>
          <motion.p
            {...fadeUp(0.2, 16)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(19px, 1.6vw, 21px)",
              lineHeight: 1.55,
              color: "#4a1c26",
              maxWidth: 820,
              margin: "0 auto 28px",
            }}
          >
            No two women experience menopause the same way. Hot flashes, brain
            fog, mood shifts, low libido, weight changes — your symptoms are
            shaped by your unique{" "}
            <em style={{ color: "#8a3a44", fontWeight: 400 }}>
              genetic makeup
            </em>
            . Yet most treatment approaches are one-size-fits-all.
          </motion.p>
          <motion.p
            {...fadeUp(0.28, 16)}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(19px, 1.6vw, 21px)",
              lineHeight: 1.55,
              color: "#4a1c26",
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            The Menopause Biotype™ changes that. Developed by Dr. Jennifer
            Berman, MD, it analyzes over{" "}
            <em style={{ color: "#8a3a44", fontWeight: 400 }}>
              25 genetic variants
            </em>{" "}
            (SNPs) across six key biological pathways to build a precision
            roadmap for your care — from hormone therapy selection to
            nutritional support, sleep optimization, and beyond.
          </motion.p>
        </div>
      </div>

      {/* 3. HOW IT WORKS — dark wine GrainGradient sphere */}
      <div
        id="how-it-works"
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#fff5f1",
          overflow: "hidden",
        }}
      >
        <GrainGradient
          aria-hidden="true"
          colors={["#a13a48", "#6a2230", "#1a0a10"]}
          colorBack="#1a0a10"
          shape="sphere"
          speed={0.9}
          scale={0.65}
          noise={0.4}
          softness={0.82}
          intensity={0.36}
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
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowDarkStyle}>
            How it works
          </motion.div>
          <motion.h2
            {...fadeUp(0.12, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(40px, 5.6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "#fff5f1",
              margin: "0 0 72px",
              maxWidth: 880,
            }}
          >
            Three steps from sample to a{" "}
            <em style={{ color: "#f4a3aa", fontWeight: 300 }}>
              personalized plan.
            </em>
          </motion.h2>

          <div className="biotype-step-grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="biotype-step-card"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.65,
                  delay: 0.1 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(56px, 6vw, 84px)",
                    lineHeight: 1,
                    color: "#f4a3aa",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(26px, 2.4vw, 32px)",
                    lineHeight: 1.15,
                    color: "#fff5f1",
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 19,
                    lineHeight: 1.55,
                    color: "rgba(255,245,241,0.85)",
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

      {/* 4. THE SCIENCE — six pathways on cream-glass over MeshGradient */}
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
          <div style={{ maxWidth: 880, marginBottom: 64 }}>
            <motion.div {...fadeUp(0.05, 16)} style={eyebrowStyle}>
              The science
            </motion.div>
            <motion.h2
              {...fadeUp(0.12, 24)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(40px, 5.6vw, 84px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Six pathways. Hundreds of data points.{" "}
              <em style={{ color: "#8a3a44", fontWeight: 300 }}>One profile</em>{" "}
              built for you.
            </motion.h2>
          </div>

          <div className="biotype-pathway-grid">
            {PATHWAYS.map((p, i) => (
              <motion.div
                key={p.category}
                className="biotype-pathway-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.6,
                  delay: 0.05 + (i % 3) * 0.08,
                  ease: EASE,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#8a3a44",
                  }}
                >
                  {p.category}
                </div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(24px, 2.2vw, 28px)",
                    lineHeight: 1.18,
                    color: "#4a1c26",
                    margin: 0,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.55,
                    color: "rgba(74,28,38,0.82)",
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
                <div style={{ marginTop: 4 }}>
                  {p.snps.map((snp) => (
                    <span key={snp} className="biotype-snp-pill">
                      {snp}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. STATS STRIP — e-rounded-section with light NeuroNoise */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "clamp(80px, 10vw, 140px) clamp(24px, 4vw, 56px)",
          overflow: "hidden",
          color: "#4a1c26",
        }}
      >
        <NeuroNoise
          aria-hidden="true"
          colorFront="#f4a3aa"
          colorBack="#fff5f1"
          brightness={1.3}
          speed={0.4}
          scale={1.4}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.6,
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
          <div className="biotype-stats">
            {STATS.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.7,
                  delay: 0.05 + i * 0.12,
                  ease: EASE,
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(90px, 11vw, 132px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    color: "#4a1c26",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#8a3a44",
                    marginTop: 16,
                    maxWidth: 280,
                  }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. WHAT YOU'LL RECEIVE — deliverables grid on MeshGradient */}
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
          <div style={{ maxWidth: 820, marginBottom: 64 }}>
            <motion.div {...fadeUp(0.05, 16)} style={eyebrowStyle}>
              What you&apos;ll receive
            </motion.div>
            <motion.h2
              {...fadeUp(0.12, 24)}
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: "clamp(40px, 5.6vw, 84px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#4a1c26",
                margin: 0,
              }}
            >
              Clarity,{" "}
              <em style={{ color: "#8a3a44", fontWeight: 300 }}>
                not confusion
              </em>{" "}
              — on every front.
            </motion.h2>
          </div>

          <div className="biotype-deliverable-grid">
            {DELIVERABLES.map((d, i) => (
              <motion.div
                key={i}
                className="biotype-deliverable-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.6,
                  delay: 0.05 + (i % 3) * 0.08,
                  ease: EASE,
                }}
              >
                <div style={{ marginBottom: 4 }}>{d.icon}</div>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(22px, 2vw, 26px)",
                    lineHeight: 1.18,
                    color: "#4a1c26",
                    margin: 0,
                  }}
                >
                  {d.title}
                </h3>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.55,
                    color: "rgba(74,28,38,0.82)",
                    margin: 0,
                  }}
                >
                  {d.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. IS THIS FOR YOU — dark wine Warp shader */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          padding: "clamp(96px, 12vw, 160px) clamp(24px, 4vw, 56px)",
          color: "#fff5f1",
          overflow: "hidden",
        }}
      >
        <Warp
          aria-hidden="true"
          {...{ colorBack: "#1a0a10" }}
          colors={["#4a1c26", "#8a3a44", "#5a2030", "#2a1018"]}
          speed={0.3}
          scale={1}
          rotation={0}
          distortion={0.24}
          swirl={0.82}
          swirlIterations={8}
          shape="checks"
          shapeScale={0.18}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            backgroundColor: "#1a0a10",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={eyebrowDarkStyle}>
            Is this for you?
          </motion.div>
          <motion.h2
            {...fadeUp(0.12, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(40px, 5.6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "#fff5f1",
              margin: "0 0 64px",
            }}
          >
            You deserve answers,{" "}
            <em style={{ color: "#f4a3aa", fontWeight: 300 }}>
              not approximations.
            </em>
          </motion.h2>

          <div>
            {FIT_LIST.map((item, i) => (
              <motion.div
                key={i}
                className="biotype-fit-row"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.55,
                  delay: 0.08 + i * 0.08,
                  ease: EASE,
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f4a3aa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 4 }}
                  aria-hidden="true"
                >
                  <path d="M5 12l4 4 10-10" />
                </svg>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(19px, 1.6vw, 21px)",
                    lineHeight: 1.5,
                    color: "rgba(255,245,241,0.92)",
                  }}
                >
                  {item}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. PULL QUOTE — blush e-quote pattern, word-by-word stagger */}
      <div className="e-quote blush" style={{ position: "relative" }}>
        <div
          className="mark"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            color: "#8a3a44",
          }}
          aria-hidden="true"
        >
          &ldquo;
        </div>
        <blockquote
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 300,
            color: "#4a1c26",
            margin: 0,
          }}
        >
          {QUOTE_PART_1.map((word, i) => (
            <motion.span
              key={"p1-" + i}
              style={{ display: "inline-block", marginRight: "0.32em" }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.18 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {word}
            </motion.span>
          ))}
          {QUOTE_PART_2.map((word, i) => (
            <motion.span
              key={"p2-" + i}
              style={{ display: "inline-block", marginRight: "0.32em" }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.18 + (QUOTE_PART_1.length + i) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {word}
            </motion.span>
          ))}
          {QUOTE_PART_3_ACCENT.map((word, i) => (
            <motion.span
              key={"p3-" + i}
              className="accent"
              style={{
                display: "inline-block",
                marginRight: "0.32em",
                color: "#8a3a44",
                fontStyle: "italic",
              }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay:
                  0.18 + (QUOTE_PART_1.length + QUOTE_PART_2.length + i) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {word}
            </motion.span>
          ))}
          {QUOTE_PART_4.map((word, i) => (
            <motion.span
              key={"p4-" + i}
              style={{ display: "inline-block", marginRight: "0.32em" }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay:
                  0.18 +
                  (QUOTE_PART_1.length +
                    QUOTE_PART_2.length +
                    QUOTE_PART_3_ACCENT.length +
                    i) *
                    0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {word}
            </motion.span>
          ))}
        </blockquote>
        <motion.div
          className="by"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6, ease: EASE }}
          viewport={{ once: true, margin: "-80px" }}
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#8a3a44",
          }}
        >
          — Dr. Jennifer Berman, MD
        </motion.div>
      </div>

      {/* 9. COMPLIANCE FOOTER TEXT — small, transparent, pre-PageTail */}
      <div
        style={{
          position: "relative",
          padding: "clamp(48px, 6vw, 80px) clamp(24px, 4vw, 56px)",
        }}
      >
        <motion.p
          {...fadeUp(0.05, 12)}
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 15,
            lineHeight: 1.55,
            color: "#4a1c26",
            opacity: 0.7,
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          Menopause Biotype™ · Dr. Jennifer Berman, MD. This platform is
          intended for informational purposes and does not constitute medical
          advice. Results and recommendations are made in the context of a
          clinical relationship with Dr. Jennifer Berman, MD.{" "}
          <em style={{ color: "#8a3a44", fontWeight: 400 }}>
            Genetic information is protected under GINA and HIPAA.
          </em>
        </motion.p>
      </div>

      {/* 10. PAGE TAIL — Ready CTA + Brief */}
      <PageTail />

      {/* 11. SITE FOOTER */}
      <SiteFooter />
    </section>
  );
}
