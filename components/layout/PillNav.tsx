"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";

import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface PillNavItem {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
  }[];
}

export interface PillNavProps {
  items?: PillNavItem[];
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

const defaultItems: PillNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  {
    label: "Services",
    href: "/hormone-therapy/",
    children: [
      { label: "Hormone Therapy", href: "/hormone-therapy/" },
      { label: "Menopause Care", href: "/menopause-perimenopause/" },
      {
        label: "Sexual & Urinary Health",
        href: "/sexual-urinary-tract-health/",
      },
    ],
  },
  { label: "Blog", href: "/womens-health-blog/" },
  { label: "Contact", href: "/contact/" },
];

function isLeadCta(cta: { label: string; href: string }) {
  const href = cta.href.trim();
  return (
    href === "/contact" ||
    href === "/contact/" ||
    href === "#lead" ||
    href === "#ready" ||
    /book|consult|schedule|ready/i.test(cta.label)
  );
}

/**
 * Sticky frosted-glass navigation with centered desktop links and a mobile sheet.
 * Includes the Berman wordmark and consultation CTA.
 */
export function PillNav({
  items = defaultItems,
  cta = { label: "Book Consultation", href: "/contact/" },
  className,
}: PillNavProps) {
  const [hidden, setHidden] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const paddingY = useTransform(scrollY, [0, 80], [12, 9.5]);
  const paddingX = useTransform(scrollY, [0, 80], [16, 13]);
  const ctaOpensLead = isLeadCta(cta);
  const ctaHref = ctaOpensLead ? "/contact/" : cta.href;
  const ctaLeadProps = ctaOpensLead
    ? ({
        "data-lead-open": true,
        "data-cta": "open-form",
      } as const)
    : {};

  useMotionValueEvent(scrollVelocity, "change", (latestVelocity) => {
    if (prefersReducedMotion) {
      setHidden(false);
      return;
    }

    if (hideTimeoutRef.current !== null) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      const latestScrollY = scrollY.get();
      if (latestScrollY <= 80) {
        setHidden(false);
        return;
      }

      setHidden(latestVelocity > 120);
    }, 80);
  });

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.header
      className={cn("sticky top-4 z-50 px-container", className)}
      animate={prefersReducedMotion ? { y: 0 } : { y: hidden ? -100 : 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 30, mass: 1 }
      }
      aria-label="Primary navigation"
    >
      <motion.div
        className="mx-auto flex max-w-content-max items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-card backdrop-blur-md lg:px-6"
        style={
          prefersReducedMotion
            ? undefined
            : {
                paddingTop: paddingY,
                paddingBottom: paddingY,
                paddingLeft: paddingX,
                paddingRight: paddingX,
              }
        }
      >
        <a
          href="/"
          className="font-cormorant text-3xl font-medium italic leading-none text-ink"
          aria-label="Berman home"
        >
          Berman
        </a>

        <NavigationMenu className="hidden justify-center lg:flex">
          <NavigationMenuList className="gap-1">
            {items.map((item) => (
              <NavigationMenuItem key={item.href}>
                {item.children?.length ? (
                  <>
                    <NavigationMenuTrigger className="rounded-full bg-transparent px-4 font-inter text-sm text-text-secondary hover:bg-rose-50 hover:text-rose-700">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-56 rounded-lg border border-line bg-white p-2 shadow-card">
                      <div className="grid gap-1">
                        <a
                          href={item.href}
                          className="rounded-md px-3 py-2 font-dm-mono text-[0.66rem] uppercase tracking-[0.18em] text-text-tertiary hover:bg-rose-50 hover:text-rose-700"
                        >
                          All {item.label}
                        </a>
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            className="rounded-md px-3 py-2 font-inter text-sm text-text-primary hover:bg-rose-50 hover:text-rose-700"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-full px-4 font-inter text-sm text-text-secondary transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    {item.label}
                  </a>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button
            render={<a href={ctaHref} {...ctaLeadProps} />}
            className="relative hidden overflow-hidden rounded-full border border-[#4a1c26] bg-[linear-gradient(180deg,#5a2030_0%,#4a1c26_60%,#3a141d_100%)] px-5 font-dm-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#fff5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_32px_-10px_rgba(74,28,38,0.5)] backdrop-blur-[10px] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#632638_0%,#4a1c26_58%,#321019_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_36px_-10px_rgba(74,28,38,0.62),0_0_0_4px_rgba(217,155,161,0.18)] focus-visible:ring-[rgba(217,155,161,0.4)] md:inline-flex"
          >
            <BorderBeam
              size={80}
              duration={8}
              colorFrom="#f4a3aa"
              colorTo="#d97580"
              borderWidth={1.5}
            />
            <span className="relative z-10">{cta.label}</span>
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full border border-line bg-white/70 lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent className="w-[88vw] border-line bg-white p-0">
              <SheetHeader className="border-b border-line p-6">
                <SheetTitle className="font-cormorant text-3xl font-medium italic text-ink">
                  Berman
                </SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 p-6"
                aria-label="Mobile navigation"
              >
                {items.map((item) => (
                  <div key={item.href} className="border-b border-line/70 pb-3">
                    <SheetClose render={<a href={item.href} />}>
                      <span className="block py-2 font-cormorant text-3xl font-medium text-ink">
                        {item.label}
                      </span>
                    </SheetClose>
                    {item.children?.length ? (
                      <div className="grid gap-1 pb-2 pl-4">
                        {item.children.map((child) => (
                          <SheetClose
                            key={child.href}
                            render={<a href={child.href} />}
                          >
                            <span className="block py-1 font-inter text-sm text-text-secondary">
                              {child.label}
                            </span>
                          </SheetClose>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <SheetClose render={<a href={ctaHref} {...ctaLeadProps} />}>
                  <span className="relative mt-4 inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-[#4a1c26] bg-[linear-gradient(180deg,#5a2030_0%,#4a1c26_60%,#3a141d_100%)] px-6 font-dm-mono text-xs uppercase tracking-[0.18em] text-[#fff5f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_32px_-10px_rgba(74,28,38,0.5)] backdrop-blur-[10px]">
                    <BorderBeam
                      size={80}
                      duration={8}
                      colorFrom="#f4a3aa"
                      colorTo="#d97580"
                      borderWidth={1.5}
                    />
                    <span className="relative z-10">{cta.label}</span>
                  </span>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </motion.header>
  );
}

export default PillNav;
