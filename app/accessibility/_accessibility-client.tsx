"use client";

import { motion } from "motion/react";
import { MeshGradient, GrainGradient } from "@paper-design/shaders-react";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTail from "../services/_page-tail";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.65, delay, ease: EASE },
});

const ITALIC: React.CSSProperties = {
  fontStyle: "italic",
  color: "#8a3a44",
};

const ITALIC_LIGHT: React.CSSProperties = {
  fontStyle: "italic",
  color: "#f4a3aa",
};

const H2: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize: "clamp(30px, 4vw, 40px)",
  lineHeight: 1.1,
  letterSpacing: "-0.01em",
  color: "#4a1c26",
  margin: "0 0 20px",
};

const P: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 18,
  lineHeight: 1.65,
  color: "#4a1c26",
  margin: "0 0 16px",
};

const UL: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 18,
  lineHeight: 1.65,
  color: "#4a1c26",
  margin: "0 0 16px",
  paddingLeft: 24,
};

const SECTION_BLOCK: React.CSSProperties = { marginBottom: 64 };

const EYEBROW: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "rgba(255,245,241,0.75)",
  marginBottom: 28,
};

export default function AccessibilityClient() {
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
          minHeight: "72vh",
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
            maxWidth: 880,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div {...fadeUp(0.05, 16)} style={EYEBROW}>
            Legal · Accessibility
          </motion.div>
          <motion.h1
            {...fadeUp(0.15, 24)}
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#fff5f1",
              margin: 0,
            }}
          >
            Designed to be <em style={ITALIC_LIGHT}>usable.</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.28, 16)}
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(18px, 2vw, 22px)",
              lineHeight: 1.55,
              color: "rgba(255,245,241,0.88)",
              maxWidth: 640,
              margin: "32px auto 0",
            }}
          >
            What we&apos;ve done, where we know we still fall short, and how to
            tell us when something is in your way. Last reviewed{" "}
            <em style={ITALIC_LIGHT}>May 10, 2026.</em>
          </motion.p>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "120px clamp(24px, 4vw, 56px) 140px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Our <em style={ITALIC}>commitment.</em>
            </h2>
            <p style={P}>
              The Berman Women&apos;s Wellness Center is committed to making
              this website accessible to people with a wide range of abilities,
              including those who use assistive technologies such as screen
              readers, screen magnification, voice recognition, and
              keyboard-only navigation. Our target is conformance with the Web
              Content Accessibility Guidelines (WCAG) 2.1 at the AA level. We
              treat that target as a floor, not a ceiling, and we test against
              it as we ship new pages and features.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              What we&apos;ve <em style={ITALIC}>done.</em>
            </h2>
            <p style={P}>
              Concretely, the work currently in place on this site includes:
            </p>
            <ul style={UL}>
              <li>
                Full keyboard navigation across pages, menus, forms, and the
                shopping cart, with a logical and predictable focus order.
              </li>
              <li>
                Visible focus indicators on every interactive element, so
                keyboard users can always see where they are.
              </li>
              <li>
                Semantic HTML structure &mdash; real headings, landmarks, lists,
                and form labels &mdash; so assistive technology can navigate the
                page meaningfully.
              </li>
              <li>
                Color contrast on body text and interactive elements that meets
                or exceeds WCAG AA on both the cream and dark wine backgrounds
                used across the site.
              </li>
              <li>
                Descriptive alternative text on meaningful images. Decorative
                images, including the animated background shaders, are marked as
                decorative so screen readers skip them.
              </li>
              <li>
                Properly associated labels and error messages on every form,
                including the contact form, newsletter signup, and checkout.
              </li>
              <li>
                Respect for the operating-system{" "}
                <code>prefers-reduced-motion</code> setting. When you have
                reduced motion enabled, scroll-driven entrance animations are
                shortened or skipped.
              </li>
            </ul>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Known <em style={ITALIC}>limitations.</em>
            </h2>
            <p style={P}>
              We want to be honest about where we know the site is not yet at
              the standard we want:
            </p>
            <ul style={UL}>
              <li>
                The animated background shaders that run on most pages are
                visually distinctive, and some visitors may find them
                distracting even when they meet the contrast requirements behind
                them. Enabling reduced motion in your operating system quiets
                these effects significantly.
              </li>
              <li>
                A handful of color combinations on the dark wine sections meet
                WCAG AA but not AAA. We continue to retune these as the design
                system evolves.
              </li>
              <li>
                The AI concierge is currently a text-only interface. We have not
                yet shipped a voice mode, and dictation through your operating
                system or browser is the supported workaround for now.
              </li>
              <li>
                Some long-form articles include embedded video. Captions are
                provided where the source video supports them; transcripts are
                being added gradually.
              </li>
            </ul>
            <p style={P}>
              We treat each of these as an open work item and prioritize fixes
              alongside new features.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Send us <em style={ITALIC}>feedback.</em>
            </h2>
            <p style={P}>
              If you encounter an accessibility barrier on this site &mdash; a
              page that doesn&apos;t work with your screen reader, a control you
              can&apos;t reach with the keyboard, contrast that fails for you,
              anything &mdash; please tell us. Email{" "}
              <a
                href="mailto:accessibility@bermanwomenswellness.com"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                accessibility@bermanwomenswellness.com
              </a>{" "}
              with the page URL, what you were trying to do, and what happened.
              We respond to accessibility reports within five business days and
              prioritize fixes that unblock visitors from completing essential
              tasks &mdash; reading content, contacting the practice, booking a
              visit, or placing an order.
            </p>
            <p style={P}>
              You can also reach the practice by phone at (310) 772-0072 if that
              is the easier path for you.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Last <em style={ITALIC}>reviewed.</em>
            </h2>
            <p style={P}>
              This statement was last reviewed on{" "}
              <em style={ITALIC}>May 10, 2026.</em> The Berman Women&apos;s
              Wellness Center, 415 N. Crescent Drive, Suite 355, Beverly Hills, CA
              90210.
            </p>
          </motion.section>
        </div>
      </div>

      <PageTail />
      <SiteFooter />
    </section>
  );
}
