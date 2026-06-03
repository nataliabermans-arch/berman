"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Warp } from "@paper-design/shaders-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { openLeadCapture } from "@/components/lead/LeadCapture";

const inlineLeadButtonStyle: CSSProperties = {
  all: "unset",
  color: "#f4a3aa",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: "rgba(244, 163, 170, 0.7)",
};

export default function ReadyToBeHeardSection() {
  const readyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sec = readyRef.current;
    if (!sec) return;

    if (getComputedStyle(sec).position === "static") {
      sec.style.position = "relative";
    }

    const light = document.createElement("div");
    light.className = "cursor-light";
    light.style.setProperty("--mx", "50%");
    light.style.setProperty("--my", "40%");
    sec.appendChild(light);

    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      light.style.setProperty(
        "--mx",
        `${((e.clientX - r.left) / r.width) * 100}%`,
      );
      light.style.setProperty(
        "--my",
        `${((e.clientY - r.top) / r.height) * 100}%`,
      );
    };
    const onLeave = () => {
      light.style.setProperty("--mx", "50%");
      light.style.setProperty("--my", "40%");
    };

    sec.addEventListener("pointermove", onMove);
    sec.addEventListener("pointerleave", onLeave);

    return () => {
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("pointerleave", onLeave);
      if (light.parentNode === sec) {
        sec.removeChild(light);
      }
    };
  }, []);

  const openConcierge = useCallback(() => {
    openLeadCapture();
  }, []);

  return (
    <div
      className="e-ready"
      ref={readyRef}
      id="ready"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <Warp
        colors={["#1a0a10", "#5a2030", "#a13a48"]}
        speed={0.4}
        rotation={0.2}
        proportion={0.5}
        softness={0.7}
        distortion={0.25}
        swirl={0.3}
        swirlIterations={6}
        shape="checks"
        shapeScale={0.4}
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
        className="e-grain"
        style={{ position: "relative", zIndex: 1 }}
      ></div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <motion.h3
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Ready to be <em>heard?</em>
        </motion.h3>
        <div className="choices">
          <motion.div
            className="e-choice left"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={{ once: true, margin: "-80px" }}
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
            ></div>
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
              onClick={openConcierge}
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
              <span className="relative z-10">Book in-person →</span>
            </button>
          </motion.div>
          <motion.div
            className="e-choice right"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="tag">N° 02 · Anywhere</div>
            <h4>
              Telehealth <em>visit</em>
            </h4>
            <div
              className="photo"
              role="img"
              aria-label="Dr. Berman ready for a telehealth visit"
              style={{
                backgroundImage: "url(/images/ready/telehealth.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="meta">
              <span>Where</span>
              <span>Secure video · your phone or laptop</span>
              <span>Length</span>
              <span>45 min consult</span>
              <span>Best for</span>
              <span>Hormones, supplements, follow-ups, second opinions</span>
            </div>
            <button
              type="button"
              className="book"
              onClick={openConcierge}
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
              <span className="relative z-10">Book telehealth →</span>
            </button>
          </motion.div>
        </div>
        <motion.div
          className="also"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.2, 0.7, 0.2, 1],
          }}
          viewport={{ once: true, margin: "-60px" }}
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
  );
}
