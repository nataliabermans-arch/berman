"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { GrainGradient, MeshGradient } from "@paper-design/shaders-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTail from "../../services/_page-tail";
import { BorderBeam } from "@/components/ui/border-beam";
import { openLeadCapture } from "@/components/lead/LeadCapture";
import AddToCartButton from "@/components/commerce/AddToCartButton";
import {
  getConversionTargetForCategory,
  type ConversionTarget,
} from "@/lib/journal/conversion-map";
import { SUPPLEMENTS, SUPPLEMENT_BUNDLE } from "@/lib/services/supplements";
import type { JournalArticle } from "@/lib/journal/types";
import { siteUrl } from "@/lib/site";

const FALLBACK_IMAGE = "/images/dr-berman/headshot-portrait.webp";

function imageFor(article: { featuredImage?: string }) {
  return article.featuredImage || FALLBACK_IMAGE;
}

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const fadeUp = (delay = 0, y = 28) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.6, delay, ease: EASE },
});

const monoLabel: React.CSSProperties = {
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: 11,
};

const cormHeadline: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 400,
  letterSpacing: "-0.01em",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const priceToNumber = (price: string) =>
  Number(price.replace(/[^0-9.]/g, "")) || 0;

function ItalicHeadline({
  text,
  italicWord,
}: {
  text: string;
  italicWord: string;
}) {
  const idx = italicWord ? text.indexOf(italicWord) : -1;
  if (idx === -1) return <>{text}</>;
  const pre = text.slice(0, idx);
  const post = text.slice(idx + italicWord.length);
  return (
    <>
      {pre}
      <em style={{ color: "#8a3a44", fontStyle: "italic" }}>{italicWord}</em>
      {post}
    </>
  );
}

const markdownComponents: Components = {
  h2: ({ children }) => {
    const text = String(children).trim();
    const id = slugify(text);
    return (
      <h2
        id={id}
        style={{
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: "clamp(28px, 3vw, 38px)",
          lineHeight: 1.18,
          letterSpacing: "-0.01em",
          color: "#4a1c26",
          margin: "56px 0 22px",
          fontStyle: "italic",
          scrollMarginTop: 96,
        }}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: "clamp(22px, 2.2vw, 28px)",
        lineHeight: 1.22,
        letterSpacing: "-0.005em",
        color: "#4a1c26",
        margin: "40px 0 16px",
        fontStyle: "italic",
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: "clamp(19px, 1.5vw, 21px)",
        lineHeight: 1.65,
        color: "#4a1c26",
        margin: "0 0 22px",
      }}
    >
      {children}
    </p>
  ),
  em: ({ children }) => (
    <em style={{ color: "#8a3a44", fontStyle: "italic" }}>{children}</em>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#4a1c26", fontWeight: 600 }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: "clamp(19px, 1.5vw, 21px)",
        lineHeight: 1.6,
        color: "#4a1c26",
        margin: "0 0 26px",
        paddingLeft: 28,
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: "clamp(19px, 1.5vw, 21px)",
        lineHeight: 1.6,
        color: "#4a1c26",
        margin: "0 0 26px",
        paddingLeft: 28,
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: 10 }}>{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      style={{
        color: "#8a3a44",
        textDecoration: "underline",
        textUnderlineOffset: 3,
      }}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "clamp(20px, 1.6vw, 23px)",
        lineHeight: 1.55,
        color: "#8a3a44",
        margin: "32px 0",
        paddingLeft: 24,
        borderLeft: "2px solid rgba(138,58,68,0.4)",
      }}
    >
      {children}
    </blockquote>
  ),
};

