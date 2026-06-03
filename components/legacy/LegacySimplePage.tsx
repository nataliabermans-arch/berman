"use client";

import Link from "next/link";

import SiteFooter from "@/components/layout/SiteFooter";
import SiteNav from "@/components/layout/SiteNav";
import { BorderBeam } from "@/components/ui/border-beam";

interface LegacySimplePageProps {
  title: string;
  description: string;
  eyebrow?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export default function LegacySimplePage({
  title,
  description,
  eyebrow = "The Berman Women's Wellness Center",
  ctaHref = "/contact/",
  ctaLabel = "Request a consultation",
}: LegacySimplePageProps) {
  return (
    <main data-active="E">
      <section className="legacy-page">
        <SiteNav />
        <div className="legacy-page__inner">
          <p className="legacy-page__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="legacy-page__lede">{description}</p>
          <div className="legacy-page__actions">
            <Link href={ctaHref} className="legacy-page__primary">
              <BorderBeam
                size={80}
                duration={8}
                colorFrom="#f4a3aa"
                colorTo="#d97580"
                borderWidth={1.5}
              />
              <span>{ctaLabel}</span>
            </Link>
            <Link href="/womens-health-blog/" className="legacy-page__secondary">
              Visit the blog
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
      <style jsx>{`
        .legacy-page {
          position: relative;
          min-height: 76vh;
          overflow: hidden;
          padding: 168px 24px 96px;
          background:
            radial-gradient(
              circle at 18% 18%,
              rgba(244, 163, 170, 0.32),
              transparent 34%
            ),
            linear-gradient(135deg, #fff8f4 0%, #fff1eb 46%, #f6d8d8 100%);
          color: #4a1c26;
        }

        .legacy-page__inner {
          position: relative;
          z-index: 2;
          max-width: 920px;
          margin: 0 auto;
        }

        .legacy-page__eyebrow {
          margin: 0 0 24px;
          font-family: var(--font-dm-mono), "DM Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8a3a44;
        }

        h1 {
          max-width: 820px;
          margin: 0;
          font-family: var(--font-cormorant), "Cormorant Garamond", serif;
          font-size: clamp(54px, 8vw, 112px);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -0.01em;
        }

        .legacy-page__lede {
          max-width: 680px;
          margin: 32px 0 0;
          font-size: clamp(19px, 2.5vw, 25px);
          line-height: 1.5;
          color: rgba(74, 28, 38, 0.82);
        }

        .legacy-page__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 42px;
        }

        .legacy-page__primary,
        .legacy-page__secondary {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          border-radius: 999px;
          padding: 0 24px;
          font-family: var(--font-dm-mono), "DM Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-decoration: none;
          text-transform: uppercase;
        }

        .legacy-page__primary {
          overflow: hidden;
          background: #4a1c26;
          color: #fff8f4;
        }

        .legacy-page__primary span {
          position: relative;
          z-index: 1;
        }

        .legacy-page__secondary {
          border: 1px solid rgba(74, 28, 38, 0.24);
          color: #4a1c26;
        }

        @media (max-width: 720px) {
          .legacy-page {
            padding-top: 144px;
          }
        }
      `}</style>
    </main>
  );
}
