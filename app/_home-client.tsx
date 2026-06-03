"use client";

import React from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import { BorderBeam } from "@/components/ui/border-beam";
import GlowCtaButton from "@/components/atoms/GlowCtaButton";
import type { NavChild, NavItem } from "@/lib/nav";
import { FOOTER_QUICK_LINKS, FOOTER_SERVICES, NAV_ITEMS } from "@/lib/nav";
import {
  SmokeRing,
  GrainGradient,
  MeshGradient,
  NeuroNoise,
  Warp,
} from "@paper-design/shaders-react";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
// CursorLight import removed — manifesto was the only consumer; other dark sections use the cursor-light injection effect (see useEffect below)

const HERO_VIDEO_POSTER = "/video/sizzle-poster-v1.jpg";
const HERO_MOBILE_VIDEO = "/video/sizzle-mobile-v1.mp4";
const HERO_DESKTOP_VIDEO = "/video/sizzle-desktop-v1.mp4";
const WELCOME_VIDEO = "/video/welcome-v1.mp4";
const FULLSCREEN_SHADER_PROPS = {
  minPixelRatio: 1,
  maxPixelCount: 720_000,
} as const;
const SECTION_SHADER_PROPS = {
  minPixelRatio: 1,
  maxPixelCount: 560_000,
} as const;
const HOME_ABOUT_ORDER = ["About", "Books", "Biotype"] as const;
const HOME_PATIENT_ORDER = ["Stories", "Blog", "Contact"] as const;
const HOME_SERVICE_LINK_ORDER = [
  "/aesthetic-treatments/",
  "/sexual-urinary-tract-health/",
  "/emsella-treatment-for-incontinence/",
  "/menopause-perimenopause/",
  "/vaginal-rejuvenation-expert/",
  "/body-contouring/",
  "/services/supplements/",
] as const;
const HOME_SERVICE_LINK_HREFS = new Set<string>(HOME_SERVICE_LINK_ORDER);

const toNavChild = (item: NavItem): NavChild => ({
  label: item.label,
  href: item.href,
});

const pickNavLinks = (order: readonly string[]) =>
  order
    .map((label) => NAV_ITEMS.find((item) => item.label === label))
    .filter((item): item is NavItem => Boolean(item))
    .map(toNavChild);

const HOME_PRACTICE_LINKS: NavChild[] = (() => {
  const servicesItem = NAV_ITEMS.find((item) => item.label === "Services");
  if (!servicesItem) return [];

  const children = servicesItem.children ?? [];
  const childrenByHref = new Map(children.map((child) => [child.href, child]));
  const orderedChildren = HOME_SERVICE_LINK_ORDER.flatMap((href) => {
    const match = childrenByHref.get(href);
    return match ? [match] : [];
  });
  const remainingChildren = children.filter(
    (child) => !HOME_SERVICE_LINK_HREFS.has(child.href),
  );

  return [
    { label: servicesItem.label, href: servicesItem.href },
    ...orderedChildren,
    ...remainingChildren,
  ];
})();
const HOME_ABOUT_LINKS = pickNavLinks(HOME_ABOUT_ORDER);
const HOME_PATIENT_LINKS = pickNavLinks(HOME_PATIENT_ORDER);

function isFinePointerDevice() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {
        // iOS Low Power Mode and some data-saver modes can still block autoplay.
      });
    };

    video.load();
    play();

    window.addEventListener("pageshow", play);
    window.addEventListener("focus", play);
    window.addEventListener("touchstart", play, { once: true, passive: true });
    window.addEventListener("pointerdown", play, { once: true, passive: true });

    return () => {
      window.removeEventListener("pageshow", play);
      window.removeEventListener("focus", play);
      window.removeEventListener("touchstart", play);
      window.removeEventListener("pointerdown", play);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="e-hero-video"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={HERO_VIDEO_POSTER}
      aria-hidden="true"
    >
      <source
        src={HERO_MOBILE_VIDEO}
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <source
        src={HERO_DESKTOP_VIDEO}
        type="video/mp4"
        media="(min-width: 768px)"
      />
    </video>
  );
}

function LazyFillImage({
  src,
  alt,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  objectPosition?: string;
}) {
  return (
    <img
      className="lazy-fill-image"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      style={{ objectPosition }}
    />
  );
}

/* ─── Trophy data ─────────────────────────────────────────── */
const TROPHIES = [
  {
    name: "Oprah",
    yr: "2002 — Now",
    logo: "/images/press/oprah.png",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "Today",
    yr: "Recurring",
    logo: "/images/press/today.svg",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "GMA",
    yr: "Recurring",
    logo: "/images/press/gma.png",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "The Doctors",
    yr: "Co-host",
    logo: "/images/press/the-doctors.webp",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "CNN",
    yr: "Expert",
    logo: "/images/press/cnn.png",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "NBC",
    yr: "Network",
    logo: "/images/press/nbc.png",
    arcY: 0,
    arcZ: 0,
  },
  {
    name: "Conan",
    yr: "Featured",
    logo: "/images/press/conan.webp",
    arcY: 0,
    arcZ: 0,
  },
];

/* ─── Individual trophy card ─────────────────────────────── */
/* Aceternity 3D Card primitive handles tilt/depth. CardItem translateZ
   values stratify the screen (forward), label, and year (receding). */
