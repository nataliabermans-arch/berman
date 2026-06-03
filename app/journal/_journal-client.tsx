"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { GrainGradient, MeshGradient } from "@paper-design/shaders-react";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import PageTail from "../services/_page-tail";
import {
  JOURNAL_CATEGORIES,
  type JournalArticle,
  type JournalArticleSummary,
  type JournalCategory,
} from "@/lib/journal/types";

const ease = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const viewportOnce = { once: true, margin: "-80px" } as const;

const fadeUp = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportOnce,
  transition: { duration: 0.6, delay, ease },
});

const FALLBACK_IMAGE = "/images/dr-berman/headshot-portrait.webp";

function imageFor(article: { featuredImage?: string }) {
  return article.featuredImage || FALLBACK_IMAGE;
}

function ItalicHeadline({
  text,
  italicWord,
  tone = "light",
}: {
  text: string;
  italicWord: string;
  tone?: "light" | "dark";
}) {
  const idx = italicWord ? text.indexOf(italicWord) : -1;
  const emColor = tone === "dark" ? "#f4a3aa" : "#8a3a44";
  if (idx === -1) return <>{text}</>;
  const pre = text.slice(0, idx);
  const post = text.slice(idx + italicWord.length);
  return (
    <>
      {pre}
      <em style={{ color: emColor, fontStyle: "italic" }}>{italicWord}</em>
      {post}
    </>
  );
}

const monoLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', ui-monospace, monospace",
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: 11,
};

const cormHeadline: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
  fontWeight: 400,
  letterSpacing: "-0.01em",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type CardArticle = JournalArticle | JournalArticleSummary;

function ArticleCard({
  article,
  index,
}: {
  article: CardArticle;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.55, delay: index * 0.06, ease }}
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
        href={`/${article.slug}/`}
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
            mixBlendMode: "multiply",
            opacity: 0.95,
          }}
        />
      </div>
      <div
        style={{
          padding: "26px 26px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
        }}
      >
        <div style={{ ...monoLabel, color: "#8a3a44" }}>{article.category}</div>
        <h3
          style={{
            ...cormHeadline,
            fontSize: "clamp(22px, 1.9vw, 28px)",
            lineHeight: 1.15,
            margin: 0,
            color: "#4a1c26",
          }}
        >
          <ItalicHeadline
            text={article.title}
            italicWord={article.italicWord}
          />
        </h3>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            lineHeight: 1.55,
            color: "#4a1c26",
            opacity: 0.85,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(217,155,161,0.3)",
          }}
        >
          <span style={{ ...monoLabel, color: "#8a3a44", fontSize: 10 }}>
            {article.readTime} min · {formatDate(article.publishedAt)}
          </span>
          <span
            style={{
              ...monoLabel,
              fontSize: 10,
              color: "#8a3a44",
              borderBottom: "1px solid rgba(138,58,68,0.4)",
              paddingBottom: 2,
              opacity: 0.95,
            }}
          >
            Read article →
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function FeatureCard({ article }: { article: CardArticle }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease }}
      style={{
        position: "relative",
        background: "rgba(255,245,241,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(217,155,161,0.4)",
        borderRadius: 28,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "#4a1c26",
      }}
    >
      <Link
        href={`/${article.slug}/`}
        aria-label={`Read featured article: ${article.title}`}
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
          aspectRatio: "16 / 10",
          overflow: "hidden",
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
            opacity: 0.92,
          }}
        />
      </div>
      <div
        style={{
          padding: "36px 38px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ ...monoLabel, color: "#8a3a44", fontSize: 11 }}>
          Featured · {article.category}
        </div>
        <h2
          style={{
            ...cormHeadline,
            fontSize: "clamp(32px, 3.4vw, 48px)",
            lineHeight: 1.08,
            margin: 0,
            color: "#4a1c26",
          }}
        >
          <ItalicHeadline
            text={article.title}
            italicWord={article.italicWord}
          />
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
            fontSize: "clamp(18px, 1.4vw, 21px)",
            lineHeight: 1.5,
            color: "#4a1c26",
            opacity: 0.92,
            margin: 0,
          }}
        >
          {article.excerpt}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(217,155,161,0.3)",
          }}
        >
          <span style={{ ...monoLabel, color: "#8a3a44" }}>
            {article.readTime} min read · {formatDate(article.publishedAt)}
          </span>
          <span
            style={{
              ...monoLabel,
              color: "#8a3a44",
              borderBottom: "1px solid rgba(138,58,68,0.4)",
              paddingBottom: 3,
              opacity: 0.95,
            }}
          >
            Read article →
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function MiniFeatureCard({
  article,
  delay,
}: {
  article: CardArticle;
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.65, delay, ease }}
      style={{
        position: "relative",
        background: "rgba(255,245,241,0.7)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(217,155,161,0.35)",
        borderRadius: 22,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        color: "#4a1c26",
        minHeight: 0,
      }}
    >
      <Link
        href={`/${article.slug}/`}
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
          overflow: "hidden",
          background: "linear-gradient(135deg,#f4d4d4,#d99ba1)",
          minHeight: 200,
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
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <div style={{ ...monoLabel, color: "#8a3a44", fontSize: 10 }}>
          {article.category}
        </div>
        <h4
          style={{
            ...cormHeadline,
            fontSize: "clamp(20px, 1.7vw, 24px)",
            lineHeight: 1.15,
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
            marginTop: 6,
          }}
        >
          {article.readTime} min · {formatDate(article.publishedAt)}
        </span>
      </div>
    </motion.article>
  );
}

