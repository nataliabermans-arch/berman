"use client";

import { useRef } from "react";
import { Globe, Mail, UserRound } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";

import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

const quickLinks = [
  { label: "About", href: "/about/" },
  { label: "Blog", href: "/womens-health-blog/" },
  { label: "Contact", href: "/contact/" },
  { label: "Book Consultation", href: "/contact/" },
];

const services = [
  { label: "Hormone Therapy", href: "/hormone-therapy/" },
  { label: "Menopause Care", href: "/menopause-perimenopause/" },
  { label: "Vaginal Rejuvenation", href: "/vaginal-rejuvenation-expert/" },
  { label: "Sexual & Urinary Health", href: "/sexual-urinary-tract-health/" },
];

function isLeadFooterLink(link: { label: string; href: string }) {
  const href = link.href.trim();
  return (
    href === "/contact" ||
    href === "/contact/" ||
    href === "#lead" ||
    href === "#ready" ||
    /book|consult|schedule|ready/i.test(link.label)
  );
}

/**
 * Four-column footer with practice links, office details, and newsletter signup.
 * Uses the footer bloom background and a compact legal bottom bar.
 */
export function Footer({ className }: FooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(footerRef, {
    once: true,
    amount: 0.3,
    margin: "-10% 0px -30% 0px",
  });
  const prefersReducedMotion = useReducedMotion();
  const columnMotion = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 20 },
    animate:
      prefersReducedMotion || isInView
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 20 },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <footer
      ref={footerRef}
      className={cn("bg-footer-bloom px-container pt-section pb-8", className)}
    >
      <div className="mx-auto max-w-content-max">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <motion.div {...columnMotion(0)}>
            <a
              href="/"
              className="font-cormorant text-6xl font-medium italic leading-none text-ink"
            >
              Berman
            </a>
            <p className="mt-5 max-w-sm font-inter text-sm leading-6 text-text-secondary">
              Beverly Hills women&apos;s wellness care led by Dr. Jennifer
              Berman.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/jenbermanmd/",
                  icon: Globe,
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/people/Berman-Womens-Wellness-Center/61559558050724/",
                  icon: UserRound,
                },
                {
                  label: "Email",
                  href: "mailto:info@bermanwomenswellness.com",
                  icon: Mail,
                },
              ].map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-line bg-white/70 text-ink transition-colors hover:border-rose-300 hover:text-rose-700"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div {...columnMotion(0.08)}>
            <FooterLinkColumn title="Quick Links" links={quickLinks} />
          </motion.div>
          <motion.div {...columnMotion(0.16)}>
            <FooterLinkColumn title="Services" links={services} />
          </motion.div>

          <motion.div {...columnMotion(0.24)}>
            <h2 className="font-dm-mono text-[0.68rem] uppercase tracking-[0.2em] text-text-tertiary">
              Practice Info
            </h2>
            <div className="mt-5 space-y-4 font-inter text-sm leading-6 text-text-secondary">
              <p>
                415 N. Crescent Drive, Suite 355
                <br />
                Beverly Hills, CA 90210
              </p>
              <p>
                <a href="tel:+13107720072" className="hover:text-rose-700">
                  (310) 772-0072
                </a>
              </p>
              <p>
                Monday-Friday
                <br />
                9:00 AM-5:00 PM
              </p>
            </div>
          </motion.div>
        </div>

        <form
          action="#"
          className="mt-12 grid gap-3 rounded-lg border border-line bg-white/65 p-4 shadow-subtle md:grid-cols-[1fr_auto] md:items-center"
        >
          <label className="sr-only" htmlFor="footer-email">
            Email address
          </label>
          <Input
            id="footer-email"
            name="email"
            type="email"
            placeholder="Your email - The Berman Brief, monthly"
            className="h-12 rounded-full border-line bg-white px-5"
          />
          <GlowCtaButton
            variant="primary"
            href="/womens-health-blog/"
            size="sm"
            className="justify-center"
          >
            Sign up
          </GlowCtaButton>
        </form>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 font-dm-mono text-[0.64rem] uppercase leading-5 tracking-[0.16em] text-text-tertiary md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Berman Women&apos;s Wellness</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/privacy/" className="hover:text-rose-700">
              Privacy
            </a>
            <a href="/terms/" className="hover:text-rose-700">
              Terms
            </a>
            <span>HIPAA-compliant communications available by request.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkColumnProps {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <nav aria-label={title}>
      <h2 className="font-dm-mono text-[0.68rem] uppercase tracking-[0.2em] text-text-tertiary">
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => {
          const opensLead = isLeadFooterLink(link);
          const leadTriggerProps = opensLead
            ? ({
                "data-lead-open": true,
                "data-cta": "open-form",
              } as const)
            : {};

          return (
            <li key={`${link.label}-${link.href}`}>
              <a
                href={opensLead ? "/contact/" : link.href}
                {...leadTriggerProps}
                className="font-inter text-sm text-text-secondary transition-colors hover:text-rose-700"
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Footer;
