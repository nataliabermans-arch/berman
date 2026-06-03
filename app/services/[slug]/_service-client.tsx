"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MeshGradient,
  GrainGradient,
  NeuroNoise,
} from "@paper-design/shaders-react";

import { BorderBeam } from "@/components/ui/border-beam";
import { SERVICE_BY_SLUG, type ServiceSlug } from "@/lib/services/content";
import PageTail from "../_page-tail";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

type Tone = "light" | "dark";

function renderItalic(
  text: string,
  italicWord: string,
  tone: Tone = "light",
): React.ReactNode {
  if (!italicWord) return text;
  const idx = text.indexOf(italicWord);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + italicWord.length);
  const emClass =
    tone === "dark"
      ? "italic font-serif text-[#f4a3aa]"
      : "italic font-serif text-[#8a3a44]";
  return (
    <>
      {before}
      <em className={emClass}>{italicWord}</em>
      {after}
    </>
  );
}

function HeadlineLines({
  text,
  italicWord,
  tone = "light",
}: {
  text: string;
  italicWord: string;
  tone?: Tone;
}) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const node = renderItalic(line, italicWord, tone);
        return (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {node}
          </React.Fragment>
        );
      })}
    </>
  );
}

function ServiceDetailClient({ slug }: { slug: ServiceSlug }) {
  const s = SERVICE_BY_SLUG[slug];

  return (
    <section className="wf" data-id="E">
      {/* Global ambient MeshGradient — fixed behind every section */}
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

      {/* 1. HERO (with overlaid SiteNav) */}
      <div
        className="e-rounded-section relative px-6 md:px-12 lg:px-20 pt-40 pb-24 md:pt-44 md:pb-32"
        style={{ position: "relative" }}
      >
        <SiteNav />
        {/* Per-section GrainGradient — light cream/blush tones for an inviting hero */}
        <GrainGradient
          colors={["#ffeae0", "#f4d4d4", "#f4a3aa"]}
          colorBack="#fff5f1"
          shape="sphere"
          speed={0.9}
          scale={0.7}
          noise={0.35}
          softness={0.85}
          intensity={0.3}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div className="e-grain absolute inset-0 z-[1]" />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <motion.div
            className="mb-10 font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <a href="/services/" className="hover:underline">
              Treatments
            </a>
            <span className="mx-2 opacity-50">/</span>
            <span>{s.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20 items-start">
            <div>
              <motion.div
                className="mb-6 font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              >
                {s.eyebrowTag}
              </motion.div>
              <motion.h1
                className="font-serif text-[clamp(48px,7vw,108px)] leading-[1.02] tracking-[-0.02em] text-[#4a1c26]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              >
                <HeadlineLines
                  text={s.hero.headline}
                  italicWord={s.hero.italicWord}
                  tone="light"
                />
              </motion.h1>
              <motion.p
                className="mt-8 max-w-[640px] font-serif text-[20px] md:text-[22px] leading-[1.5] text-[#4a1c26]/85"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
              >
                {s.hero.sub}
              </motion.p>
              {s.seoSupport ? (
                <motion.p
                  className="mt-5 max-w-[660px] text-[15px] md:text-[16px] leading-[1.65] text-[#4a1c26]/75"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.55, delay: 0.28, ease: EASE }}
                >
                  {renderItalic(
                    s.seoSupport.text,
                    s.seoSupport.italicWord,
                    "light",
                  )}
                </motion.p>
              ) : null}
              <motion.div
                className="mt-10 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
              >
                <a
                  href="/contact/"
                  data-lead-open
                  data-cta="open-form"
                  className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[#4a1c26] px-7 py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[#fff5f1]"
                >
                  <BorderBeam
                    size={80}
                    duration={8}
                    colorFrom="#f4a3aa"
                    colorTo="#d97580"
                    borderWidth={1.5}
                  />
                  <span className="relative z-10">Ready to be heard?</span>
                  <span className="relative z-10">→</span>
                </a>
                <a
                  href="#process"
                  className="inline-flex items-center gap-2 rounded-full border border-[#4a1c26]/25 px-6 py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[#4a1c26] hover:bg-[#4a1c26]/5"
                >
                  How it works <span aria-hidden="true">↓</span>
                </a>
              </motion.div>
            </div>

            <motion.aside
              className="relative rounded-2xl border border-[#d99ba1]/40 bg-white/8 p-8 backdrop-blur-md"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8a3a44]">
                At a glance
              </div>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4a1c26]/60">
                    Initial consultation
                  </dt>
                  <dd className="mt-1 font-serif text-[22px] text-[#4a1c26]">
                    {s.atAGlance.consultation}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4a1c26]/60">
                    Follow-up cadence
                  </dt>
                  <dd className="mt-1 font-serif text-[22px] text-[#4a1c26]">
                    {s.atAGlance.followUp}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4a1c26]/60">
                    Setting
                  </dt>
                  <dd className="mt-1 font-serif text-[22px] text-[#4a1c26]">
                    {s.atAGlance.setting}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4a1c26]/60">
                    Insurance
                  </dt>
                  <dd className="mt-1 font-serif text-[22px] text-[#4a1c26]">
                    {s.atAGlance.insurance}
                  </dd>
                </div>
              </dl>
            </motion.aside>
          </div>
        </div>
      </div>

      {/* 2. SYMPTOMS GRID */}
      <div className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <motion.div
            className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
          >
            What it treats
          </motion.div>
          <motion.h2
            className="mt-5 max-w-[1000px] font-serif text-[clamp(34px,4.6vw,64px)] leading-[1.1] tracking-[-0.015em] text-[#4a1c26]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {renderItalic(
              s.treatsHeading.text,
              s.treatsHeading.italicWord,
              "light",
            )}
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.symptoms.map((sym, idx) => (
              <motion.article
                key={sym.ix}
                className="rounded-2xl border border-[#d99ba1]/40 bg-white/55 p-7 backdrop-blur-md"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.08,
                  ease: EASE,
                }}
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a3a44]">
                  {sym.ix}
                </div>
                <h3 className="mt-4 font-serif text-[26px] leading-[1.18] text-[#4a1c26]">
                  {renderItalic(sym.title, sym.italicWord, "light")}
                </h3>
                <p className="mt-4 text-[16px] leading-[1.6] text-[#4a1c26]/80">
                  {sym.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PROCESS */}
      <div
        id="process"
        className="e-rounded-section relative px-6 md:px-12 lg:px-20 py-24 md:py-32"
      >
        {/* Per-section NeuroNoise — light tones, matches the home e-quote.dark treatment */}
        <NeuroNoise
          colorBack="#fff5f1"
          colorMid="#fef0ee"
          colorFront="#fbd2d2"
          brightness={0.35}
          contrast={0.4}
          scale={1.1}
          speed={0.3}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <motion.div
            className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
          >
            How it works
          </motion.div>
          <motion.h2
            className="mt-5 max-w-[900px] font-serif text-[clamp(34px,4.6vw,64px)] leading-[1.08] tracking-[-0.015em] text-[#4a1c26]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {renderItalic(
              s.processHeading.text,
              s.processHeading.italicWord,
              "light",
            )}
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {s.process.map((step, idx) => (
              <motion.article
                key={step.num}
                className="relative overflow-hidden rounded-2xl border border-[#d99ba1]/40 bg-white/55 p-7 backdrop-blur-md min-h-[260px]"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: EASE,
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 right-3 font-serif italic leading-none text-[#d99ba1]/35"
                  style={{ fontSize: "clamp(96px, 9vw, 128px)" }}
                >
                  {step.num}
                </span>
                <h3 className="relative font-serif text-[24px] leading-[1.2] text-[#4a1c26]">
                  {renderItalic(step.title, step.italicWord, "light")}
                </h3>
                <p className="relative mt-4 text-[15px] leading-[1.6] text-[#4a1c26]/80">
                  {step.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      {/* 4. EXPECT (timeline) */}
      <div className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <motion.div
            className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
          >
            What to expect
          </motion.div>
          <motion.h2
            className="mt-5 max-w-[900px] font-serif text-[clamp(34px,4.6vw,64px)] leading-[1.08] tracking-[-0.015em] text-[#4a1c26]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {renderItalic(
              s.expectHeading.text,
              s.expectHeading.italicWord,
              "light",
            )}
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-start">
            <ol className="relative border-l border-[#d99ba1]/45 pl-10">
              {s.expect.map((item, idx) => (
                <motion.li
                  key={idx}
                  className="relative mb-12 last:mb-0"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.09,
                    ease: EASE,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[46px] top-1 inline-flex h-3 w-3 rounded-full bg-[#d97580] ring-4 ring-[#fff5f1]"
                  />
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8a3a44]">
                    {item.when}
                  </div>
                  <h3 className="mt-2 font-serif text-[24px] leading-[1.2] text-[#4a1c26]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-[#4a1c26]/80">
                    {item.body}
                  </p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              className="relative overflow-hidden rounded-2xl border border-[#d99ba1]/40 bg-white/8 backdrop-blur-md aspect-[4/5]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <img
                src={s.heroImage}
                alt={`${s.name} — clinical reference`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 5. FAQ */}
      <div className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="relative z-10 mx-auto max-w-[880px]">
          <motion.div
            className="text-center font-mono text-[12px] uppercase tracking-[0.22em] text-[#8a3a44]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
          >
            FAQ
          </motion.div>
          <motion.h2
            className="mt-5 text-center font-serif text-[clamp(34px,4.4vw,60px)] leading-[1.1] tracking-[-0.015em] text-[#4a1c26]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {renderItalic(s.faqHeading.text, s.faqHeading.italicWord, "light")}
          </motion.h2>

          <div className="mt-14">
            {s.faqs.map((f, idx) => (
              <motion.details
                key={idx}
                className="group border-t border-[#4a1c26]/15 last:border-b py-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.06,
                  ease: EASE,
                }}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-[22px] md:text-[24px] leading-[1.3] text-[#4a1c26] [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-block shrink-0 font-mono text-[28px] leading-none text-[#8a3a44] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[760px] text-[16px] leading-[1.65] text-[#4a1c26]/80">
                  {f.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </div>

      {/* 6 + 7. PAGE TAIL — appointment CTA, then Berman Brief email capture */}
      <PageTail />

      {/* 8. FOOTER */}
      <SiteFooter />
    </section>
  );
}

export default ServiceDetailClient;
