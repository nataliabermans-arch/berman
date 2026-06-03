"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { GrainGradient, Warp } from "@paper-design/shaders-react";
import { BorderBeam } from "@/components/ui/border-beam";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;
const inlineLeadButtonStyle: CSSProperties = {
  all: "unset",
  color: "#f4a3aa",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: "rgba(244, 163, 170, 0.7)",
};

export default function PageTail() {
  return (
    <>
      {/* READY TO BE HEARD — appointment-first CTA */}
      <div
        className="e-ready"
        id="ready"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <Warp
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
        <div className="e-grain" style={{ position: "relative", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.h3
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, ease: EASE }}
          >
            Ready to be <em>heard?</em>
          </motion.h3>
          <div className="choices">
            <motion.div
              className="e-choice left"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <div className="tag">N° 01 · Beverly Hills</div>
              <h4>
                In&#8209;person <em>consultation</em>
              </h4>
              <div
                className="photo"
                role="img"
                aria-label="Dr. Berman in the Beverly Hills clinic"
                style={{
                  backgroundImage: "url(/images/ready/in-person.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 25%",
                }}
              />
              <div className="meta">
                <span>Where</span>
                <span>
                  The Berman Women&apos;s Wellness Center, Beverly Hills
                </span>
                <span>Length</span>
                <span>60–90 min new-patient consult</span>
                <span>Includes</span>
                <span>
                  Workup · plan · in-clinic procedures available same visit
                </span>
              </div>
              <button
                type="button"
                className="book"
                data-lead-open
                data-cta="open-form"
              >
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
                <span className="relative z-10">Ready to be heard? →</span>
              </button>
            </motion.div>
            <motion.div
              className="e-choice right"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            >
              <div className="tag">N° 02 · Virtual consult</div>
              <h4>
                Virtual <em>consult</em>
              </h4>
              <div
                className="photo"
                role="img"
                aria-label="Dr. Berman ready for a virtual consult"
                style={{
                  backgroundImage: "url(/images/ready/telehealth.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="meta">
                <span>Where</span>
                <span>Secure video, when appropriate</span>
                <span>Length</span>
                <span>45 min consult</span>
                <span>Best for</span>
                <span>Conversation-first planning and follow-up questions</span>
              </div>
              <button
                type="button"
                className="book"
                data-lead-open
                data-cta="open-form"
              >
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
                <span className="relative z-10">Ready to be heard? →</span>
              </button>
            </motion.div>
          </div>
          <motion.div
            className="also"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          >
            — not sure which?{" "}
            <button
              type="button"
              data-lead-open
              data-cta="open-form"
              style={inlineLeadButtonStyle}
            >
              Take the 60-second match quiz
            </button>{" "}
            &mdash; or{" "}
            <button
              type="button"
              data-lead-open
              data-cta="open-form"
              style={inlineLeadButtonStyle}
            >
              message the concierge team
            </button>
            .
          </motion.div>
        </div>
      </div>

      {/* THE BERMAN BRIEF — email fallback after the appointment ask */}
      <div
        className="e-news"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div className="e-grain" style={{ position: "relative", zIndex: 1 }} />
        <div className="news-wrap" style={{ position: "relative", zIndex: 2 }}>
          <GrainGradient
            colorBack="#1a0a10"
            colors={["#2a1018", "#3a141d", "#4a1c26"]}
            softness={0.6}
            intensity={0.35}
            noise={0.5}
            shape="wave"
            speed={0.8}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <motion.div
            className="left"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="eyebrow">A weekly letter from Dr. Berman</div>
            <h3>
              The Berman <em>Brief.</em>
            </h3>
            <p className="lede">
              Every Sunday, the questions my patients ask me behind the door —
              answered in <em>plain</em> language. Hormones, libido, pelvic
              health, the things other doctors brush past. Twenty-five years of
              listening to women, distilled into a five-minute read you can act
              on by Monday.
            </p>
            <div className="form">
              <input
                placeholder="where should I send it?"
                aria-label="Email address"
              />
              <button type="button" data-cta="open-form">
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
                <span className="play">→</span>
                <span className="relative z-10">Send me the Brief</span>
              </button>
            </div>
            <div className="bonus">
              <span className="star">✦</span> Subscribe and get{" "}
              <b>The Hormone Panel Decoder</b> with your first issue — the labs
              to ask for, and what the numbers actually mean.
            </div>
            <div className="priv">
              22,000+ readers · One click to unsubscribe, always.
            </div>
          </motion.div>
          <motion.div
            className="right"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
          >
            <img
              className="phone-brief"
              src="/images/news/phone-brief.webp"
              alt="The Berman Brief on an iPhone — preview of a recent issue"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}
