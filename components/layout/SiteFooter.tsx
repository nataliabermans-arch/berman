"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { FOOTER_QUICK_LINKS, FOOTER_SERVICES } from "@/lib/nav";

const footerLogoInline: CSSProperties = { color: "var(--paper)" };
const footerLogoDotInline: CSSProperties = { color: "var(--accent)" };
const footerAddrInline: CSSProperties = { marginTop: 12 };
const footerLinkStyle: CSSProperties = {
  display: "inline-block",
  color: "inherit",
  textDecoration: "none",
};

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy-policy/" },
  { label: "Terms", href: "/terms-of-use/" },
  { label: "Accessibility", href: "/accessibility" },
];

const LEGITSCRIPT_SEAL = {
  href: "https://www.legitscript.com/websites/?checker_keywords=bermansexualhealth.com",
  imageSrc: "https://static.legitscript.com/seals/18241954.png",
  title: "Verify LegitScript Approval for www.bermansexualhealth.com",
  alt: "Verify LegitScript Approval for www.bermansexualhealth.com",
};

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="a-footer">
        <div className="col">
          <div className="logo-mark" style={footerLogoInline}>
            Berman Sexual Health
            <span style={footerLogoDotInline}>.</span>
          </div>
          <p style={footerAddrInline}>
            The Berman Women&apos;s Wellness Center
            <br />
            Beverly Hills, CA
          </p>
          <div className="news">
            <input
              placeholder="Your email — The Berman Brief, monthly"
              aria-label="Footer email address"
            />
            <button type="button">
              <BorderBeam
                size={80}
                duration={8}
                colorFrom="#f4a3aa"
                colorTo="#d97580"
                borderWidth={1.5}
              />
              <span className="relative z-10">Sign up</span>
            </button>
          </div>
        </div>
        <div className="col">
          <h6>Practice</h6>
          {FOOTER_SERVICES.map(({ label, href }) => (
            <p key={href}>
              <a href={href} style={footerLinkStyle}>
                {label}
              </a>
            </p>
          ))}
        </div>
        <div className="col">
          <h6>About</h6>
          {FOOTER_QUICK_LINKS.map(({ label, href }) => (
            <p key={href}>
              <a href={href} style={footerLinkStyle}>
                {label}
              </a>
            </p>
          ))}
        </div>
        <div className="col">
          <h6>Visit</h6>
          <button
            type="button"
            className="visit-button"
            data-lead-open
            data-cta="open-form"
          >
            Book in-person
          </button>
          <button
            type="button"
            className="visit-button"
            data-lead-open
            data-cta="open-form"
          >
            Book telehealth
          </button>
          <button
            type="button"
            className="visit-button"
            data-lead-open
            data-cta="open-form"
          >
            Concierge
          </button>
          <button
            type="button"
            className="visit-button"
            data-lead-open
            data-cta="open-form"
          >
            Contact
          </button>
        </div>
      </div>
      <div className="footer-tail">
        <span className="footer-tail__copy">
          © {new Date().getFullYear()} The Berman Women&apos;s Wellness Center
        </span>
        <a
          className="legitscript-seal"
          href={LEGITSCRIPT_SEAL.href}
          target="_blank"
          rel="noopener noreferrer"
          title={LEGITSCRIPT_SEAL.title}
          aria-label="Verify LegitScript Approval for Berman Sexual Health"
        >
          <img
            src={LEGITSCRIPT_SEAL.imageSrc}
            alt={LEGITSCRIPT_SEAL.alt}
            width="73"
            height="79"
            loading="lazy"
            decoding="async"
          />
        </a>
        <nav aria-label="Legal" className="footer-tail__links">
          {LEGAL_LINKS.map(({ label, href }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <style jsx>{`
        .site-footer {
          background: var(--ink);
          color: var(--paper);
          display: grid;
          gap: 0;
        }

        .footer-tail {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          padding: 18px 56px 26px;
          font-family: var(--font-dm-mono), "DM Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .legitscript-seal {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          opacity: 0.72;
          transition: opacity 180ms ease;
        }

        .legitscript-seal:hover,
        .legitscript-seal:focus-visible {
          opacity: 1;
        }

        .legitscript-seal :global(img) {
          display: block;
          width: 54px;
          height: auto;
        }

        .footer-tail__links {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .visit-button {
          display: block;
          margin: 0 0 8px;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-family: var(--font-cormorant), "Cormorant Garamond", serif;
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.9;
          text-align: left;
        }

        .visit-button:hover {
          color: var(--accent);
        }

        .footer-tail__links :global(a) {
          color: inherit;
          text-decoration: none;
        }

        .footer-tail__links :global(a:hover) {
          opacity: 0.75;
        }

        @media (max-width: 768px) {
          .footer-tail {
            padding: 20px 20px 32px;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .footer-tail__links {
            gap: 16px;
          }
        }
      `}</style>
    </footer>
  );
}
