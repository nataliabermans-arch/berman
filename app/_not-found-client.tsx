"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MeshGradient } from "@/components/ambient/shaders";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { VISIBLE_SERVICES } from "@/lib/services/content";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";
const SANS = "var(--font-inter), system-ui, sans-serif";
const WINE = "#4a1c26";
const DEEP = "#8a3a44";
const CREAM = "#fff5f1";

// The most-read articles in Search Console (Jul–Oct 2026), so a lost visitor
// lands somewhere people actually want to go.
const POPULAR_ARTICLES = [
  { slug: "100-symptoms-of-perimenopause", title: "100 Symptoms of Perimenopause: It’s Not All In Your Head" },
  { slug: "testosterone-for-women-dosing", title: "Testosterone for Women Dosing: A Beginner’s Guide" },
  { slug: "signs-too-much-bioidentical-progesterone", title: "Signs Your Progesterone Levels May Be Too High" },
  { slug: "best-vaginal-moisturizer", title: "The 5 Best Vaginal Moisturizers for Relief" },
  { slug: "emsella-chair-reviews-guide", title: "My Honest Emsella Chair Reviews: Is It Worth It?" },
  { slug: "signs-of-female-arousal", title: "A Complete Guide to Female Sexual Arousal and Response" },
];

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});

const label = {
  fontFamily: MONO,
  textTransform: "uppercase" as const,
  letterSpacing: "0.22em",
  fontSize: 11,
  color: DEEP,
};

const pill = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "15px 26px",
  borderRadius: 999,
  fontFamily: MONO,
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
};

export default function NotFoundClient() {
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
          style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        />

        <SiteNav />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "clamp(150px, 20vh, 210px) clamp(16px, 6vw, 80px) 60px",
            textAlign: "center",
            color: WINE,
          }}
        >
          <motion.p {...fade(0)} style={{ ...label, margin: "0 0 22px" }}>
            Error 404 · Page not found
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(44px, 7vw, 92px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: "0 auto 22px",
              maxWidth: 900,
            }}
          >
            This page has <em style={{ color: DEEP }}>moved on.</em>
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            style={{
              fontFamily: SANS,
              fontSize: "clamp(16px, 1.4vw, 18px)",
              lineHeight: 1.65,
              color: "rgba(74,28,38,0.82)",
              maxWidth: 620,
              margin: "0 auto 34px",
            }}
          >
            The link you followed may be old, or the article was combined with a
            newer one. Everything Dr. Berman offers is still here. Start with a
            treatment below, read a popular article, or book a consultation.
          </motion.p>
          <motion.div
            {...fade(0.22)}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}
          >
            <Link href="/appointment-request/" style={{ ...pill, background: WINE, color: CREAM }}>
              Book a consultation →
            </Link>
            <a href="tel:+13107720072" style={{ ...pill, border: `1px solid ${WINE}`, color: WINE }}>
              Call (310) 772-0072
            </a>
            <Link href="/" style={{ ...pill, color: WINE, padding: "15px 14px" }}>
              Back to home
            </Link>
          </motion.div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px clamp(16px, 4vw, 40px) 100px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(20px, 3vw, 32px)",
          }}
        >
          <motion.nav
            {...fade(0.3)}
            aria-label="Treatments"
            style={{
              background: "rgba(255,245,241,0.72)",
              border: "1px solid rgba(138,58,68,0.18)",
              borderRadius: 28,
              padding: "clamp(24px, 3vw, 36px)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ ...label, margin: "0 0 14px" }}>Treatments</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {VISIBLE_SERVICES.map((s) => (
                <li key={s.slug} style={{ borderTop: "1px solid rgba(74,28,38,0.1)" }}>
                  <Link
                    href={`/services/${s.slug}/`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "14px 0",
                      fontFamily: SERIF,
                      fontSize: 22,
                      color: WINE,
                      textDecoration: "none",
                    }}
                  >
                    {s.name}
                    <span aria-hidden="true" style={{ color: DEEP }}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav
            {...fade(0.36)}
            aria-label="Popular articles"
            style={{
              background: "rgba(255,245,241,0.72)",
              border: "1px solid rgba(138,58,68,0.18)",
              borderRadius: 28,
              padding: "clamp(24px, 3vw, 36px)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ ...label, margin: "0 0 14px" }}>Most-read articles</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {POPULAR_ARTICLES.map((a) => (
                <li key={a.slug} style={{ borderTop: "1px solid rgba(74,28,38,0.1)" }}>
                  <Link
                    href={`/${a.slug}/`}
                    style={{
                      display: "block",
                      padding: "14px 0",
                      fontFamily: SANS,
                      fontSize: 15.5,
                      lineHeight: 1.45,
                      color: WINE,
                      textDecoration: "none",
                    }}
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/womens-health-blog/"
              style={{ ...label, display: "inline-block", marginTop: 18, textDecoration: "none" }}
            >
              See all articles →
            </Link>
          </motion.nav>
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}