function RelatedCard({
  article,
  index,
}: {
  article: JournalArticle;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, delay: index * 0.08, ease: EASE }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,245,241,0.7)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(217,155,161,0.35)",
        borderRadius: 22,
        overflow: "hidden",
        color: "#4a1c26",
      }}
    >
      <Link
        href={`/${article.slug}`}
        aria-label={`Read: ${article.title}`}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          textDecoration: "none",
          color: "inherit",
        }}
      />
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "linear-gradient(135deg,#f4d4d4,#d99ba1)",
        }}
      >
        <img
          src={imageFor(article)}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: 0.95,
          }}
        />
      </div>
      <div
        style={{
          padding: "24px 24px 26px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        <div style={{ ...monoLabel, color: "#8a3a44", fontSize: 10 }}>
          {article.category}
        </div>
        <h4
          style={{
            ...cormHeadline,
            fontSize: "clamp(20px, 1.7vw, 24px)",
            lineHeight: 1.18,
            margin: 0,
            color: "#4a1c26",
          }}
        >
          <ItalicHeadline
            text={article.title}
            italicWord={article.italicWord}
          />
        </h4>
        <span
          style={{
            ...monoLabel,
            fontSize: 10,
            color: "#8a3a44",
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "1px solid rgba(217,155,161,0.3)",
          }}
        >
          {article.readTime} min · {formatDate(article.publishedAt)}
        </span>
      </div>
    </motion.article>
  );
}

function ReadingProgressBar({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 3,
        background: "linear-gradient(90deg, #f4a3aa 0%, #d97580 100%)",
        transformOrigin: "left",
        scaleX,
      }}
    />
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShareRow({ article }: { article: JournalArticle }) {
  const [copied, setCopied] = useState(false);
  const url = article.originalUrl || `${siteUrl}/${article.slug}/`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(article.title);
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const linkedinHref = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; silently fall through.
    }
  }

  const pillStyle: React.CSSProperties = {
    ...monoLabel,
    fontSize: 11,
    height: 38,
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    background: "rgba(255,245,241,0.7)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(217,155,161,0.5)",
    color: "#8a3a44",
    textDecoration: "none",
    cursor: "pointer",
    transition: "transform 0.25s ease, border-color 0.25s ease",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE }}
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: 720,
        margin: "20px auto 0",
        padding: "8px 6vw 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ ...monoLabel, color: "#8a3a44", fontSize: 11 }}>Share</div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href={twitterHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Twitter / X"
          style={pillStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#8a3a44";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(217,155,161,0.5)";
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </a>
        <a
          href={linkedinHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          style={pillStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#8a3a44";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(217,155,161,0.5)";
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
          </svg>
          LinkedIn
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy article link"
          style={pillStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#8a3a44";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(217,155,161,0.5)";
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </motion.div>
  );
}

interface TocItem {
  id: string;
  text: string;
}

function TocDrawer({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <aside
      className="article-toc"
      aria-label="In this piece"
      style={{
        position: "fixed",
        right: 28,
        top: "26vh",
        width: 220,
        zIndex: 30,
      }}
    >
      <div
        style={{
          padding: 24,
          background: "rgba(255,245,241,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(217,155,161,0.4)",
          borderRadius: 14,
          opacity: 0.7,
          transition: "opacity 0.25s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        <div
          style={{
            ...monoLabel,
            fontSize: 10,
            color: "#8a3a44",
            marginBottom: 14,
          }}
        >
          In this piece
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} style={{ margin: 0 }}>
                <a
                  href={`#${item.id}`}
                  style={{
                    display: "block",
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 14,
                    lineHeight: 1.35,
                    color: active ? "#8a3a44" : "#4a1c26",
                    textDecoration: "none",
                    padding: "8px 0 8px 12px",
                    borderLeft: active
                      ? "2px solid #8a3a44"
                      : "2px solid transparent",
                    transition: "color 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "#8a3a44";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "#4a1c26";
                  }}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mini consult card under TOC */}
      <div
        style={{
          marginTop: 16,
          padding: 20,
          background: "rgba(255,245,241,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(217,155,161,0.4)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            ...monoLabel,
            fontSize: 10,
            color: "#8a3a44",
            fontStyle: "italic",
            textTransform: "none",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          Need a real plan?
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.2,
            color: "#4a1c26",
            marginBottom: 14,
          }}
        >
          Book a <em style={{ color: "#8a3a44" }}>consult.</em>
        </div>
        <button
          type="button"
          onClick={openLeadCapture}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 999,
            background: "#4a1c26",
            color: "#fff5f1",
            border: "none",
            cursor: "pointer",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            overflow: "hidden",
          }}
        >
          <span style={{ position: "relative", zIndex: 2 }}>
            Open concierge →
          </span>
          <BorderBeam
            size={60}
            duration={8}
            colorFrom="#f4a3aa"
            colorTo="#d97580"
            borderWidth={1.5}
          />
        </button>
      </div>
    </aside>
  );
}