function TrophyCard({
  name,
  yr,
  logo,
  arcY,
  arcZ,
  idx,
}: {
  name: string;
  yr: string;
  logo: string;
  arcY: number;
  arcZ: number;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 + arcY }}
      whileInView={{ opacity: 1, y: arcY }}
      transition={{
        duration: 0.55,
        delay: idx * 0.08,
        ease: [0.2, 0.7, 0.2, 1],
      }}
      viewport={{ once: true, margin: "-60px" }}
      style={{ perspective: 1000, z: arcZ }}
    >
      <CardContainer
        containerClassName="e-trophy-shell w-full"
        className="e-trophy w-full"
      >
        <CardBody className="w-full h-full flex flex-col justify-between items-center">
          <CardItem translateZ={120} className="screen w-full flex-1">
            <img
              src={logo}
              alt={name}
              className="screen-logo"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </CardItem>
          <CardItem translateZ={40} className="trophy-foot w-full">
            <div className="name">{name}</div>
            <div className="yr">{yr}</div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </motion.div>
  );
}

/* ─── Full press section ─────────────────────────────────── */
function PressSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <div id="press" className="e-press" ref={sectionRef}>
      {/* Per-section shader removed — now using global MeshGradient through
          transparent section bg. */}

      {/* All press content sits above the global shader */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Lead / stats */}
        <div className="lead">
          <span className="lead-text">As seen on</span>
        </div>

        {/* 3D trophy row — per-card whileInView entrance handles motion */}
        <div className="e-trophy-row">
          {TROPHIES.map((t, i) => (
            <TrophyCard key={t.name} {...t} idx={i} />
          ))}
        </div>

        {/* Reel button — centered via flex on parent */}
        <div className="reel-wrap">
          <button
            type="button"
            className="reel"
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
            <span className="play">→</span> Ready to be heard?
          </button>
        </div>
      </div>
    </div>
  );
}

const labelInline: CSSProperties = {
  position: "relative",
  background: "var(--paper)",
  borderColor: "var(--accent-deep)",
  color: "var(--accent-deep)",
};

const flagshipPhotoInline: CSSProperties = {
  background: "linear-gradient(135deg,var(--accent-2),var(--accent))",
};

const footerLogoInline: CSSProperties = { color: "var(--paper)" };
const footerLogoDotInline: CSSProperties = { color: "var(--accent)" };
const footerAddrInline: CSSProperties = { marginTop: 12 };
const inlineLeadButtonStyle: CSSProperties = {
  all: "unset",
  color: "#f4a3aa",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: "rgba(244, 163, 170, 0.7)",
};
const footerLeadButtonInline: CSSProperties = {
  display: "block",
  margin: "0 0 8px",
  padding: 0,
  border: 0,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
  fontSize: 16,
  lineHeight: 1.7,
  opacity: 0.9,
  textAlign: "left",
};
type NewsletterSlot = "brief" | "footer";
type NewsletterStatus = "idle" | "submitting" | "success" | "error";

