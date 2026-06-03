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

export default function PrivacyClient() {
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
            Legal · Privacy
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
            How we handle <em style={ITALIC_LIGHT}>your information.</em>
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
            Plain-English answers to what we collect, why we collect it, and the
            controls you have over it. Last updated{" "}
            <em style={ITALIC_LIGHT}>May 29, 2026.</em>
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
              Information we <em style={ITALIC}>collect.</em>
            </h2>
            <p style={P}>
              When you use this website, we collect only what we need to respond
              to you, fulfill an order, or send you the publications you ask
              for. The contact form captures your name, email address, phone
              number (optional), and the message you write us. The cart and
              checkout flow capture your shipping address, billing address, and
              the items you order. The newsletter form captures your email
              address only.
            </p>
            <p style={P}>
              We want to be clear about one boundary: this website is a
              marketing and commerce surface, not a clinical record system.
              Detailed health information &mdash; symptoms, diagnoses, lab
              values, medications &mdash; is collected by Dr. Berman and her
              clinical team directly, through encrypted intake portals and
              in-office paperwork covered by HIPAA. Please do not send detailed
              medical information through this website&apos;s contact form, the
              concierge chat, or our email addresses. If you have a clinical
              question, the right path is to call the practice at{" "}
              <strong>(310) 772-0072</strong> or book a consultation, where your
              information is handled inside our HIPAA-compliant systems.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              How we <em style={ITALIC}>use your information.</em>
            </h2>
            <p style={P}>
              We use the information you give us for the specific purpose you
              gave it to us. A contact form submission is used to write you back
              with the answer or appointment options you asked for. An order is
              used to take payment, ship the supplements you bought, and answer
              any follow-up questions about that order. A newsletter signup is
              used to send you The Berman Brief and nothing else.
            </p>
            <p style={P}>
              We also use aggregate, non-identifying information &mdash; how
              many people visit a page, which articles are read most, where
              visitors land first &mdash; to make the site faster, clearer, and
              more useful. We do not sell, rent, or trade your personal
              information to third parties. We do not run advertising
              retargeting pixels on this site.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              SMS consent &amp; <em style={ITALIC}>mobile information.</em>
            </h2>
            <p style={P}>
              If you opt in to receive text messages from Berman Women&apos;s
              Wellness Center, we use your mobile number and SMS consent only to
              send appointment-related messages, scheduling follow-up, customer
              care messages, and service updates you requested. We do not sell,
              rent, or share SMS opt-in data, mobile numbers, or text messaging
              consent with third parties or affiliates for their marketing or
              promotional purposes. SMS opt-in data and consent are not shared
              with third parties except service providers and aggregators
              necessary to deliver the text messaging service.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              HIPAA <em style={ITALIC}>notice.</em>
            </h2>
            <p style={P}>
              The Health Insurance Portability and Accountability Act (HIPAA)
              and 45 C.F.R. &sect;164.520 require covered healthcare providers
              to give patients a Notice of Privacy Practices describing how
              their protected health information (PHI) may be used and
              disclosed. The Berman Women&apos;s Wellness Center maintains a
              separate Notice of Privacy Practices for our clinical operations,
              available at the front desk and on request from the practice.
            </p>
            <p style={P}>
              This website privacy policy is <strong>not</strong> a substitute
              for that Notice. Information you submit through the practice
              itself &mdash; intake forms in the clinic, the patient portal,
              in-person conversations, secure telehealth visits &mdash; is PHI
              and is protected under HIPAA. Information you submit through this
              website &mdash; the contact form, the AI concierge, newsletter
              signup, e-commerce orders for supplements &mdash; is governed by
              this privacy policy and is <em style={ITALIC}>not</em> encrypted
              or treated as PHI. We strongly urge visitors not to send detailed
              medical information through any form on this website.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Cookies &amp; <em style={ITALIC}>analytics.</em>
            </h2>
            <p style={P}>
              We use a small number of essential cookies to keep the site
              working &mdash; for example, to remember items in your cart
              between page loads and to keep you signed in to your order account
              during checkout. These cookies are first-party and expire when you
              close your browser or after a short session.
            </p>
            <p style={P}>
              We may use first-party analytics tools to measure how the site is
              used in aggregate. We do not currently run Google Analytics, the
              Meta Pixel, or third-party advertising tags on this site. If that
              ever changes, we will update this policy and the last-updated date
              above before the change takes effect.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Third-party <em style={ITALIC}>services.</em>
            </h2>
            <p style={P}>
              A small number of third-party vendors help us operate this site.
              We choose them carefully and limit what we share with each one to
              what is necessary for the service.
            </p>
            <ul style={UL}>
              <li>
                <strong>Vercel</strong> &mdash; hosts the website and terminates
                HTTPS connections.
              </li>
              <li>
                <strong>Supabase</strong> &mdash; stores form submissions,
                newsletter signups, and order records in a managed Postgres
                database.
              </li>
              <li>
                <strong>Anthropic</strong> &mdash; powers the AI concierge.
                Conversation transcripts are sent to Anthropic&apos;s API to
                generate responses, and may be processed in accordance with
                Anthropic&apos;s data policies. We do not send the AI concierge
                clinical PHI, and we ask you not to either.
              </li>
              <li>
                <strong>Stripe</strong> &mdash; when active, processes payments.
                Card numbers are submitted directly to Stripe and are never
                stored on our servers.
              </li>
            </ul>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Your <em style={ITALIC}>rights.</em>
            </h2>
            <p style={P}>
              Depending on where you live, you may have the right to access the
              personal information we hold about you, correct it if it is wrong,
              delete it, or restrict how we use it. California residents have
              specific rights under the California Consumer Privacy Act (CCPA),
              including the right to know what categories of personal
              information we collect, the right to request deletion, and the
              right to opt out of the sale of personal information. We do not
              sell personal information.
            </p>
            <p style={P}>
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:privacy@bermanwomenswellness.com"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                privacy@bermanwomenswellness.com
              </a>
              . We respond to verified requests within thirty days.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Data <em style={ITALIC}>retention.</em>
            </h2>
            <p style={P}>
              We keep order and transaction records for seven years, which is
              the standard retention period for medical and financial records in
              the United States. We keep newsletter subscriber records for as
              long as you remain subscribed; if you unsubscribe, we keep a
              record of your email on a suppression list so we do not
              accidentally email you again. AI concierge conversation
              transcripts are retained for ninety days unless the conversation
              resulted in a captured lead or appointment request, in which case
              the transcript is retained alongside that record.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Children under <em style={ITALIC}>eighteen.</em>
            </h2>
            <p style={P}>
              This website is intended for adults. Our content, products, and
              services are not directed at children under eighteen, and we do
              not knowingly collect personal information from anyone under
              eighteen. If you believe a child has submitted information to us,
              please contact us at the email address below and we will delete it
              promptly.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Changes to <em style={ITALIC}>this policy.</em>
            </h2>
            <p style={P}>
              We update this policy from time to time as our practices change.
              When we make a change, we update the last-updated date at the top
              of this page. If we make a material change &mdash; for example,
              adding a new third-party service that processes your data &mdash;
              we will give notice through the website and, where appropriate, by
              email to subscribers.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Contact <em style={ITALIC}>us.</em>
            </h2>
            <p style={P}>
              Questions about this policy or about the personal information we
              hold on you can be sent to{" "}
              <a
                href="mailto:privacy@bermanwomenswellness.com"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                privacy@bermanwomenswellness.com
              </a>
              .
            </p>
            <p style={P}>
              The Berman Women&apos;s Wellness Center
              <br />
              415 N. Crescent Drive, Suite 355
              <br />
              Beverly Hills, CA 90210
              <br />
              (310) 772-0072
            </p>
          </motion.section>
        </div>
      </div>

      <PageTail />
      <SiteFooter />
    </section>
  );
}