function EditorialCallout({ target }: { target: ConversionTarget }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE }}
      style={{
        maxWidth: 720,
        margin: "48px 0",
        padding: "20px 26px",
        background: "rgba(255,245,241,0.7)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(217,155,161,0.35)",
        borderLeft: "3px solid #d99ba1",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          ...monoLabel,
          fontSize: 10,
          color: "#8a3a44",
          marginBottom: 10,
        }}
      >
        Read next →
      </div>
      <Link
        href={`/services/${target.serviceSlug}`}
        style={{
          display: "block",
          fontFamily: SERIF,
          fontSize: "clamp(22px, 2vw, 26px)",
          lineHeight: 1.3,
          color: "#4a1c26",
          textDecoration: "none",
        }}
      >
        Read about Dr. Berman&apos;s{" "}
        <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
          {target.serviceName}
        </em>{" "}
        program.
      </Link>
    </motion.aside>
  );
}

function InlineProductCard({ target }: { target: ConversionTarget }) {
  const supplement = useMemo(
    () =>
      [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS].find(
        (s) => s.slug === target.supplementSlug,
      ),
    [target.supplementSlug],
  );

  if (!supplement) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        maxWidth: 720,
        margin: "48px 0",
        padding: 28,
        background: "rgba(255,245,241,0.78)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(217,155,161,0.4)",
        borderRadius: 18,
      }}
      className="inline-product-card"
    >
      <div
        className="ipc-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            borderRadius: 14,
            overflow: "hidden",
            background:
              "radial-gradient(circle at 35% 30%, #4a1c26 0%, #1a0a10 78%)",
            border: "1px solid rgba(217,155,161,0.35)",
          }}
        >
          <img
            src={supplement.image}
            alt={supplement.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 14,
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              ...monoLabel,
              fontSize: 10,
              color: "#8a3a44",
            }}
          >
            What Dr. Berman recommends
          </div>
          <h4
            style={{
              ...cormHeadline,
              fontSize: "clamp(24px, 2.2vw, 28px)",
              lineHeight: 1.2,
              color: "#4a1c26",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            <ItalicHeadline
              text={supplement.name}
              italicWord={supplement.italicWord}
            />
          </h4>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 16,
              lineHeight: 1.5,
              color: "#4a1c26",
              opacity: 0.85,
              margin: 0,
            }}
          >
            {supplement.tagline}
          </p>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 24,
              color: "#8a3a44",
              marginTop: 4,
            }}
          >
            {supplement.price}
          </div>
          <div style={{ marginTop: 6 }}>
            <AddToCartButton
              productSlug={supplement.slug}
              name={supplement.name}
              price={priceToNumber(supplement.price)}
              image={supplement.image}
            />
          </div>
          <div
            style={{
              ...monoLabel,
              fontSize: 10,
              color: "#8a3a44",
              marginTop: 8,
              textTransform: "none",
              letterSpacing: "0.06em",
              fontFamily: SERIF,
              fontStyle: "italic",
            }}
          >
            First order —{" "}
            <code
              style={{
                fontFamily: MONO,
                fontStyle: "normal",
                fontSize: 11,
                background: "rgba(138,58,68,0.1)",
                padding: "2px 8px",
                borderRadius: 4,
                letterSpacing: "0.15em",
                color: "#4a1c26",
              }}
            >
              {target.couponCode}
            </code>{" "}
            {target.couponLabel}.
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 640px) {
              .inline-product-card .ipc-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </motion.aside>
  );
}

