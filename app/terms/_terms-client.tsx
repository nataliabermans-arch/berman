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

export default function TermsClient() {
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
            Legal · Terms of Use
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
            The <em style={ITALIC_LIGHT}>agreement</em> you accept by using this
            site.
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
            What you can expect from us, what we expect from you, and the legal
            framework that holds it together. Last updated{" "}
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
              Acceptance of <em style={ITALIC}>these terms.</em>
            </h2>
            <p style={P}>
              By accessing or using this website (the
              &ldquo;Site&rdquo;), you agree to be bound by these Terms of Use
              and by our Privacy Policy. If you do not agree, please do not use
              the Site. These terms apply whether you are browsing articles,
              submitting a contact form, chatting with the AI concierge,
              subscribing to The Berman Brief, or purchasing supplements through
              the store.
            </p>
            <p style={P}>
              If you are using the Site on behalf of a business or other entity,
              you represent that you have the authority to bind that entity to
              these terms.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Medical <em style={ITALIC}>disclaimer.</em>
            </h2>
            <p style={P}>
              The content on this Site &mdash; articles, videos, the AI
              concierge&apos;s responses, product descriptions, and any other
              material &mdash; is provided for general educational and
              informational purposes only. It is{" "}
              <strong>not medical advice</strong> and is not intended to be a
              substitute for professional medical advice, diagnosis, or
              treatment from a qualified healthcare provider.
            </p>
            <p style={P}>
              Reading this Site, submitting a form, or chatting with the AI
              concierge does <em style={ITALIC}>not</em> create a
              physician-patient relationship between you and Dr. Jennifer Berman
              or The Berman Women&apos;s Wellness Center. A physician-patient
              relationship is established only through a formal consultation
              with the practice. Always seek the advice of a qualified physician
              with any questions you have about a medical condition. Never
              disregard professional medical advice or delay seeking it because
              of something you read on this Site.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Use of the <em style={ITALIC}>site.</em>
            </h2>
            <p style={P}>
              You may use the Site for your own personal, non-commercial
              purposes &mdash; reading articles, learning about treatments,
              booking a consultation, ordering supplements. The following uses
              are not permitted:
            </p>
            <ul style={UL}>
              <li>
                Scraping, harvesting, or systematically downloading content from
                the Site, except for transparent crawling by major search
                engines that respects our robots.txt.
              </li>
              <li>
                Automated access of any kind not explicitly authorized,
                including bots, headless browsers, and scripted form
                submissions.
              </li>
              <li>
                Reverse engineering, decompiling, or attempting to derive the
                source code of the Site or its underlying systems.
              </li>
              <li>
                Uploading or transmitting any virus, malware, or other harmful
                code, or interfering with the Site&apos;s normal operation.
              </li>
              <li>
                Using the Site to harass, threaten, defame, or impersonate any
                person, including Dr. Berman or her staff.
              </li>
            </ul>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Intellectual <em style={ITALIC}>property.</em>
            </h2>
            <p style={P}>
              All content on this Site &mdash; text, photographs, illustrations,
              video, audio, the design and layout of the pages, the underlying
              code, the trademarks &ldquo;Berman Women&apos;s Wellness
              Center&rdquo; and &ldquo;The Berman Brief,&rdquo; and any other
              distinctive marks &mdash; is owned by The Berman Women&apos;s
              Wellness Center or used by permission. You may not copy,
              reproduce, republish, modify, distribute, or create derivative
              works from any of it without our prior written consent, except
              that you may share short excerpts with proper attribution and a
              link back to the source page.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              SMS <em style={ITALIC}>terms.</em>
            </h2>
            <p style={P}>
              Berman Women&apos;s Wellness Center may send customer care text
              messages to users who opt in through our website forms or
              approved intake channels. Messages may include appointment request
              follow-up, scheduling coordination, appointment reminders, and
              service updates.
            </p>
            <p style={P}>
              Message frequency varies, up to 10 messages per month. Message
              and data rates may apply. Carriers are not liable for delayed or
              undelivered messages.
            </p>
            <p style={P}>
              You can cancel SMS service at any time by replying STOP. After
              you send STOP, we may send one final message confirming that you
              have unsubscribed. To rejoin, submit a new website request and
              check the SMS consent box, or contact the office. For help, reply
              HELP or call (310) 772-0072.
            </p>
            <p style={P}>
              SMS consent is not a condition of purchase or treatment. Please
              review our{" "}
              <a
                href="/privacy/"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>{" "}
              for details on how your information is used.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              The AI <em style={ITALIC}>concierge.</em>
            </h2>
            <p style={P}>
              The AI concierge available on the Site is an automated tool that
              answers questions about Dr. Berman&apos;s practice, the treatments
              offered, and how to book a visit. It is informational only. The
              concierge is <strong>not a doctor</strong>, does not have access
              to your medical history, and cannot diagnose, prescribe, or
              provide individualized medical advice. Like all AI systems, it can
              make mistakes &mdash; including stating something that is
              incorrect or out of date. Verify anything important by calling the
              practice at (310) 772-0072.
            </p>
            <p style={P}>
              Conversations with the concierge may be reviewed by our team to
              improve the experience and to follow up on appointment requests or
              questions that need a human reply. See our Privacy Policy for more
              on how those transcripts are stored.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              E-commerce <em style={ITALIC}>orders.</em>
            </h2>
            <p style={P}>
              When you place an order through the Site, you are making an offer
              to purchase the items in your cart at the prices and quantities
              shown. We accept your offer when we charge your payment method and
              confirm shipment by email. Prices, descriptions, and availability
              are subject to change without notice and may be corrected if
              errors occur.
            </p>
            <p style={P}>
              Shipping is handled by third-party carriers, with delivery times
              provided as estimates. For supplement orders: because supplements
              are consumed and cannot be safely restocked, we do not accept
              returns of opened or partially used product, except where the
              product is defective or arrived damaged. Unopened, unused product
              may be returned for a refund within fourteen days of delivery,
              with the buyer paying return shipping. To start a return, email{" "}
              <a
                href="mailto:orders@bermanwomenswellness.com"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                orders@bermanwomenswellness.com
              </a>
              .
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Limitation of <em style={ITALIC}>liability.</em>
            </h2>
            <p style={P}>
              To the fullest extent permitted by law, The Berman Women&apos;s
              Wellness Center, Dr. Jennifer Berman, and our staff, vendors, and
              affiliates are not liable for any indirect, incidental, special,
              consequential, or punitive damages, or for any loss of profits,
              revenue, data, or goodwill, arising out of or related to your use
              of the Site or any content on it. Our total liability for any
              claim arising out of or related to the Site is limited to one
              hundred U.S. dollars or the amount you paid us in the twelve
              months preceding the claim, whichever is greater.
            </p>
            <p style={P}>
              Some jurisdictions do not allow certain limitations on liability,
              so portions of this section may not apply to you. Nothing in these
              terms limits liability for fraud, gross negligence, or other
              liability that cannot be excluded by law.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              <em style={ITALIC}>Indemnification.</em>
            </h2>
            <p style={P}>
              You agree to indemnify, defend, and hold harmless The Berman
              Women&apos;s Wellness Center and its officers, employees, and
              agents from and against any claims, damages, losses, liabilities,
              and expenses (including reasonable attorneys&apos; fees) arising
              out of or related to your breach of these terms, your misuse of
              the Site, or your violation of any rights of another person or
              entity.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Governing <em style={ITALIC}>law.</em>
            </h2>
            <p style={P}>
              These terms are governed by the laws of the State of California,
              without regard to its conflict-of-laws principles. Any dispute
              arising out of or related to these terms or your use of the Site
              will be brought exclusively in the state or federal courts located
              in Los Angeles County, California, and you consent to the personal
              jurisdiction of those courts.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Changes to <em style={ITALIC}>these terms.</em>
            </h2>
            <p style={P}>
              We may revise these terms from time to time. When we do, we update
              the last-updated date at the top of this page. Your continued use
              of the Site after we post a revision constitutes your acceptance
              of the revised terms. If a revision is material, we will use
              reasonable efforts to call attention to it before it takes effect.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0, 24)} style={SECTION_BLOCK}>
            <h2 style={H2}>
              Contact <em style={ITALIC}>us.</em>
            </h2>
            <p style={P}>
              Questions about these terms can be sent to{" "}
              <a
                href="mailto:terms@bermanwomenswellness.com"
                style={{ color: "#8a3a44", textDecoration: "underline" }}
              >
                terms@bermanwomenswellness.com
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
