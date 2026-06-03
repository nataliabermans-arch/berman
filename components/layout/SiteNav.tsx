"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import type { NavChild, NavItem } from "@/lib/nav";
import { NAV_ITEMS } from "@/lib/nav";

const CartIcon = dynamic(() => import("@/components/commerce/CartIcon"), {
  ssr: false,
});
const CartDrawer = dynamic(() => import("@/components/commerce/CartDrawer"), {
  ssr: false,
});

type SiteNavProps = {
  showCart?: boolean;
};

const ABOUT_ORDER = ["About", "Books", "Biotype"] as const;
const PATIENT_ORDER = ["Stories", "Blog", "Contact"] as const;
const SERVICE_LINK_ORDER: string[] = [
  "/aesthetic-treatments/",
  "/sexual-urinary-tract-health/",
  "/emsella-treatment-for-incontinence/",
  "/menopause-perimenopause/",
  "/vaginal-rejuvenation-expert/",
  "/body-contouring/",
  "/services/supplements/",
];

const toChild = (item: NavItem): NavChild => ({
  label: item.label,
  href: item.href,
});

const pickLinks = (order: readonly string[]) =>
  order
    .map((label) => NAV_ITEMS.find((item) => item.label === label))
    .filter((item): item is NavItem => Boolean(item))
    .map(toChild);

export default function SiteNav({ showCart = false }: SiteNavProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pillRef = useRef<HTMLAnchorElement | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleMenuToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((o) => !o);
  }, []);

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const servicesItem = useMemo(
    () => NAV_ITEMS.find((item) => item.label === "Services"),
    [],
  );

  const practiceLinks = useMemo(() => {
    if (!servicesItem) return [] as NavChild[];
    const children = servicesItem.children ?? [];
    const childrenByHref = new Map(
      children.map((child) => [child.href, child]),
    );
    const orderedChildren = SERVICE_LINK_ORDER.flatMap((href) => {
      const match = childrenByHref.get(href);
      return match ? [match] : [];
    });
    const remainingChildren = children.filter(
      (child) => !SERVICE_LINK_ORDER.includes(child.href),
    );
    return [
      { label: servicesItem.label, href: servicesItem.href },
      ...orderedChildren,
      ...remainingChildren,
    ];
  }, [servicesItem]);

  const aboutLinks = useMemo(() => pickLinks(ABOUT_ORDER), []);
  const patientLinks = useMemo(() => pickLinks(PATIENT_ORDER), []);

  // cursor-magnetic pill
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const RADIUS = 80;
    const MAX_SHIFT = 8;
    const onMove = (e: PointerEvent) => {
      const r = pill.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const factor = (1 - dist / RADIUS) * MAX_SHIFT;
        pill.style.setProperty("--pill-mx", `${(dx / dist) * factor}px`);
        pill.style.setProperty("--pill-my", `${(dy / dist) * factor}px`);
        pill.style.transition = "transform 0.18s cubic-bezier(.2,.7,.2,1)";
      } else {
        pill.style.setProperty("--pill-mx", "0px");
        pill.style.setProperty("--pill-my", "0px");
      }
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  // mega menu: outside-click + Escape close
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="e-hero-nav" style={{ zIndex: 60 }}>
        <div className="left">
          <button
            ref={menuBtnRef}
            className="e-menu-btn"
            type="button"
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="e-mega"
            onClick={handleMenuToggle}
          >
            <span className="ico">
              <span></span>
              <span></span>
              <span></span>
            </span>
            Menu
          </button>
        </div>
        <div className="center">
          <img src="/images/jb-logo.png" alt="Jennifer Berman MD" />
        </div>
        <div className="right">
          {showCart ? <CartIcon /> : null}
          <a
            ref={pillRef}
            className="pill"
            href="/contact/"
            data-lead-open
            data-cta="open-form"
          >
            Ready to be heard? <span className="arr">→</span>
            <BorderBeam
              size={80}
              duration={8}
              colorFrom="#f4a3aa"
              colorTo="#d97580"
              borderWidth={1.5}
            />
          </a>
        </div>
      </div>
      <div
        ref={megaRef}
        className={`e-mega${menuOpen ? " open" : ""}`}
        id="e-mega"
        role="region"
        aria-label="Main menu"
        onClick={stopProp}
        style={{ zIndex: 70 }}
      >
        <div className="col">
          <h6>The Practice</h6>
          {practiceLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="col">
          <h6>About</h6>
          {aboutLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="col">
          <h6>Patients</h6>
          {patientLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="feature">
          <div className="eyebrow">New patient</div>
          <h4>
            Ready to be <em>heard?</em>
          </h4>
          <p>
            A 60–90 minute new-patient consult with Dr. Berman. We listen, we
            work it up, we make a plan together.
          </p>
          <button
            type="button"
            className="go"
            data-lead-open
            data-cta="open-form"
          >
            Book a consult →
          </button>
        </div>
      </div>
      {showCart ? <CartDrawer /> : null}
    </>
  );
}
