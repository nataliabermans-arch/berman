"use client";

import { useEffect, useRef, useState } from "react";

// reCAPTCHA v2 checkbox, rendered explicitly.
//
// Explicit rendering (rather than the auto-rendered `g-recaptcha` class) is
// required here because the modal is lazy-loaded and mounts after the script
// would have scanned the DOM.

type Grecaptcha = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light" | "dark";
    },
  ) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha & { ready?: (cb: () => void) => void };
    __bermanRecaptchaOnload?: () => void;
  }
}

const SCRIPT_ID = "berman-recaptcha";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    // A blocked or throttled request can leave onload/onerror both silent, so
    // without a deadline the patient stares at nothing forever.
    const deadline = window.setTimeout(() => {
      scriptPromise = null; // allow a later retry
      reject(new Error("recaptcha script timed out"));
    }, 12_000);

    window.__bermanRecaptchaOnload = () => {
      window.clearTimeout(deadline);
      resolve();
    };
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src =
      "https://www.google.com/recaptcha/api.js?render=explicit&onload=__bermanRecaptchaOnload";
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      window.clearTimeout(deadline);
      scriptPromise = null;
      reject(new Error("recaptcha script failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// Mirrors the server's rule in lib/booking/human.ts: verification is skipped on
// Vercel preview deployments, which are already behind Vercel's own login.
// Both checks are "disabled only when explicitly preview", so an unset value
// leaves the CAPTCHA ON — this can never silently weaken production.
function isPreviewDeployment(): boolean {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") return true;
  // Fallback for when Vercel's system variables are not exposed to the client.
  // The production site is bermansexualhealth.com, so it never matches.
  if (typeof window !== "undefined") {
    return window.location.hostname.endsWith(".vercel.app");
  }
  return false;
}

export type RecaptchaProps = {
  /** Called with our own signed pass once the token is verified server-side. */
  onPass: (pass: string) => void;
  /** Fired when verification is deliberately not required in this environment. */
  onSkipped?: () => void;
  onError?: (message: string) => void;
};

export default function Recaptcha({ onPass, onSkipped, onError }: RecaptchaProps) {
  const holder = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "verifying" | "passed" | "error"
  >("loading");
  const [skipped, setSkipped] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  useEffect(() => {
    // Not configured (local dev without keys), or a preview deployment where
    // verification is deliberately skipped: don't block the flow.
    if (!siteKey || isPreviewDeployment()) {
      setStatus("passed");
      setSkipped(true);
      onSkipped?.();
      onPass("");
      return;
    }

    let cancelled = false;

    const exchange = async (token: string) => {
      setStatus("verifying");
      try {
        const res = await fetch("/api/booking/verify-human/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          pass?: string;
          error?: string;
        } | null;
        if (cancelled) return;
        if (!res.ok || !data?.ok || !data.pass) {
          throw new Error(data?.error || "Verification failed.");
        }
        setStatus("passed");
        onPass(data.pass);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        onError?.(
          err instanceof Error ? err.message : "Verification failed.",
        );
        if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
      }
    };

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || widgetId.current !== null) return;
        widgetId.current = window.grecaptcha!.render(holder.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => void exchange(token),
          "expired-callback": () => {
            // Google's token lapses after ~2 minutes. Our server pass lasts 30,
            // and is what actually authorises the booking — so do NOT clear it
            // here, or a patient who lingers loses a perfectly valid pass and
            // is blocked from continuing.
            setStatus("ready");
          },
          "error-callback": () => {
            setStatus("error");
            onError?.("Verification could not load.");
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        onError?.("Verification could not load.");
      });

    return () => {
      cancelled = true;
    };
    // Intentionally mount-only: re-rendering the widget would reset the user's
    // solved challenge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  // Hidden only when verification isn't required here. A solved challenge
  // stays visible, so the patient can see it succeeded.
  if (!siteKey || skipped) return null;

  return (
    <div className="booking-captcha">
      <div ref={holder} />
      {status === "verifying" ? (
        <p className="booking-captcha-status">Checking&hellip;</p>
      ) : null}
      {status === "error" ? (
        <p className="booking-captcha-status">
          We couldn&apos;t verify you in this browser. Try the checkbox again, or
          call <a href="tel:+13107720072">(310) 772-0072</a> and we&apos;ll book
          it for you.
        </p>
      ) : null}
    </div>
  );
}
