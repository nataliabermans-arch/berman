"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { BorderBeam } from "@/components/ui/border-beam";
import { GrainGradient } from "@paper-design/shaders-react";

export default function BermanBriefSection() {
  const newsRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="e-news"
      ref={newsRef}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        className="e-grain"
        style={{ position: "relative", zIndex: 1 }}
      ></div>
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
          transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="eyebrow">A weekly letter from Dr. Berman</div>
          <h3>
            The Berman <em>Brief.</em>
          </h3>
          <p className="lede">
            Every Sunday, the questions my patients ask me behind the door —
            answered in <em>plain</em> language. Hormones, libido, pelvic
            health, the things other doctors brush past. Twenty-five years of
            listening to women, distilled into a five-minute read you can act on
            by Monday.
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
            <b>The Hormone Panel Decoder</b> with your first issue — the labs to
            ask for, and what the numbers actually mean.
          </div>
          <div className="priv">
            22,000+ readers · One click to unsubscribe, always.
          </div>
        </motion.div>
        <motion.div
          className="right"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            delay: 0.15,
            ease: [0.2, 0.7, 0.2, 1],
          }}
          viewport={{ once: true, margin: "-80px" }}
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
  );
}