function WhatToDoNext({ target }: { target: ConversionTarget }) {
  const supplement = useMemo(
    () =>
      [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS].find(
        (s) => s.slug === target.supplementSlug,
      ),
    [target.supplementSlug],
  );

  const cardBase: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 28,
    background: "rgba(255,245,241,0.7)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(217,155,161,0.4)",
    borderRadius: 22,
    color: "#4a1c26",
    minHeight: 340,
  };

  const eyebrowStyle: React.CSSProperties = {
    ...monoLabel,
    fontSize: 10,
    color: "#8a3a44",
  };

  const headStyle: React.CSSProperties = {
    ...cormHeadline,
    fontSize: "clamp(22px, 2vw, 26px)",
    lineHeight: 1.18,
    fontStyle: "italic",
    color: "#4a1c26",
    margin: 0,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: SERIF,
    fontSize: 16,
    lineHeight: 1.5,
    color: "#4a1c26",
    opacity: 0.85,
    margin: 0,
  };

  const primaryBtn: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 22px",
    borderRadius: 999,
    background: "#4a1c26",
    color: "#fff5f1",
    border: "none",
    cursor: "pointer",
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    overflow: "hidden",
    width: "fit-content",
    textDecoration: "none",
  };

  const [email, setEmail] = useState("");

  return (
    <div
      style={{
        position: "relative",
        padding: "60px 6vw 40px",
        color: "#4a1c26",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 24,
            marginBottom: 36,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ ...monoLabel, fontSize: 11, color: "#8a3a44" }}>
              What to do next
            </div>
            <h2
              style={{
                ...cormHeadline,
                fontSize: "clamp(28px, 3.2vw, 44px)",
                lineHeight: 1.08,
                color: "#4a1c26",
                margin: "10px 0 0",
              }}
            >
              Three ways to{" "}
              <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                keep going
              </em>
              .
            </h2>
          </div>
        </motion.div>

        <div
          className="next-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 22,
          }}
        >
          {/* CARD 1 — Talk to Dr. Berman */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={cardBase}
          >
            <div style={eyebrowStyle}>Real consult</div>
            <h3 style={headStyle}>
              In-person or <em style={{ color: "#8a3a44" }}>telehealth.</em>
            </h3>
            <p style={bodyStyle}>
              60–90 minute new-patient consult with Dr. Berman — workup, plan,
              and same-visit procedures available in Beverly Hills.
            </p>
            <div style={{ marginTop: "auto", paddingTop: 12 }}>
              <button
                type="button"
                onClick={openLeadCapture}
                style={primaryBtn}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  Ready to be heard? →
                </span>
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
              </button>
            </div>
          </motion.article>

          {/* CARD 2 — Try [supplement] */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
            style={cardBase}
          >
            <div style={eyebrowStyle}>Dr. Berman recommends</div>
            <h3 style={headStyle}>
              Try{" "}
              {supplement ? (
                <ItalicHeadline
                  text={supplement.name}
                  italicWord={supplement.italicWord}
                />
              ) : (
                <em style={{ color: "#8a3a44" }}>the starter stack</em>
              )}
              .
            </h3>
            {supplement && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 120,
                  borderRadius: 12,
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at 30% 30%, #4a1c26 0%, #1a0a10 75%)",
                  border: "1px solid rgba(217,155,161,0.3)",
                }}
              >
                <img
                  src={supplement.image}
                  alt={supplement.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: 10,
                  }}
                />
              </div>
            )}
            {supplement && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "#8a3a44",
                }}
              >
                {supplement.price}
              </div>
            )}
            <div style={{ marginTop: "auto", paddingTop: 8 }}>
              {supplement ? (
                <AddToCartButton
                  productSlug={supplement.slug}
                  name={supplement.name}
                  price={priceToNumber(supplement.price)}
                  image={supplement.image}
                />
              ) : (
                <Link href="/services/supplements/" style={primaryBtn}>
                  <span style={{ position: "relative", zIndex: 2 }}>
                    See the shelf →
                  </span>
                  <BorderBeam
                    size={80}
                    duration={8}
                    colorFrom="#f4a3aa"
                    colorTo="#d97580"
                    borderWidth={1.5}
                  />
                </Link>
              )}
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#8a3a44",
                  marginTop: 10,
                }}
              >
                First order —{" "}
                <code
                  style={{
                    fontFamily: MONO,
                    fontStyle: "normal",
                    fontSize: 11,
                    background: "rgba(138,58,68,0.1)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.15em",
                    color: "#4a1c26",
                  }}
                >
                  {target.couponCode}
                </code>{" "}
                {target.couponLabel}.
              </div>
            </div>
          </motion.article>

          {/* CARD 3 — Get The Brief */}
          <motion.article
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, delay: 0.16, ease: EASE }}
            style={cardBase}
          >
            <div style={eyebrowStyle}>Weekly letter</div>
            <h3 style={headStyle}>
              The Berman <em style={{ color: "#8a3a44" }}>Brief.</em>
            </h3>
            <p style={bodyStyle}>
              Every Sunday — the questions patients ask Dr. Berman behind the
              door, in plain language. Five-minute read.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: "auto",
                paddingTop: 12,
              }}
            >
              <input
                type="email"
                placeholder="where should I send it?"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(217,155,161,0.5)",
                  background: "rgba(255,245,241,0.6)",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#4a1c26",
                  outline: "none",
                }}
              />
              <button type="submit" style={primaryBtn}>
                <span style={{ position: "relative", zIndex: 2 }}>
                  Send me the Brief →
                </span>
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
              </button>
            </form>
          </motion.article>
        </div>
      </div>
    </div>
  );
}

