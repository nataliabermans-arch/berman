"use client";

import { usePathname } from "next/navigation";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const PHONE_NUMBER = "+13107720072";
const DISPLAY_PHONE = "(310) 772-0072";

type LeadCaptureModalProps = {
  displayPhone: string;
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
};

type LeadCaptureModalComponent = ComponentType<LeadCaptureModalProps>;

export function openLeadCapture() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("lead-capture:open"));
}

export function useLeadCapture() {
  return { openLeadCapture };
}

function isContactHref(href: string) {
  if (!href) return false;
  const clean = href.trim();
  if (clean === "#lead" || clean === "#ready") return true;

  try {
    const url = new URL(clean, window.location.origin);
    return url.pathname === "/contact" || url.pathname === "/contact/";
  } catch {
    return clean === "/contact" || clean === "/contact/";
  }
}

export default function LeadCaptureProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [LeadCaptureModal, setLeadCaptureModal] =
    useState<LeadCaptureModalComponent | null>(null);
  const modalLoadRef = useRef<Promise<void> | null>(null);

  const shouldShowMobileBanner =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/checkout") &&
    pathname !== "/privacy-policy/" &&
    pathname !== "/privacy/" &&
    pathname !== "/terms-of-use/" &&
    pathname !== "/terms/";

  const loadModal = useCallback(() => {
    if (!modalLoadRef.current) {
      modalLoadRef.current = import("./LeadCaptureModal").then((module) => {
        setLeadCaptureModal(() => module.default);
      });
    }
    return modalLoadRef.current;
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    void loadModal();
  }, [loadModal]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleOpen = () => open();
    window.addEventListener("lead-capture:open", handleOpen);
    return () => window.removeEventListener("lead-capture:open", handleOpen);
  }, [open]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const explicitTrigger = target.closest(
        "[data-lead-open], [data-cta='open-form']",
      );
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href") || "";

      if (!explicitTrigger && !isContactHref(href)) return;

      event.preventDefault();
      event.stopPropagation();
      open();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [open]);

  return (
    <>
      {children}
      {shouldShowMobileBanner ? (
        <div className="lead-mobile-banner" aria-label="Ready to be heard">
          <button type="button" data-lead-open>
            <span>Ready to be heard?</span>
          </button>
          <a href={`tel:${PHONE_NUMBER}`} aria-label={`Call ${DISPLAY_PHONE}`}>
            <span className="lead-phone-icon" aria-hidden="true" />
            <span>Call</span>
          </a>
        </div>
      ) : null}
      {LeadCaptureModal ? (
        <LeadCaptureModal
          displayPhone={DISPLAY_PHONE}
          isOpen={isOpen}
          onClose={close}
          phoneNumber={PHONE_NUMBER}
        />
      ) : null}
    </>
  );
}