const newsletterInitialStatus: Record<NewsletterSlot, NewsletterStatus> = {
  brief: "idle",
  footer: "idle",
};
const newsletterInitialErrors: Record<NewsletterSlot, string> = {
  brief: "",
  footer: "",
};
const newsletterEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Book cover — hover 3D tilt + breathing wrapper ────── */
function BookCover({
  b1,
  children,
}: {
  b1: boolean;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const baseTransform = b1
    ? "rotateY(-12deg) rotate(-3deg)"
    : "rotateY(12deg) rotate(3deg)";

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cover = wrap.querySelector<HTMLElement>(".cover");
    if (!cover) return;
    const rect = wrap.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const t = b1
      ? `rotateY(${-12 + ry}deg) rotate(-3deg) rotateX(${-rx}deg) translateZ(12px) scale(1.03)`
      : `rotateY(${12 + ry}deg) rotate(3deg) rotateX(${-rx}deg) translateZ(12px) scale(1.03)`;
    cover.style.transition = "transform 0.12s linear";
    cover.style.transform = t;
  };

  const onPointerLeave = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cover = wrap.querySelector<HTMLElement>(".cover");
    if (!cover) return;
    cover.style.transition = "transform 0.6s cubic-bezier(0.2,0.8,0.2,1)";
    cover.style.transform = baseTransform;
  };

  return (
    <div
      ref={wrapRef}
      className="cover-wrap"
      style={{ transformStyle: "preserve-3d" }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}

const manifestoEase = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const manifestoViewport = { once: true, margin: "-80px" } as const;

/* ─── Manifesto copy — scroll-driven entrance ────────────── */
function ManifestoCopy() {
  const fadeUp = (delay: number, y = 24) => ({
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: manifestoViewport,
    transition: { duration: 0.6, delay, ease: manifestoEase },
  });

  return (
    <div className="copy">
      <motion.div className="eyebrow" {...fadeUp(0.06, 18)}>
        A note from your doctor
      </motion.div>
      <h2>
        <motion.span style={{ display: "inline-block" }} {...fadeUp(0.12)}>
          Hi, I&apos;m
        </motion.span>
        <br />
        <motion.em style={{ display: "inline-block" }} {...fadeUp(0.18)}>
          Dr. Jennifer.
        </motion.em>
      </h2>
      <div className="creed">
        <motion.div className="creed-line" {...fadeUp(0.26, 20)}>
          <span className="num">01</span>
          <span>
            This practice is for the woman who has done{" "}
            <em>everything she was told</em> — and still doesn&apos;t feel like
            herself.
          </span>
        </motion.div>
        <motion.div className="creed-line" {...fadeUp(0.34, 20)}>
          <span className="num">02</span>
          <span>
            I&apos;ve spent <em>25 years</em> writing the playbook for hormones,
            sexual health, and pelvic medicine — the one most clinics don&apos;t
            have.
          </span>
        </motion.div>
        <motion.div className="creed-line" {...fadeUp(0.42, 20)}>
          <span className="num">03</span>
          <span>
            You&apos;ll be heard. You&apos;ll be <em>believed</em>. And we will
            figure it out, together.
          </span>
        </motion.div>
      </div>
      <motion.a
        className="full"
        href="/about/"
        {...fadeUp(0.5, 16)}
        style={{ position: "relative" }}
      >
        Read my manifesto →
      </motion.a>
    </div>
  );
}

function HomeClient() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const manifestoRef = useRef<HTMLDivElement | null>(null);
  const quoteDarkRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef<HTMLDivElement | null>(null);
  const newsRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const booksRef = useRef<HTMLDivElement | null>(null);
  const booksInView = useInView(booksRef, { once: true, margin: "-80px" });
  const megaRef = useRef<HTMLDivElement | null>(null);

  // Patient-stories featured card: blur-to-focus on scroll
  const featuredRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: featuredProgress } = useScroll({
    target: featuredRef,
    offset: ["start 90%", "start 30%"],
  });
  const featuredBlur = useTransform(featuredProgress, [0, 1], [18, 0]);
  const featuredOpacity = useTransform(
    featuredProgress,
    [0, 0.5, 1],
    [0, 0.65, 1],
  );
  const featuredY = useTransform(featuredProgress, [0, 1], [40, 0]);
  const featuredFilter = useMotionTemplate`blur(${featuredBlur}px)`;

  const [menuOpen, setMenuOpen] = useState(false);
  const pillRef = useRef<HTMLAnchorElement | null>(null);

  const welcomeRef = useRef<HTMLVideoElement | null>(null);
  const [welcomePlaying, setWelcomePlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [welcomeRequested, setWelcomeRequested] = useState(false);
  const [briefEmail, setBriefEmail] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(
    newsletterInitialStatus,
  );
  const [newsletterErrors, setNewsletterErrors] = useState(
    newsletterInitialErrors,
  );

  const submitNewsletter = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, slot: NewsletterSlot) => {
      event.preventDefault();
      const email = (slot === "brief" ? briefEmail : footerEmail).trim();

      if (!newsletterEmailRe.test(email)) {
        setNewsletterStatus((current) => ({ ...current, [slot]: "error" }));
        setNewsletterErrors((current) => ({
          ...current,
          [slot]: "Enter a valid email.",
        }));
        return;
      }

      setNewsletterStatus((current) => ({ ...current, [slot]: "submitting" }));
      setNewsletterErrors((current) => ({ ...current, [slot]: "" }));

      try {
        const response = await fetch("/api/newsletter/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            source:
              slot === "footer"
                ? "footer_berman_brief"
                : "homepage_berman_brief",
          }),
        });
        const data = (await response.json().catch(() => null)) as {
          ok?: boolean;
          error?: string;
        } | null;

        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "Could not subscribe that email yet.");
        }

        if (slot === "brief") setBriefEmail("");
        if (slot === "footer") setFooterEmail("");
        setNewsletterStatus((current) => ({ ...current, [slot]: "success" }));
      } catch (err) {
        setNewsletterStatus((current) => ({ ...current, [slot]: "error" }));
        setNewsletterErrors((current) => ({
          ...current,
          [slot]:
            err instanceof Error
              ? err.message
              : "Could not subscribe that email yet.",
        }));
      }
    },
    [briefEmail, footerEmail],
  );

  const handleMenuToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((o) => !o);
  }, []);

  const playWelcome = useCallback(() => {
    if (!welcomeRequested) {
      setWelcomeRequested(true);
      return;
    }

    const v = welcomeRef.current;
    if (!v) return;
    v.play().catch(() => {
      // ignore autoplay/permission errors; controls remain available
    });
  }, [welcomeRequested]);

  useEffect(() => {
    if (!welcomeRequested) return;

    const v = welcomeRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {
      // The user can still start playback with native controls.
    });
  }, [welcomeRequested]);

  // hero pointer
  useEffect(() => {
    const sec = heroRef.current;
    if (!sec) return;
    if (!isFinePointerDevice()) return;
    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty(
        "--mx",
        `${((e.clientX - r.left) / r.width) * 100}%`,
      );
      sec.style.setProperty(
        "--my",
        `${((e.clientY - r.top) / r.height) * 100}%`,
      );
    };
    const onLeave = () => {
      sec.style.setProperty("--mx", "50%");
      sec.style.setProperty("--my", "40%");
    };
    sec.addEventListener("pointermove", onMove);
    sec.addEventListener("pointerleave", onLeave);
    return () => {
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // scroll parallax: writes --scroll-y (0–1) on .e-hero; video + mesh consume it via CSS
  useEffect(() => {
    const sec = heroRef.current;
    if (!sec) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const ratio = Math.min(Math.max(window.scrollY, 0), 600) / 600;
        sec.style.setProperty("--scroll-y", String(ratio));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // cursor-magnetic pill: writes --pill-mx/--pill-my on the pill element directly
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!isFinePointerDevice()) return;
    const RADIUS = 80;
    const MAX_SHIFT = 8;
    const onMove = (e: PointerEvent) => {
      const r = pill.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < RADIUS) {
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

  // cursor-light injection on dark sections (manifesto excluded — handled by GrainGradient shader)
  useEffect(() => {
    if (!isFinePointerDevice()) return;
    const sections: Array<HTMLDivElement | null> = [
      quoteDarkRef.current,
      readyRef.current,
      newsRef.current,
    ];
    const cleanups: Array<() => void> = [];
    sections.forEach((sec) => {
      if (!sec) return;
      if (getComputedStyle(sec).position === "static") {
        sec.style.position = "relative";
      }
      const light = document.createElement("div");
      light.className = "cursor-light";
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
      cleanups.push(() => {
        sec.removeEventListener("pointermove", onMove);
        sec.removeEventListener("pointerleave", onLeave);
        if (light.parentNode === sec) sec.removeChild(light);
      });
    });
    return () => {
      cleanups.forEach((fn) => fn());
    };
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

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <section className="wf" data-id="E">
      {/* Global ambient MeshGradient — fixed, behind every section. White-bg
          sections (Press/Practice/Books/Stories/News) are transparent and let
          this rose/cream wash show through; colored sections layer on top. */}
      <MeshGradient
        {...FULLSCREEN_SHADER_PROPS}
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

      {/* 1. HERO — soft blush, 2-line giant headline */}
      <div className="e-hero" ref={heroRef}>
        <HeroVideo />
        <div className="e-hero-video-tint"></div>
        <div className="mesh">
          <b></b>
          <b></b>
          <b></b>
          <b></b>
        </div>
        <div className="e-grain"></div>
        <div className="e-hero-nav">
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
        >
          <div className="col">
            <h6>The Practice</h6>
            {HOME_PRACTICE_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="col">
            <h6>About</h6>
            {HOME_ABOUT_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="col">
            <h6>Patients</h6>
            {HOME_PATIENT_LINKS.map((link) => (
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
        <div className="e-hero-body">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
          >
            <span className="dot" />
            Beverly Hills · Women&apos;s Wellness
          </motion.div>
          <h1>
            {["Women", "deserve"].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 24, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.2 + i * 0.12,
                }}
                style={{ display: "inline-block", marginRight: "0.22em" }}
              >
                {word}
              </motion.span>
            ))}
            <em>
              <motion.span
                initial={{ opacity: 0, y: 24, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.44 }}
                style={{ display: "inline-block" }}
              >
                better.
              </motion.span>
            </em>
          </h1>
          <motion.p
            className="e-hero-seo"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.54 }}
          >
            Beverly Hills women&apos;s wellness care for menopause, hormone
            therapy, sexual health, pelvic health, vaginal rejuvenation, and
            body contouring across greater Los Angeles.
          </motion.p>
          <div className="e-hero-foot">
            <span className="left">since 2007 · 1M+ women cared for</span>
            <span className="scroll">Scroll ↓</span>
            <span className="right">25 yrs · two NYT best-sellers</span>
          </div>
        </div>
      </div>

      {/* 2. AS SEEN ON — 3D trophy wall */}
      <PressSection />

      {/* 3. HI I&apos;M DR JEN + manifesto */}
      <motion.div
        className="e-manifesto"
        ref={manifestoRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={manifestoViewport}
        transition={{ duration: 0.45, ease: manifestoEase }}
      >
        {/* Paper Design GrainGradient — ambient plum/blush shader background, replaces v1 hand-rolled aurora orbs + cursor-light */}
        <GrainGradient
          {...FULLSCREEN_SHADER_PROPS}
          colors={["#a13a48", "#6a2230", "#1a0a10"]}
          colorBack="#1a0a10"
          shape="sphere"
          speed={1.6}
          scale={0.5}
          noise={0.5}
          softness={0.7}
          intensity={0.35}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        {/* Video card — scroll-driven entrance only; no cursor-tracked tilt/parallax. */}
        <motion.div
          className="manifesto-video-card relative z-10 w-full"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={manifestoViewport}
          transition={{ duration: 0.6, ease: manifestoEase }}
        >
          <div className={`video${welcomePlaying ? " is-playing" : ""}`}>
            <video
              ref={welcomeRef}
              src={welcomeRequested ? WELCOME_VIDEO : undefined}
              preload="none"
              playsInline
              controls={welcomeRequested || hasStarted}
              onPlay={() => {
                setHasStarted(true);
                setWelcomePlaying(true);
              }}
              onPause={() => setWelcomePlaying(false)}
              onEnded={() => {
                const v = welcomeRef.current;
                if (v) {
                  try {
                    v.currentTime = 0;
                  } catch {}
                  v.pause();
                }
                setWelcomePlaying(false);
                setHasStarted(false);
                setWelcomeRequested(false);
              }}
            />
            {!hasStarted && (
              <img
                className="video-poster"
                src="/images/dr-berman/headshot-portrait.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            )}
            {!hasStarted && (
              <button
                type="button"
                className="video-play"
                aria-label="Play welcome video"
                onClick={playWelcome}
              >
                <span className="video-play-icon" aria-hidden="true" />
                <span className="video-play-label">Watch welcome</span>
              </button>
            )}
          </div>
        </motion.div>
        {/* Headline + creed + CTA — individual whileInView entrances above shader (z-10). */}
        <div className="manifesto-copy-card relative z-10 w-full">
          <ManifestoCopy />
        </div>
      </motion.div>

      {/* 4. THE PRACTICE */}
      <div className="e-practice">
        {/* Per-section Dithering shader removed — global MeshGradient shows through. */}
        <div className="relative z-10 w-full">
          <div className="head w-full">
            <h3>
              The <em>Practice</em>.
            </h3>
            <div className="indicator">
              <div className="indicator-line">
                Care that <em>connects</em>, not silos.
              </div>
              <div className="indicator-tag">
                7 specialties · one Dr. Berman · one plan
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="e-3d-rail">
              {[
                {
                  className: "c1",
                  num: "N° 01",
                  title: (
                    <>
                      Aesthetic &amp; Regenerative <em>Medicine</em>
                    </>
                  ),
                  photoSrc: "/images/practice/senior-glow.webp",
                  desc: "Botox · filler · PRP/PRF · skin tightening",
                  arrow: "Open →",
                  href: "/aesthetic-treatments/",
                },
                {
                  className: "c2",
                  num: "N° 02",
                  title: (
                    <>
                      Sexual <em>Health</em> &amp; Intimacy
                    </>
                  ),
                  photoSrc: "/images/practice/couch-relax.webp",
                  desc: "Libido · arousal · pain · PRP/PRF",
                  arrow: "Open →",
                  href: "/sexual-urinary-tract-health/",
                },
                {
                  className: "c3",
                  num: "N° 03",
                  title: (
                    <>
                      Pelvic Floor &amp; Urinary <em>Health</em>
                    </>
                  ),
                  photoSrc: "/images/practice/mother-daughter-hug.webp",
                  desc: "Incontinence · urgency · prolapse · Emsella",
                  arrow: "Open →",
                  href: "/emsella-treatment-for-incontinence/",
                },
                {
                  className: "c4",
                  num: "N° 04 · FLAGSHIP",
                  title: (
                    <>
                      Menopause &amp; <em>Hormone Therapy</em>
                    </>
                  ),
                  photoSrc: "/images/practice/vineyard.webp",
                  desc: "BHRT · perimenopause workup · hormone panels",
                  arrow: "Open →",
                  href: "/menopause-perimenopause/",
                },
                {
                  className: "c5",
                  num: "N° 05",
                  title: (
                    <>
                      Vaginal <em>Rejuvenation</em>
                    </>
                  ),
                  photoSrc: "/images/practice/laughing-table.webp",
                  desc: "MonaLisa Touch · PRP/PRF · exosomes · peptides",
                  arrow: "Open →",
                  href: "/vaginal-rejuvenation-expert/",
                },
                {
                  className: "c6",
                  num: "N° 06",
                  title: (
                    <>
                      Body <em>Contouring</em> &amp; Weight Loss
                    </>
                  ),
                  photoSrc: "/images/practice/blonde-laughing.webp",
                  desc: "Emsculpt NEO · Forma · BeautiFill · weight loss",
                  arrow: "Open →",
                  href: "/body-contouring/",
                },
                {
                  className: "c7",
                  num: "N° 07",
                  title: (
                    <>
                      Berman <em>Supplements</em>
                    </>
                  ),
                  photoSrc: "/images/practice/supplements-cheer.webp",
                  photoPosition: "center top",
                  desc: "Hormone · libido · longevity · shop",
                  arrow: "Shop →",
                  href: "/services/supplements/",
                },
              ].map((card) => (
                <a
                  key={card.num}
                  className={`e-3d-card ${card.className}`}
                  href={card.href}
                >
                  <div className="num">{card.num}</div>
                  <h4>{card.title}</h4>
                  <div className="photo">
                    <LazyFillImage
                      src={card.photoSrc}
                      alt=""
                      objectPosition={card.photoPosition}
                    />
                  </div>
                  <div className="desc">{card.desc}</div>
                  <div className="arrow">{card.arrow}</div>
                </a>
              ))}
            </div>
            <div className="controls">
              <span>←</span> <b>04 / 07</b> <span>→</span>
            </div>
            <div className="cta-3d-wrap">
              <button
                className="cta-3d"
                data-lead-open
                data-cta="open-form"
                type="button"
              >
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
                <span className="relative z-10">
                  Ready to be heard? <span className="arr">→</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GIANT QUOTE 1 — 25 years */}
      <div className="e-quote blush">
        {/* Paper Design SmokeRing — ambient blush/rose shader background */}
        <SmokeRing
          {...SECTION_SHADER_PROPS}
          colors={["#f4a3aa", "#d97580", "#ffeae0", "#a13a48"]}
          colorBack="#fff5f1"
          scale={1}
          speed={0.6}
          thickness={0.4}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        {/* CardContainer/CardBody/CardItem — true 3D parallax tilt on mouse hover, sits above shader */}
        <CardContainer
          containerClassName="relative z-10 w-full py-0"
          className="w-full"
        >
          <CardBody className="w-full flex flex-col items-center">
            {/* Mark sits at highest Z — floats forward most */}
            <CardItem translateZ={120} className="mark-wrap">
              <motion.div
                className="mark"
                initial={{ opacity: 0, scale: 0.6, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-80px" }}
              >
                &ldquo;
              </motion.div>
            </CardItem>
            {/* Blockquote at mid Z */}
            <CardItem translateZ={60} className="blockquote-wrap w-full">
              <blockquote>
                {[
                  "I\u2019ve",
                  "spent",
                  "twenty-five",
                  "years",
                  "asking",
                  "the",
                  "questions",
                ].map((word, i) => (
                  <motion.span
                    key={i}
                    className="quote-word"
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.18 + i * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}
                {["no", "one", "was", "asking"].map((word, i) => (
                  <motion.span
                    key={"accent-" + i}
                    className="quote-word accent"
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.18 + (7 + i) * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}
                {[
                  "about",
                  "women\u2019s",
                  "bodies.",
                  "This",
                  "practice",
                  "is",
                  "what",
                  "I",
                  "learned",
                  "listening.",
                ].map((word, i) => (
                  <motion.span
                    key={"tail-" + i}
                    className="quote-word"
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.18 + (11 + i) * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}
              </blockquote>
            </CardItem>
            {/* Attribution recedes furthest — sits behind */}
            <CardItem translateZ={20} className="attr-wrap">
              <motion.div
                className="by quote-attr"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-80px" }}
              >
                — Dr. Jennifer Berman, MD
              </motion.div>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>

      {/* 6. ABOUT DR BERMAN — authority */}
      <div className="e-about">
        <div className="photo-stack">
          <div className="ph-main photo">
            <LazyFillImage
              src="/images/dr-berman/manifesto-portrait.webp"
              alt="Dr. Jennifer Berman"
              objectPosition="center top"
            />
          </div>
          <div className="signature">— Dr. Jennifer Berman, MD</div>
        </div>
        <div className="copy">
          <div className="eyebrow">Meet your doctor</div>
          <h3>
            Dr. Jennifer <em>Berman</em>, MD
          </h3>
          <p>
            Internationally recognized urologist, pioneer of female sexual
            medicine, and twice-published <em>New York Times</em> best-selling
            author. Co-founder of UCLA&apos;s Female Sexual Medicine Center,
            founder &amp; director of The Berman Women&apos;s Wellness Center in
            Beverly Hills.
          </p>
          <p>
            For two and a half decades she has done one thing better than almost
            anyone: making women&apos;s bodies <em>make sense</em> — in clinic,
            on television, and on the page.
          </p>

          <div className="stats-row">
            <div>
              <strong>25+</strong>
              <span>Years in practice</span>
            </div>
            <div>
              <strong>2×</strong>
              <span>NYT bestseller</span>
            </div>
            <div>
              <strong>7</strong>
              <span>Specialties · one doctor</span>
            </div>
          </div>

          <div className="creds">
            <div>
              <h6>Training</h6>
              <ul>
                <li>MD · Boston University</li>
                <li>Residency · U. Maryland</li>
                <li>Fellowship · UCLA</li>
              </ul>
            </div>
            <div>
              <h6>Research &amp; Roles</h6>
              <ul>
                <li>Co-founder · UCLA Female Sexual Medicine</li>
                <li>Director · Berman Wellness Center</li>
                <li>Pfizer Scholar in Urology (×2)</li>
              </ul>
            </div>
            <div>
              <h6>Author · Media</h6>
              <ul>
                <li>
                  <em>For Women Only</em> · NYT bestseller
                </li>
                <li>
                  <em>Secrets of the Sexually Satisfied Woman</em>
                </li>
                <li>Oprah · GMA · Today · CNN</li>
              </ul>
            </div>
          </div>

          <div className="ctas">
            <GlowCtaButton href="/contact/" lead variant="primary" size="lg">
              Ready to be heard
            </GlowCtaButton>
            <GlowCtaButton href="/about/" variant="secondary" size="lg">
              Read full bio
            </GlowCtaButton>
            <GlowCtaButton href="#press" variant="ghost" size="lg">
              Press & media kit
            </GlowCtaButton>
          </div>
        </div>
      </div>

      {/* 6.5 BOOKS — authority shelf */}
      <div
        className="e-books"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Per-section MeshGradient removed — global MeshGradient shows through. */}
        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Heading stagger reveal */}
          <div className="head">
            <motion.div
              className="eyebrow"
              initial={{ opacity: 0, y: 16 }}
              animate={
                booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
              }
              transition={{ duration: 0.6, delay: 0, ease: [0.2, 0.7, 0.2, 1] }}
            >
              Two-time New York Times bestselling author
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 24 }}
              animate={
                booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
              }
              transition={{
                duration: 0.75,
                delay: 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Books that <em>changed</em> the conversation.
            </motion.h3>
          </div>

          {/* Books shelf — ref triggers inView */}
          <div
            className="shelf"
            ref={booksRef}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Book 1 */}
            <motion.div
              className="book b1"
              initial={{ opacity: 0, y: 48, rotateX: 8 }}
              animate={
                booksInView
                  ? { opacity: 1, y: 0, rotateX: 0 }
                  : { opacity: 0, y: 48, rotateX: 8 }
              }
              transition={{
                duration: 0.75,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="book-grid">
                <div className="cover-wrap">
                  <div
                    className="cover"
                    role="img"
                    aria-label="Cover of For Women Only by Jennifer & Laura Berman"
                  >
                    <LazyFillImage
                      src="/images/books/for-women-only.jpg"
                      alt=""
                    />
                  </div>
                </div>
                <div className="meta">
                  <motion.h5
                    initial={{ opacity: 0, y: 12 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.38,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    For Women <em>Only</em>
                  </motion.h5>
                  <motion.div
                    className="stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.46,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    2001 · 18 languages · NYT · GMA Book Pick
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.54,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    The book that named the women&apos;s sexual-health crisis —
                    and started the modern conversation about it. Still the
                    most-cited reference clinicians hand to patients.
                  </motion.p>
                  <motion.a
                    className="link"
                    href="/books/"
                    initial={{ opacity: 0, y: 8 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
                    }
                    transition={{
                      duration: 0.45,
                      delay: 0.62,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    Read excerpt →
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Book 2 */}
            <motion.div
              className="book b2"
              initial={{ opacity: 0, y: 48, rotateX: 8 }}
              animate={
                booksInView
                  ? { opacity: 1, y: 0, rotateX: 0 }
                  : { opacity: 0, y: 48, rotateX: 8 }
              }
              transition={{
                duration: 0.75,
                delay: 0.33,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="book-grid">
                <div className="cover-wrap">
                  <div
                    className="cover"
                    role="img"
                    aria-label="Cover of Secrets of the Sexually Satisfied Woman by Jennifer & Laura Berman"
                  >
                    <LazyFillImage
                      src="/images/books/secrets-of-the-sexually-satisfied-woman.webp"
                      alt=""
                    />
                  </div>
                </div>
                <div className="meta">
                  <motion.h5
                    initial={{ opacity: 0, y: 12 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.53,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    Secrets of the <em>Sexually Satisfied</em> Woman
                  </motion.h5>
                  <motion.div
                    className="stat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.61,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    2005 · Oprah Book Club · Today Show feature
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: 0.69,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    A clinician&apos;s playbook for desire, arousal, and
                    connection — written for the women their doctors
                    weren&apos;t trained to help.
                  </motion.p>
                  <motion.a
                    className="link"
                    href="/books/"
                    initial={{ opacity: 0, y: 8 }}
                    animate={
                      booksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
                    }
                    transition={{
                      duration: 0.45,
                      delay: 0.77,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    Read excerpt →
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 7.5 PATIENT STORIES — one feature */}
      <div className="e-stories" style={{ position: "relative", zIndex: 10 }}>
        {/* Per-section MeshGradient removed — global MeshGradient shows through. */}
        <motion.div
          ref={featuredRef}
          className="featured"
          style={{
            opacity: featuredOpacity,
            y: featuredY,
            filter: featuredFilter,
            willChange: "filter, opacity, transform",
          }}
        >
          <div className="portrait">
            <LazyFillImage
              src="/images/stories/sarah-portrait.webp"
              alt="Sarah, 47 — patient portrait"
              objectPosition="center top"
            />
          </div>
          <div className="story">
            <div className="eyebrow">Patient stories</div>
            <div className="mark">&ldquo;</div>
            <blockquote>
              I had been told for <em>five years</em> that everything was in my
              head. Dr. Berman ran <em>one</em> panel and changed my life in
              eight weeks.
            </blockquote>
            <div className="who">
              <div className="name">Sarah, 47</div>
              <div className="loc">
                Encino · treated for hormonal imbalance &amp; sleep deprivation
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="more"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.55,
            delay: 0.15,
            ease: [0.2, 0.7, 0.2, 1],
          }}
        >
          <div className="more-head">
            <h6>More stories · in their own words</h6>
            <a href="/stories/">Read all stories →</a>
          </div>
          <div className="more-row">
            <motion.div
              className="more-thumb"
              initial={{ opacity: 0, y: 60, scale: 0.85, rotate: -4 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
                mass: 0.9,
                delay: 0.15,
              }}
            >
              <div className="ph">
                <LazyFillImage
                  src="/images/stories/margot-portrait.webp"
                  alt="Margot, 52 — patient portrait"
                  objectPosition="center top"
                />
              </div>
              <div className="cap">
                <b>Margot, 52</b>
                <br />
                perimenopause &amp; brain fog
              </div>
            </motion.div>
            <motion.div
              className="more-thumb"
              initial={{ opacity: 0, y: 60, scale: 0.85, rotate: 3 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
                mass: 0.9,
                delay: 0.3,
              }}
            >
              <div className="ph">
                <LazyFillImage
                  src="/images/stories/aisha-portrait.webp"
                  alt="Aisha, 39 — patient portrait"
                  objectPosition="center top"
                />
              </div>
              <div className="cap">
                <b>Aisha, 39</b>
                <br />
                chronic pelvic pain
              </div>
            </motion.div>
            <motion.div
              className="more-thumb"
              initial={{ opacity: 0, y: 60, scale: 0.85, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
                mass: 0.9,
                delay: 0.45,
              }}
            >
              <div className="ph">
                <LazyFillImage
                  src="/images/stories/linda-portrait.webp"
                  alt="Linda, 61 — patient portrait"
                  objectPosition="center top"
                />
              </div>
              <div className="cap">
                <b>Linda, 61</b>
                <br />
                sexual health post-cancer
              </div>
            </motion.div>
            <motion.div
              className="more-thumb"
              initial={{ opacity: 0, y: 60, scale: 0.85, rotate: 4 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
                mass: 0.9,
                delay: 0.6,
              }}
            >
              <div className="ph">
                <LazyFillImage
                  src="/images/stories/kim-portrait.webp"
                  alt="Kim, 44 — patient portrait"
                  objectPosition="center top"
                />
              </div>
              <div className="cap">
                <b>Kim, 44</b>
                <br />
                libido &amp; mood
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 7. GIANT QUOTE 2 — different doctor */}
      <div
        className="e-quote dark"
        ref={quoteDarkRef}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Paper Design NeuroNoise — ALL light tones; subtle warm texture only, no dark patches */}
        <NeuroNoise
          {...SECTION_SHADER_PROPS}
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
        <div style={{ position: "relative", zIndex: 10 }}>
          <div className="mark">&ldquo;</div>
          <blockquote>
            If your doctor doesn&apos;t have{" "}
            <span className="accent">an answer</span>, that doesn&apos;t mean
            there isn&apos;t one. It means you need a{" "}
            <span className="accent">different doctor</span>.
          </blockquote>
          <div className="by">— Dr. Berman, on The Oprah Show</div>
        </div>
      </div>

      {/* 7.6 NEWSLETTER — The Berman Brief */}
      <div
        className="e-news"
        ref={newsRef}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Per-section Warp shader removed — global MeshGradient shows through. */}
        <div
          className="e-grain"
          style={{ position: "relative", zIndex: 1 }}
        ></div>
        <div className="news-wrap" style={{ position: "relative", zIndex: 2 }}>
          <GrainGradient
            {...SECTION_SHADER_PROPS}
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
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="eyebrow">A weekly letter from Dr. Berman</div>
            <h3>
              The Berman <em>Brief.</em>
            </h3>
            <p className="lede">
              Every Sunday, the questions my patients ask me behind the door —
              answered in <em>plain</em> language. Hormones, libido, pelvic
              health, the things other doctors brush past. Twenty-five years of
              listening to women, distilled into a five-minute read you can act
              on by Monday.
            </p>
            <form
              className="form"
              onSubmit={(event) => submitNewsletter(event, "brief")}
            >
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="where should I send it?"
                aria-label="Email address"
                value={briefEmail}
                onChange={(event) => {
                  setBriefEmail(event.target.value);
                  if (newsletterStatus.brief !== "idle") {
                    setNewsletterStatus((current) => ({
                      ...current,
                      brief: "idle",
                    }));
                    setNewsletterErrors((current) => ({ ...current, brief: "" }));
                  }
                }}
              />
              <button
                type="submit"
                disabled={newsletterStatus.brief === "submitting"}
              >
                <BorderBeam
                  size={80}
                  duration={8}
                  colorFrom="#f4a3aa"
                  colorTo="#d97580"
                  borderWidth={1.5}
                />
                <span className="play">→</span>
                <span className="relative z-10">
                  {newsletterStatus.brief === "submitting"
                    ? "Sending..."
                    : "Send me the Brief"}
                </span>
              </button>
            </form>
            {newsletterStatus.brief === "success" ? (
              <div className="newsletter-status" role="status">
                You&apos;re on the list.
              </div>
            ) : newsletterErrors.brief ? (
              <div className="newsletter-status is-error" role="alert">
                {newsletterErrors.brief}
              </div>
            ) : null}
            <div className="bonus">
              <span className="star">✦</span> Subscribe and get{" "}
              <b>The Hormone Panel Decoder</b> with your first issue — the labs
              to ask for, and what the numbers actually mean.
            </div>
            <div className="priv">
              22,000+ readers · One click to unsubscribe, always.
            </div>
          </motion.div>
          <motion.div
            className="right"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.65,
              delay: 0.15,
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            <img
              className="phone-brief"
              src="/images/news/phone-brief.webp"
              alt="The Berman Brief on an iPhone — preview of a recent issue"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </motion.div>
        </div>
      </div>

      {/* 8. READY TO BE HEARD? */}
      <div
        className="e-ready"
        ref={readyRef}
        id="ready"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <Warp
          {...FULLSCREEN_SHADER_PROPS}
          {...{ colorBack: "#1a0a10" }}
          colors={["#4a1c26", "#8a3a44", "#5a2030", "#2a1018"]}
          speed={0.3}
          scale={1}
          rotation={0}
          distortion={0.24}
          swirl={0.82}
          swirlIterations={8}
          shape="checks"
          shapeScale={0.18}
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
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          >
            Ready to be <em>heard?</em>
          </motion.h3>
          <div className="choices">
            <motion.div
              className="e-choice left"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.2, 0.7, 0.2, 1],
              }}
            >
              <div className="tag">N° 01 · Beverly Hills</div>
              <h4>
                In&#8209;person <em>consultation</em>
              </h4>
              <div className="photo">
                <LazyFillImage
                  src="/images/ready/in-person.webp"
                  alt="Dr. Berman in the Beverly Hills clinic"
                  objectPosition="center 25%"
                />
              </div>
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
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: 0.25,
                ease: [0.2, 0.7, 0.2, 1],
              }}
            >
              <div className="tag">N° 02 · Anywhere</div>
              <h4>
                Telehealth <em>visit</em>
              </h4>
              <div className="photo">
                <LazyFillImage
                  src="/images/ready/telehealth.webp"
                  alt="Dr. Berman ready for a telehealth visit"
                />
              </div>
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
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
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

      {/* FOOTER (reuse A&apos;s) */}
      <div className="a-footer">
        <div className="col">
          <div className="logo-mark" style={footerLogoInline}>
            Berman Sexual Health<span style={footerLogoDotInline}>.</span>
          </div>
          <p style={footerAddrInline}>
            The Berman Women&apos;s Wellness Center
            <br />
            Beverly Hills, CA
          </p>
          <form
            className="news"
            onSubmit={(event) => submitNewsletter(event, "footer")}
          >
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email"
              aria-label="Footer email address"
              value={footerEmail}
              onChange={(event) => {
                setFooterEmail(event.target.value);
                if (newsletterStatus.footer !== "idle") {
                  setNewsletterStatus((current) => ({
                    ...current,
                    footer: "idle",
                  }));
                  setNewsletterErrors((current) => ({ ...current, footer: "" }));
                }
              }}
            />
            <button
              type="submit"
              disabled={newsletterStatus.footer === "submitting"}
            >
              <BorderBeam
                size={80}
                duration={8}
                colorFrom="#f4a3aa"
                colorTo="#d97580"
                borderWidth={1.5}
              />
              <span className="relative z-10">
                {newsletterStatus.footer === "submitting" ? "Sending..." : "Sign up"}
              </span>
            </button>
          </form>
          {newsletterStatus.footer === "success" ? (
            <div className="newsletter-status" role="status">
              You&apos;re on the list.
            </div>
          ) : newsletterErrors.footer ? (
            <div className="newsletter-status is-error" role="alert">
              {newsletterErrors.footer}
            </div>
          ) : null}
        </div>
        <div className="col">
          <h6>Practice</h6>
          {FOOTER_SERVICES.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="col">
          <h6>About</h6>
          {FOOTER_QUICK_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="col">
          <h6>Visit</h6>
          <button
            type="button"
            data-lead-open
            data-cta="open-form"
            style={footerLeadButtonInline}
          >
            Book in-person
          </button>
          <button
            type="button"
            data-lead-open
            data-cta="open-form"
            style={footerLeadButtonInline}
          >
            Book telehealth
          </button>
          <button
            type="button"
            data-lead-open
            data-cta="open-form"
            style={footerLeadButtonInline}
          >
            Concierge
          </button>
          <button
            type="button"
            data-lead-open
            data-cta="open-form"
            style={footerLeadButtonInline}
          >
            Contact
          </button>
        </div>
      </div>
    </section>
  );
}

export default HomeClient;