const CATEGORY_FILTERS: JournalCategory[] = [...JOURNAL_CATEGORIES];

function PaginationFooter(_props: { currentPage: number; totalPages: number }) {
  return null;
}

interface JournalClientProps {
  pageArticles: JournalArticle[];
  totalPages: number;
  total: number;
  currentPage: number;
  allArticleSummaries: JournalArticleSummary[];
}

export default function JournalClient({
  pageArticles,
  totalPages,
  total,
  currentPage,
  allArticleSummaries,
}: JournalClientProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<JournalCategory>("All");
  const [search, setSearch] = useState("");

  const isFiltering = selectedCategory !== "All" || search.trim() !== "";
  const isFirstPage = currentPage === 1;

  const featuredArticle = useMemo(
    () => (isFirstPage && pageArticles.length > 0 ? pageArticles[0] : null),
    [isFirstPage, pageArticles],
  );
  const miniFeatured = useMemo(
    () =>
      isFirstPage && pageArticles.length >= 3 ? pageArticles.slice(1, 3) : [],
    [isFirstPage, pageArticles],
  );
  const recentArticles = useMemo(
    () =>
      isFirstPage && pageArticles.length > 3
        ? pageArticles.slice(3)
        : pageArticles,
    [isFirstPage, pageArticles],
  );

  const filteredArticles = useMemo(() => {
    if (!isFiltering) return [] as JournalArticleSummary[];
    const q = search.trim().toLowerCase();
    return allArticleSummaries.filter((a) => {
      const catMatch =
        selectedCategory === "All" || a.category === selectedCategory;
      const searchMatch =
        q === "" ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [isFiltering, selectedCategory, search, allArticleSummaries]);

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

      {/* 1. HERO */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "82vh",
          padding: "180px 6vw 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1080,
            width: "100%",
          }}
        >
          <motion.div
            {...fadeUp(0.05, 18)}
            style={{
              ...monoLabel,
              fontSize: 12,
              color: "#8a3a44",
              marginBottom: 28,
            }}
          >
            The Berman Brief · Long-form clinical writing
            {currentPage > 1 ? ` · Page ${currentPage}` : ""}
          </motion.div>

          <motion.h1
            {...fadeUp(0.15, 24)}
            style={{
              ...cormHeadline,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1.04,
              color: "#4a1c26",
              margin: 0,
            }}
          >
            Questions my patients ask{" "}
            <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
              behind the door.
            </em>
          </motion.h1>

          <motion.p
            {...fadeUp(0.28, 20)}
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: "#4a1c26",
              maxWidth: 720,
              margin: "32px auto 0",
              opacity: 0.92,
            }}
          >
            Updated regularly. Written or co-written by Dr. Berman. The journal
            exists because most of what should be a fifteen-minute conversation
            in an exam room never happens — so it lives here instead.
          </motion.p>

          <motion.div
            {...fadeUp(0.4, 16)}
            style={{
              marginTop: 48,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <label htmlFor="journal-search" className="sr-only">
              Search journal
            </label>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 560,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 22,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8a3a44",
                  fontSize: 18,
                  pointerEvents: "none",
                }}
              >
                ⌕
              </span>
              <input
                id="journal-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search journal — testosterone, PT-141, perimenopause…"
                style={{
                  width: "100%",
                  padding: "18px 24px 18px 52px",
                  borderRadius: 999,
                  background: "rgba(255,245,241,0.7)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(217,155,161,0.5)",
                  color: "#4a1c26",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  outline: "none",
                  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8a3a44";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(217,155,161,0.35)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(217,155,161,0.5)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.5, 16)}
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              maxWidth: 920,
              marginInline: "auto",
            }}
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...monoLabel,
                    fontSize: 11,
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: active
                      ? "1px solid #4a1c26"
                      : "1px solid rgba(138,58,68,0.4)",
                    background: active ? "#4a1c26" : "rgba(255,245,241,0.55)",
                    color: active ? "#fff5f1" : "#8a3a44",
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    transition:
                      "background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* 2. FEATURED GRID — only first page, no filtering */}
      {!isFiltering &&
        isFirstPage &&
        featuredArticle &&
        miniFeatured.length === 2 && (
          <div
            style={{
              position: "relative",
              padding: "120px 6vw 60px",
              color: "#4a1c26",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 10,
                maxWidth: 1320,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
                gap: 32,
                alignItems: "stretch",
              }}
              className="journal-feature-grid"
            >
              <FeatureCard article={featuredArticle} />
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: "1fr 1fr",
                  gap: 24,
                }}
              >
                <MiniFeatureCard article={miniFeatured[0]} delay={0.15} />
                <MiniFeatureCard article={miniFeatured[1]} delay={0.28} />
              </div>
            </div>
          </div>
        )}

      {/* 3. RECENT GRID or filtered list */}
      <div
        style={{
          position: "relative",
          padding:
            isFiltering || !isFirstPage ? "120px 6vw 140px" : "60px 6vw 140px",
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
            {...fadeUp(0.05, 16)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 24,
              marginBottom: 48,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                ...cormHeadline,
                fontSize: "clamp(32px, 4vw, 56px)",
                lineHeight: 1.06,
                color: "#4a1c26",
                margin: 0,
              }}
            >
              {isFiltering ? (
                <>
                  Filtered{" "}
                  <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                    writing
                  </em>
                  .
                </>
              ) : (
                <>
                  Recent{" "}
                  <em style={{ color: "#8a3a44", fontStyle: "italic" }}>
                    writing
                  </em>
                  .
                </>
              )}
            </h2>
            <span style={{ ...monoLabel, color: "#8a3a44" }}>
              {isFiltering
                ? `Showing ${filteredArticles.length} result${filteredArticles.length === 1 ? "" : "s"} across all articles`
                : `${recentArticles.length} on this page · ${total} total`}
            </span>
          </motion.div>

          {isFiltering && filteredArticles.length === 0 ? (
            <motion.div
              {...fadeUp(0.05, 16)}
              style={{
                textAlign: "center",
                padding: "80px 24px",
                background: "rgba(255,245,241,0.7)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(217,155,161,0.35)",
                borderRadius: 24,
              }}
            >
              <h3
                style={{
                  ...cormHeadline,
                  fontSize: "clamp(28px, 3vw, 40px)",
                  margin: 0,
                  color: "#4a1c26",
                }}
              >
                Nothing matches{" "}
                <em style={{ color: "#8a3a44", fontStyle: "italic" }}>yet.</em>
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  color: "#4a1c26",
                  opacity: 0.8,
                  marginTop: 18,
                }}
              >
                Try a different search or category.
              </p>
            </motion.div>
          ) : (
            <div
              className="journal-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 28,
              }}
            >
              {(isFiltering
                ? (filteredArticles as CardArticle[])
                : (recentArticles as CardArticle[])
              ).map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          )}

          {!isFiltering && (
            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>

      <PageTail />

      <SiteFooter />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1024px) {
              .journal-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .journal-feature-grid {
                grid-template-columns: 1fr !important;
              }
            }
            @media (max-width: 640px) {
              .journal-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
