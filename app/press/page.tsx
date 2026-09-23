import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl } from "@/lib/site";
import { BOOKS } from "@/lib/books";

const seo = {
  title: "Press & Media Kit | Dr. Jennifer Berman",
  description:
    "Media kit for Dr. Jennifer Berman, MD — urologist and author of the New York Times bestsellers For Women Only and Secrets of the Sexually Satisfied Woman. High-resolution book covers, author headshots, and synopses for press use.",
  url: "/press",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: seo.title },
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: "website",
      images: [{ url: BOOKS[0].coverImage, alt: `${BOOKS[0].title} — cover` }],
    },
    alternates: { canonical: seo.url },
  };
}

const HEADSHOTS = [
  {
    src: "/images/dr-berman/headshot-portrait.webp",
    label: "Portrait — high resolution",
  },
];

// Short, press-ready synopses (factual; the books are both NYT bestsellers).
const SYNOPSIS: Record<string, string> = {
  "for-women-only":
    "The first mainstream book by a urologist to treat female sexual dysfunction as a medical condition rather than a psychological one. A New York Times bestseller and Good Morning America Book Pick, translated into eighteen languages.",
  "secrets-of-the-sexually-satisfied-woman":
    "The clinical playbook on female arousal — organized around the body, the relationship, and the self. A New York Times bestseller, featured on the Today Show and selected for the Oprah Book Club.",
};

export default function PressPage() {
  const booksLd = BOOKS.map((b) => ({
    "@type": "Book",
    name: b.title,
    author: { "@type": "Person", name: "Dr. Jennifer Berman, MD" },
    publisher: { "@type": "Organization", name: b.publisher },
    datePublished: String(b.publishedYear),
    image: `${siteUrl}${b.coverImage}`,
    inLanguage: "en",
    url: `${siteUrl}/press/`,
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Dr. Jennifer Berman, MD",
        jobTitle: "Urologist",
        url: `${siteUrl}/`,
        image: `${siteUrl}/images/dr-berman/headshot-portrait.jpg`,
      },
      ...booksLd,
    ],
  };

  return (
    <main
      style={{
        background: "#fff7f3",
        color: "#3a2226",
        minHeight: "100vh",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "28px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: 26,
            fontStyle: "italic",
            color: "#7a2233",
            textDecoration: "none",
          }}
        >
          Berman Women&apos;s Wellness
        </Link>
        <Link
          href="/books/"
          style={{ fontSize: 13, color: "#7a2233", textDecoration: "none" }}
        >
          The books &rarr;
        </Link>
      </header>

      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: 11,
            color: "#8a3a44",
            marginBottom: 10,
          }}
        >
          Press &amp; Media Kit
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(34px, 5vw, 52px)",
            lineHeight: 1.08,
            margin: "0 0 16px",
            color: "#4a1c26",
          }}
        >
          Dr. Jennifer Berman, MD
        </h1>
        <p style={{ maxWidth: 680, fontSize: 16, lineHeight: 1.6, color: "#4a1c26" }}>
          Urologist and co-founder of UCLA&apos;s Female Sexual Medicine Center;
          author of two <em>New York Times</em> bestsellers on women&apos;s
          sexual health. This page holds covers, headshots, and synopses for
          press use. (Distinct from Dr. Laura Berman, a relationship therapist.)
        </p>
        <p style={{ marginTop: 14, fontSize: 14, color: "#6b5b5e" }}>
          Media &amp; interview requests and full-resolution assets:{" "}
          <Link href="/contact/" style={{ color: "#7a2233" }}>
            contact the practice
          </Link>
          .
        </p>
      </section>

      {/* Author headshots */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 24px" }}>
        <h2 style={sectionH2}>Author headshots</h2>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {HEADSHOTS.map((h) => (
            <figure key={h.src} style={{ margin: 0, width: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={h.src}
                alt="Dr. Jennifer Berman"
                width={220}
                height={275}
                style={{
                  width: 220,
                  height: 275,
                  objectFit: "cover",
                  objectPosition: "center top",
                  borderRadius: 14,
                  border: "1px solid rgba(217,155,161,0.4)",
                }}
              />
              <figcaption style={{ marginTop: 8, fontSize: 13 }}>
                <a href={h.src} download style={downloadLink}>
                  Download &darr;
                </a>{" "}
                <span style={{ color: "#6b5b5e" }}>{h.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 12.5, color: "#8a6b6f" }}>
          Additional high-resolution headshots available on request.
        </p>
      </section>

      {/* Books */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "16px 24px 64px" }}>
        <h2 style={sectionH2}>The books</h2>
        <div style={{ display: "grid", gap: 28 }}>
          {BOOKS.map((b) => (
            <article
              key={b.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(120px, 180px) 1fr",
                gap: 24,
                alignItems: "start",
                background: "rgba(255,245,241,0.7)",
                border: "1px solid rgba(217,155,161,0.35)",
                borderRadius: 18,
                padding: 22,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.coverImage}
                alt={`${b.title} — book cover`}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(74,28,38,0.18)",
                }}
              />
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 26,
                    lineHeight: 1.15,
                    margin: "0 0 4px",
                    color: "#4a1c26",
                  }}
                >
                  {b.title}
                </h3>
                <p style={{ fontSize: 13, color: "#6b5b5e", margin: "0 0 12px" }}>
                  {b.publisher} · {b.publishedYear} · New York Times bestseller
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 14px" }}>
                  {SYNOPSIS[b.slug]}
                </p>
                <a href={b.coverImage} download style={downloadBtn}>
                  Download cover &darr;
                </a>
              </div>
            </article>
          ))}
        </div>
        <p style={{ marginTop: 18, fontSize: 12.5, color: "#8a6b6f" }}>
          Covers shown are for reference; full-resolution files are available on
          request.
        </p>
      </section>
    </main>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), serif",
  fontSize: 24,
  color: "#4a1c26",
  margin: "0 0 16px",
};

const downloadLink: React.CSSProperties = {
  color: "#7a2233",
  textDecoration: "none",
  fontWeight: 600,
};

const downloadBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: 999,
  background: "#4a1c26",
  color: "#fff5f1",
  fontSize: 12,
  fontFamily: "var(--font-dm-mono), monospace",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
};