function splitOnH2(body: string): string[] {
  const lines = body.split("\n");
  const segments: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.startsWith("## ") && current.length > 0) {
      segments.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) segments.push(current.join("\n"));
  return segments;
}

export default function ArticleClient({
  article,
  related,
}: {
  article: JournalArticle;
  related: JournalArticle[];
}) {
  const articleRef = useRef<HTMLElement>(null);

  const wordCount = useMemo(
    () =>
      article.wordCount ||
      article.body.trim().split(/\s+/).filter(Boolean).length,
    [article],
  );

  const tocItems = useMemo<TocItem[]>(() => {
    if (wordCount <= 800) return [];
    const matches = [...article.body.matchAll(/^##\s+(.+)$/gm)];
    return matches.map((m) => {
      const text = m[1].trim();
      return { id: slugify(text), text };
    });
  }, [article, wordCount]);

  const target = useMemo(
    () => getConversionTargetForCategory(article.category),
    [article.category],
  );

  const segments = useMemo(() => splitOnH2(article.body), [article.body]);

  return (
    <>
      <section className="wf" data-id="E">
        {/* Reading progress bar — fixed top, scroll-driven */}
        <ReadingProgressBar targetRef={articleRef} />

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

        {/* 1. HERO */}
        <div
          className="e-rounded-section article-hero"
          style={{
            position: "relative",
            padding: "180px 6vw 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            color: "#4a1c26",
          }}
        >
          <SiteNav />
          <GrainGradient
            colors={["#ffeae0", "#f4d4d4", "#f4a3aa"]}
            colorBack="#fff5f1"
            shape="sphere"
            speed={0.9}
            scale={0.6}
            noise={0.4}
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

          <div
            className="article-hero-inner"
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: 920,
              width: "100%",
            }}
          >
            <motion.div
              {...fadeUp(0.05, 14)}
              className="article-hero-crumb"
              style={{
                ...monoLabel,
                fontSize: 11,
                color: "#8a3a44",
                marginBottom: 26,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link
                href="/womens-health-blog/"
                style={{
                  color: "#8a3a44",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(138,58,68,0.4)",
                  paddingBottom: 2,
                }}
              >
                Journal
              </Link>
              <span style={{ opacity: 0.5 }}>/</span>
              <span>{article.category}</span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.15, 24)}
              className="article-hero-title"
              style={{
                ...cormHeadline,
                fontSize: "clamp(40px, 5.4vw, 76px)",
                lineHeight: 1.06,
                color: "#4a1c26",
                margin: 0,
              }}
            >
              <ItalicHeadline
                text={article.title}
                italicWord={article.italicWord}
              />
            </motion.h1>

            <motion.div
              {...fadeUp(0.28, 16)}
              className="article-hero-meta"
              style={{
                ...monoLabel,
                fontSize: 11,
                color: "#8a3a44",
                marginTop: 36,
                display: "flex",
                gap: 18,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span>{formatDate(article.publishedAt)}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{article.readTime} min read</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{article.category}</span>
            </motion.div>

            <motion.p
              {...fadeUp(0.4, 18)}
              className="article-hero-excerpt"
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(20px, 1.7vw, 25px)",
                lineHeight: 1.5,
                color: "#4a1c26",
                maxWidth: 720,
                margin: "32px auto 0",
                opacity: 0.92,
                fontStyle: "italic",
              }}
            >
              {article.excerpt}
            </motion.p>

            <motion.div
              {...fadeUp(0.55, 24)}
              className="article-hero-media"
              style={{
                marginTop: 56,
                padding: 14,
                borderRadius: 22,
                background: "rgba(255,245,241,0.6)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(217,155,161,0.4)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  overflow: "hidden",
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#d99ba1,#8a3a44)",
                }}
              >
                <img
                  src={imageFor(article)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    opacity: 0.95,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* 2. ARTICLE BODY */}
        <article
          ref={articleRef}
          className="article-body"
          style={{
            position: "relative",
            padding: "80px 6vw 60px",
            color: "#4a1c26",
          }}
        >
          {tocItems.length > 0 && <TocDrawer items={tocItems} />}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: 720,
              margin: "0 auto",
              background: "rgba(255,245,241,0.7)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(217,155,161,0.35)",
              borderRadius: 28,
              padding: "60px clamp(28px, 5vw, 64px) 64px",
            }}
            className="article-prose"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                marginBottom: 32,
                borderRadius: 999,
                background: "rgba(255,245,241,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(217,155,161,0.5)",
                color: "#8a3a44",
                ...monoLabel,
                fontSize: 11,
              }}
            >
              <ClockIcon />
              <span>{article.readTime} min read</span>
            </div>

            {segments[0] !== undefined && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {segments[0]}
              </ReactMarkdown>
            )}

            {segments[1] !== undefined && (
              <>
                <EditorialCallout target={target} />
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {segments[1]}
                </ReactMarkdown>
              </>
            )}

            {segments[2] !== undefined && (
              <>
                <InlineProductCard target={target} />
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {segments[2]}
                </ReactMarkdown>
              </>
            )}

            {segments.slice(3).map((seg, i) => (
              <ReactMarkdown
                key={i}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {seg}
              </ReactMarkdown>
            ))}
          </motion.div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                .article-prose > p:first-of-type::first-letter {
                  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
                  font-style: italic;
                  color: #8a3a44;
                  font-size: 5.6em;
                  line-height: 0.85;
                  float: left;
                  margin: 0.05em 0.12em -0.05em 0;
                  font-weight: 500;
                }
                @media (max-width: 640px) {
                  .article-hero {
                    padding: 112px 20px 44px !important;
                    min-height: auto !important;
                    overflow: hidden;
                  }
                  .article-hero-inner {
                    max-width: 100% !important;
                  }
                  .article-hero-crumb {
                    gap: 8px !important;
                    margin-bottom: 18px !important;
                    font-size: 10px !important;
                    letter-spacing: 0.16em !important;
                    flex-wrap: wrap !important;
                  }
                  .article-hero-title {
                    font-size: clamp(34px, 10.5vw, 44px) !important;
                    line-height: 1.02 !important;
                  }
                  .article-hero-meta {
                    gap: 9px !important;
                    margin-top: 22px !important;
                    font-size: 10px !important;
                    letter-spacing: 0.14em !important;
                  }
                  .article-hero-excerpt {
                    font-size: 19px !important;
                    line-height: 1.42 !important;
                    margin-top: 22px !important;
                    max-width: 100% !important;
                  }
                  .article-hero-media {
                    margin-top: 30px !important;
                    padding: 8px !important;
                    border-radius: 16px !important;
                  }
                  .article-hero-media > div {
                    aspect-ratio: 4 / 3 !important;
                    border-radius: 10px !important;
                  }
                  .article-body {
                    padding: 36px 16px 34px !important;
                  }
                  .article-prose {
                    width: 100% !important;
                    max-width: none !important;
                    border-radius: 20px !important;
                    padding: 34px 28px 42px !important;
                  }
                  .article-prose h2 {
                    font-size: clamp(27px, 8.5vw, 34px) !important;
                    line-height: 1.12 !important;
                    margin: 42px 0 18px !important;
                  }
                  .article-prose h3 {
                    font-size: clamp(22px, 7vw, 27px) !important;
                    line-height: 1.16 !important;
                    margin: 34px 0 14px !important;
                  }
                  .article-prose p,
                  .article-prose ul,
                  .article-prose ol {
                    font-size: 19px !important;
                    line-height: 1.58 !important;
                  }
                  .article-prose > p:first-of-type::first-letter {
                    float: none !important;
                    font-size: inherit !important;
                    line-height: inherit !important;
                    margin: 0 !important;
                    font-weight: inherit !important;
                  }
                  .article-prose aside {
                    margin: 30px 0 !important;
                    padding: 18px 20px !important;
                  }
                  .inline-product-card {
                    padding: 20px !important;
                    border-radius: 16px !important;
                  }
                  .inline-product-card .ipc-grid > div:first-child {
                    width: min(190px, 100%) !important;
                    margin: 0 auto !important;
                  }
                  .next-grid article {
                    min-height: auto !important;
                    padding: 22px !important;
                    border-radius: 18px !important;
                  }
                  .next-grid button,
                  .next-grid a {
                    max-width: 100% !important;
                    white-space: normal !important;
                    text-align: center !important;
                    line-height: 1.25 !important;
                  }
                  body .lead-mobile-banner.lead-mobile-banner {
                    display: none !important;
                  }
                }
              `,
            }}
          />
        </article>

        {/* 3. SHARE ROW */}
        <ShareRow article={article} />

        {/* 4. WHAT TO DO NEXT — 3-card conversion ladder */}
        <WhatToDoNext target={target} />

        {/* 5. AUTHOR BIO STRIP — small */}
        <div
          style={{
            position: "relative",
            padding: "24px 6vw 60px",
            color: "#4a1c26",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: 720,
              margin: "0 auto",
              background: "rgba(255,245,241,0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(217,155,161,0.3)",
              borderRadius: 18,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
            className="author-strip"
          >
            <div
              style={{
                position: "relative",
                width: 56,
                height: 56,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: "1px solid rgba(138,58,68,0.3)",
                background: "linear-gradient(135deg,#f4d4d4,#d99ba1)",
              }}
            >
              <img
                src="/images/dr-berman/headshot-portrait.webp"
                alt="Dr. Jennifer Berman"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                lineHeight: 1.45,
                color: "#4a1c26",
                opacity: 0.9,
              }}
            >
              <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                Dr. Jennifer Berman, MD
              </em>{" "}
              · Founder, The Berman Women&apos;s Wellness Center ·{" "}
              <Link
                href="/about/"
                style={{
                  color: "#8a3a44",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Read full bio →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 6. RELATED ARTICLES */}
        {related.length > 0 && (
          <div
            style={{
              position: "relative",
              padding: "40px 6vw 140px",
              color: "#4a1c26",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 10,
                maxWidth: 1320,
                margin: "0 auto",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.55, ease: EASE }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 24,
                  marginBottom: 40,
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    ...cormHeadline,
                    fontSize: "clamp(28px, 3.2vw, 44px)",
                    lineHeight: 1.08,
                    color: "#4a1c26",
                    margin: 0,
                  }}
                >
                  Keep{" "}
                  <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                    reading
                  </em>
                  .
                </h2>
                <Link
                  href="/womens-health-blog/"
                  style={{
                    ...monoLabel,
                    fontSize: 11,
                    color: "#8a3a44",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(138,58,68,0.4)",
                    paddingBottom: 2,
                  }}
                >
                  All articles →
                </Link>
              </motion.div>
              <div
                className="related-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${related.length}, minmax(0, 1fr))`,
                  gap: 28,
                }}
              >
                {related.map((a, i) => (
                  <RelatedCard key={a.slug} article={a} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. PageTail — DIRECT CHILD */}
        <PageTail />

        {/* 8. SiteFooter — DIRECT CHILD */}
        <SiteFooter />

        {/* Responsive */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 1280px) {
                .article-toc {
                  display: none !important;
                }
              }
              @media (max-width: 1024px) {
                .related-grid {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
                .next-grid {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
              }
              @media (max-width: 720px) {
                .next-grid {
                  grid-template-columns: 1fr !important;
                }
              }
              @media (max-width: 640px) {
                .related-grid {
                  grid-template-columns: 1fr !important;
                }
                .author-strip {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                }
              }
            `,
          }}
        />
      </section>

    </>
  );
}
