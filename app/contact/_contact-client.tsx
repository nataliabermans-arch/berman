"use client";

import { useState } from "react";
import { motion } from "motion/react";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  FORM_ACKNOWLEDGMENT_TEXT,
  REQUESTED_TIME_WINDOWS,
} from "@/lib/leads/a2p";
import PageTail from "../services/_page-tail";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const WINE = "#4a1c26";
const DEEP = "#8a3a44";
const ROSE = "#d99ba1";
const ROSE_FOCUS = "#d97580";
const LIGHT_ROSE = "#f4a3aa";
const CREAM = "#fff5f1";
const ERROR_ROSE = "#a83a3a";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REASONS: Array<{ value: string; label: string }> = [
  { value: "menopause-hormones", label: "Menopause & Hormones" },
  { value: "sexual-health", label: "Sexual Health" },
  { value: "pelvic-urinary", label: "Pelvic & Urinary" },
  { value: "vaginal-rejuvenation", label: "Vaginal Rejuvenation" },
  { value: "aesthetic-regenerative", label: "Aesthetic & Regenerative" },
  { value: "body-contouring", label: "Body Contouring" },
  { value: "berman-supplements", label: "Berman Supplements" },
  { value: "not-sure", label: "Not sure yet" },
];

const CONTACT_METHODS: Array<{ value: ContactMethod; label: string }> = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "either", label: "Either" },
];

const VISIT_TYPES: Array<{ value: VisitType; label: string }> = [
  { value: "in-person", label: "In-person · Beverly Hills" },
  { value: "telehealth", label: "Virtual consult" },
  { value: "either", label: "Either" },
];

type ContactMethod = "phone" | "email" | "either";
type VisitType = "in-person" | "telehealth" | "either";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod;
  reasons: string[];
  visitType: VisitType;
  preferredWindow: string;
  requestedDate: string;
  requestedTimeWindow: string;
  message: string;
  formAcknowledgment: boolean;
  smsConsent: boolean;
};

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  reasons?: string;
  message?: string;
  consent?: string;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredContact: "either",
  reasons: [],
  visitType: "either",
  preferredWindow: "",
  requestedDate: "",
  requestedTimeWindow: "first-available",
  message: "",
  formAcknowledgment: false,
  smsConsent: false,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  fontSize: 10,
  color: WINE,
  marginBottom: 8,
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: `1px solid ${ROSE}`,
  background: "rgba(255,245,241,0.85)",
  color: WINE,
  fontFamily: MONO,
  fontSize: 14,
  letterSpacing: "0.02em",
  outline: "none",
  transition:
    "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
};

const errorTextStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: SERIF,
  fontStyle: "italic",
  fontSize: 14,
  color: ERROR_ROSE,
};

const glassPanel: React.CSSProperties = {
  background: "rgba(255,250,248,0.92)",
  border: "1px solid rgba(138,58,68,0.18)",
  borderRadius: 18,
  boxShadow: "0 22px 70px rgba(74,28,38,0.12)",
  padding: "clamp(28px, 3vw, 40px)",
  color: WINE,
};

const hiddenChipInputStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  opacity: 0,
  cursor: "pointer",
  zIndex: 2,
};

function isInteractiveLabelTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("a, button, input, select, textarea"));
}

function countDigits(s: string): number {
  let n = 0;
  for (const c of s) if (c >= "0" && c <= "9") n++;
  return n;
}

function validate(form: FormState): FieldErrors {
  const errs: FieldErrors = {};
  if (!form.firstName.trim()) errs.firstName = "First name is required.";
  if (!form.lastName.trim()) errs.lastName = "Last name is required.";
  if (!form.email.trim()) errs.email = "Email is required.";
  else if (!EMAIL_RE.test(form.email.trim()))
    errs.email = "Enter a valid email.";
  if (!form.phone.trim()) errs.phone = "Phone is required.";
  else if (countDigits(form.phone) < 10)
    errs.phone = "Enter at least 10 digits.";
  if (form.reasons.length === 0)
    errs.reasons = "Pick at least one reason for visit.";
  if (!form.message.trim()) errs.message = "A short message is required.";
  else if (form.message.length > 800)
    errs.message = "Please keep it under 800 characters.";
  if (!form.formAcknowledgment)
    errs.consent = "Please confirm before sending.";
  return errs;
}

function FieldText({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-required={required ? "true" : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        style={{
          ...inputBase,
          borderColor: error ? ERROR_ROSE : focused ? ROSE_FOCUS : ROSE,
          background: focused ? CREAM : "rgba(255,245,241,0.85)",
          boxShadow: focused ? `0 0 0 3px rgba(217,117,128,0.18)` : "none",
        }}
      />
      {error ? (
        <div id={`${name}-err`} role="alert" style={errorTextStyle}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

function RadioRow({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const checked = value === opt.value;
          const inputId = `${name}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,
                border: `1px solid ${checked ? DEEP : ROSE}`,
                background: checked
                  ? "rgba(217,155,161,0.22)"
                  : "rgba(255,245,241,0.85)",
                color: WINE,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: 11,
                cursor: "pointer",
                transition: "border-color 0.18s ease, background 0.18s ease",
              }}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                style={hiddenChipInputStyle}
              />
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  border: `1px solid ${checked ? DEEP : ROSE}`,
                  background: checked ? DEEP : "transparent",
                  display: "inline-block",
                  pointerEvents: "none",
                }}
              />
              <span style={{ pointerEvents: "none" }}>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ReasonChips({
  values,
  onToggle,
  error,
}: {
  values: string[];
  onToggle: (v: string) => void;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={labelStyle}>Reason for visit *</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {REASONS.map((r) => {
          const checked = values.includes(r.value);
          const inputId = `reason-${r.value}`;
          return (
            <label
              key={r.value}
              htmlFor={inputId}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,
                border: `1px solid ${checked ? DEEP : ROSE}`,
                background: checked
                  ? "rgba(217,155,161,0.22)"
                  : "rgba(255,245,241,0.85)",
                color: WINE,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: 11,
                cursor: "pointer",
                transition: "border-color 0.18s ease, background 0.18s ease",
              }}
            >
              <input
                id={inputId}
                name="reasons"
                type="checkbox"
                value={r.value}
                checked={checked}
                onChange={() => onToggle(r.value)}
                style={hiddenChipInputStyle}
              />
              <span
                aria-hidden="true"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  border: `1px solid ${checked ? DEEP : ROSE}`,
                  background: checked ? DEEP : "transparent",
                  display: "inline-block",
                  pointerEvents: "none",
                }}
              />
              <span style={{ pointerEvents: "none" }}>{r.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <div role="alert" style={errorTextStyle}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,245,241,0.7)",
        border: "1px solid rgba(138,58,68,0.16)",
        borderRadius: 16,
        boxShadow: "0 14px 46px rgba(74,28,38,0.08)",
        padding: "24px 26px",
        color: WINE,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          fontSize: 10,
          color: DEEP,
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      {children}
    </div>
  );
}

export default function ContactClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketId: string } | null>(null);

  const setField =
    <K extends keyof FormState>(k: K) =>
    (v: FormState[K]) =>
      setForm((f) => ({ ...f, [k]: v }));

  const blurField = (k: keyof FieldErrors) => () => {
    const e = validate(form);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
  };

  const toggleReason = (v: string) => {
    setForm((f) => {
      const next = f.reasons.includes(v)
        ? f.reasons.filter((x) => x !== v)
        : [...f.reasons, v];
      return { ...f, reasons: next };
    });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          preferredContact: form.preferredContact,
          reasons: form.reasons,
          visitType: form.visitType,
          preferredWindow: form.preferredWindow.trim(),
          requestedDate: form.requestedDate,
          requestedTimeWindow: form.requestedTimeWindow,
          message: form.message.trim(),
          formAcknowledgment: form.formAcknowledgment,
          smsConsent: form.smsConsent,
          source: "website_contact_page",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        const text = data?.error;
        throw new Error(
          text || "We couldn't send your message. Please try again.",
        );
      }
      const data = (await res.json()) as { ok: boolean; ticketId: string };
      if (!data.ok || !data.ticketId) {
        throw new Error("We couldn't send your message. Please try again.");
      }
      setSuccess({ ticketId: data.ticketId });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const charCount = form.message.length;

  return (
    <section
      className="wf contact-page"
      data-id="E"
      style={{
        background:
          "linear-gradient(180deg,#fff5f1 0%,#ffe8e2 44%,#f4d4d4 100%)",
      }}
    >
      {/* 1. HERO — reliable soft background with overlaid SiteNav */}
      <div
        className="e-rounded-section"
        style={{
          position: "relative",
          minHeight: "min(54vh, 560px)",
          padding: "160px 6vw 70px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: WINE,
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 18%, rgba(244,163,170,0.42), transparent 34%), radial-gradient(circle at 82% 28%, rgba(255,234,224,0.92), transparent 36%), linear-gradient(180deg,#fff5f1 0%,#ffe9e2 58%,#f4d4d4 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <SiteNav />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.55), transparent 42%), radial-gradient(circle at 50% 100%, rgba(138,58,68,0.1), transparent 34%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 980,
            width: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              fontFamily: MONO,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: 12,
              color: DEEP,
              marginBottom: 28,
            }}
          >
            Reach the practice
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 1.04,
              letterSpacing: "-0.012em",
              color: WINE,
              margin: 0,
            }}
          >
            Talk <em style={{ color: DEEP, fontStyle: "italic" }}>to us.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(20px, 1.6vw, 24px)",
              lineHeight: 1.5,
              color: WINE,
              maxWidth: 680,
              margin: "32px auto 0",
              opacity: 0.92,
            }}
          >
            We answer every inquiry within{" "}
            <em style={{ color: DEEP, fontStyle: "italic" }}>
              one business day
            </em>
            , and the office will call to help confirm the next available
            appointment.
          </motion.p>
        </div>
      </div>

      {/* 2. FORM + INFO STACK */}
      <div
        className="contact-content-shell"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1240,
          padding: "72px 16px 120px",
          margin: "0 auto",
          boxSizing: "border-box",
          color: WINE,
        }}
      >
        <div
          className="contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.42fr) minmax(320px, 0.88fr)",
            gap: 36,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT — FORM PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE }}
            style={glassPanel}
          >
            {success ? (
              <div>
                <div
                  className="contact-field-grid"
                  style={{
                    fontFamily: MONO,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    fontSize: 11,
                    color: DEEP,
                    marginBottom: 18,
                  }}
                >
                  Message received
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(32px, 4vw, 52px)",
                    lineHeight: 1.08,
                    color: WINE,
                    margin: "0 0 18px",
                  }}
                >
                  Thank you.{" "}
                  <em style={{ color: DEEP, fontStyle: "italic" }}>
                    We&apos;ll be in touch soon.
                  </em>
                </h2>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 19,
                    lineHeight: 1.55,
                    color: WINE,
                    margin: "0 0 28px",
                    opacity: 0.92,
                  }}
                >
                  A patient coordinator will reach out within one business day
                  using your preferred contact method. If your inquiry is urgent
                  during clinic hours, you can call the practice directly at{" "}
                  <a
                    href="tel:+13107720072"
                    style={{ color: DEEP, textDecoration: "underline" }}
                  >
                    (310) 772-0072
                  </a>
                  .
                </p>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1.5,
                    color: WINE,
                    margin: "0 0 24px",
                    opacity: 0.84,
                  }}
                >
                  Your appointment is not confirmed until the office calls and
                  verifies availability.
                </p>
                <div
                  className="contact-field-grid"
                  style={{
                    fontFamily: MONO,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    fontSize: 11,
                    color: "rgba(74,28,38,0.6)",
                    marginBottom: 32,
                  }}
                >
                  Reference · {success.ticketId}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <a
                    href="/services/"
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 26px",
                      borderRadius: 999,
                      background: WINE,
                      color: CREAM,
                      textDecoration: "none",
                      fontFamily: MONO,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: 11,
                      overflow: "hidden",
                      border: `1px solid rgba(244,163,170,0.35)`,
                    }}
                  >
                    <BorderBeam
                      size={80}
                      duration={8}
                      colorFrom={LIGHT_ROSE}
                      colorTo={ROSE_FOCUS}
                      borderWidth={1.5}
                    />
                    <span style={{ position: "relative", zIndex: 2 }}>
                      Continue browsing
                    </span>
                    <span
                      aria-hidden="true"
                      style={{ position: "relative", zIndex: 2 }}
                    >
                      →
                    </span>
                  </a>
                  <a
                    href="/womens-health-blog/"
                    style={{
                      fontFamily: MONO,
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      fontSize: 11,
                      color: DEEP,
                      textDecoration: "none",
                      borderBottom: `1px solid ${DEEP}`,
                      paddingBottom: 4,
                    }}
                  >
                    Sign up for the Brief →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div
                  style={{
                    fontFamily: MONO,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    fontSize: 11,
                    color: DEEP,
                    marginBottom: 14,
                  }}
                >
                  Request an appointment
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(28px, 3.4vw, 44px)",
                    lineHeight: 1.1,
                    margin: "0 0 28px",
                    color: WINE,
                  }}
                >
                  Tell us a little, and{" "}
                  <em style={{ color: DEEP, fontStyle: "italic" }}>
                    we&apos;ll take it from here.
                  </em>
                </h2>

                {submitError ? (
                  <div
                    role="alert"
                    style={{
                      marginBottom: 24,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: `1px solid ${ERROR_ROSE}`,
                      background: "rgba(168,58,58,0.08)",
                      color: ERROR_ROSE,
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 15,
                    }}
                  >
                    {submitError}
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <FieldText
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={setField("firstName")}
                    onBlur={blurField("firstName")}
                    error={errors.firstName}
                    autoComplete="given-name"
                    required
                  />
                  <FieldText
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={setField("lastName")}
                    onBlur={blurField("lastName")}
                    error={errors.lastName}
                    autoComplete="family-name"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <FieldText
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    onBlur={blurField("email")}
                    error={errors.email}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                  <FieldText
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    onBlur={blurField("phone")}
                    error={errors.phone}
                    autoComplete="tel"
                    placeholder="(___) ___-____"
                    required
                  />
                </div>

                <RadioRow
                  label="Preferred contact method"
                  name="preferredContact"
                  value={form.preferredContact}
                  options={CONTACT_METHODS}
                  onChange={(v) =>
                    setField("preferredContact")(v as ContactMethod)
                  }
                />

                <ReasonChips
                  values={form.reasons}
                  onToggle={toggleReason}
                  error={errors.reasons}
                />

                <RadioRow
                  label="Visit type"
                  name="visitType"
                  value={form.visitType}
                  options={VISIT_TYPES}
                  onChange={(v) => setField("visitType")(v as VisitType)}
                />

                <FieldText
                  label="Preferred appointment date (optional)"
                  name="requestedDate"
                  type="date"
                  value={form.requestedDate}
                  onChange={setField("requestedDate")}
                  onBlur={() => undefined}
                />

                <RadioRow
                  label="Preferred appointment time"
                  name="requestedTimeWindow"
                  value={form.requestedTimeWindow}
                  options={REQUESTED_TIME_WINDOWS}
                  onChange={setField("requestedTimeWindow")}
                />

                <p
                  style={{
                    margin: "-4px 0 22px",
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: DEEP,
                  }}
                >
                  This is an appointment request, not a confirmed appointment.
                  Our office will call to confirm availability.
                </p>

                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 14,
                      color: DEEP,
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    <em style={{ color: DEEP }}>
                      Please don&apos;t include detailed medical information
                      here.
                    </em>{" "}
                    Use this space to describe what you&apos;re hoping to
                    address; we&apos;ll cover the specifics on a secure call.
                  </div>
                  <label htmlFor="message" style={labelStyle}>
                    Message *
                  </label>
                  <MessageArea
                    value={form.message}
                    onChange={setField("message")}
                    onBlur={blurField("message")}
                    error={errors.message}
                  />
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      {errors.message ? (
                        <div role="alert" style={errorTextStyle}>
                          {errors.message}
                        </div>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontSize: 10,
                        color:
                          charCount > 800 ? ERROR_ROSE : "rgba(74,28,38,0.55)",
                      }}
                    >
                      {charCount} / 800
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label
                    htmlFor="formAcknowledgment"
                    onClick={(e) => {
                      if (isInteractiveLabelTarget(e.target)) return;
                      setField("formAcknowledgment")(!form.formAcknowledgment);
                      setErrors((prev) => ({ ...prev, consent: undefined }));
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                      fontFamily: SERIF,
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: WINE,
                    }}
                  >
                    <input
                      id="formAcknowledgment"
                      name="formAcknowledgment"
                      type="checkbox"
                      checked={form.formAcknowledgment}
                      onChange={(e) =>
                        setField("formAcknowledgment")(e.target.checked)
                      }
                      onBlur={blurField("consent")}
                      aria-required="true"
                      aria-invalid={errors.consent ? "true" : undefined}
                      style={{
                        marginTop: 4,
                        width: 18,
                        height: 18,
                        accentColor: DEEP,
                        flexShrink: 0,
                      }}
                    />
                    <span>{FORM_ACKNOWLEDGMENT_TEXT}</span>
                  </label>
                  {errors.consent ? (
                    <div
                      role="alert"
                      style={{ ...errorTextStyle, marginLeft: 30 }}
                    >
                      {errors.consent}
                    </div>
                  ) : null}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label
                    htmlFor="smsConsent"
                    onClick={(e) => {
                      if (isInteractiveLabelTarget(e.target)) return;
                      setField("smsConsent")(!form.smsConsent);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                      fontFamily: SERIF,
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: WINE,
                    }}
                  >
                    <input
                      id="smsConsent"
                      name="smsConsent"
                      type="checkbox"
                      checked={form.smsConsent}
                      onChange={(e) => setField("smsConsent")(e.target.checked)}
                      style={{
                        marginTop: 4,
                        width: 18,
                        height: 18,
                        accentColor: DEEP,
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      I agree to receive customer care text messages from Berman
                      Women&apos;s Wellness Center about appointment requests,
                      scheduling, and service updates. Message frequency varies,
                      up to 10 messages/month. Message and data rates may apply.
                      Reply HELP for help and STOP to unsubscribe. Consent is
                      not a condition of purchase or treatment. See our{" "}
                      <a
                        href="/privacy/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: DEEP, textDecoration: "underline" }}
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="/terms/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: DEEP, textDecoration: "underline" }}
                      >
                        Terms of Use
                      </a>
                      .
                    </span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: 24,
                    borderTop: `1px solid ${ROSE}`,
                  }}
                >
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      padding: "18px 36px",
                      borderRadius: 999,
                      background:
                        "linear-gradient(180deg,#5a2030 0%,#4a1c26 60%,#3a141d 100%)",
                      color: CREAM,
                      fontFamily: MONO,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      fontSize: 12,
                      overflow: "hidden",
                      border: `1px solid rgba(244,163,170,0.35)`,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.65 : 1,
                      minWidth: 220,
                    }}
                  >
                    <BorderBeam
                      size={80}
                      duration={8}
                      colorFrom={LIGHT_ROSE}
                      colorTo={ROSE_FOCUS}
                      borderWidth={1.5}
                    />
                    <span style={{ position: "relative", zIndex: 2 }}>
                      {submitting ? "Sending…" : "Send message"}
                    </span>
                    {submitting ? null : (
                      <span
                        aria-hidden="true"
                        style={{ position: "relative", zIndex: 2 }}
                      >
                        →
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* RIGHT — INFO STACK */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <InfoCard eyebrow="Location">
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 22,
                  lineHeight: 1.2,
                  color: WINE,
                  marginBottom: 10,
                }}
              >
                The Berman Women&apos;s Wellness Center
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: WINE,
                  opacity: 0.92,
                }}
              >
                415 N. Crescent Drive, Suite 355
                <br />
                Beverly Hills, CA 90210
              </div>
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <a
                  href="tel:+13107720072"
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: DEEP,
                    textDecoration: "none",
                  }}
                >
                  (310) 772-0072
                </a>
              </div>

              <div
                role="img"
                aria-label="Map placeholder showing 415 N. Crescent Drive, Beverly Hills"
                style={{
                  marginTop: 18,
                  aspectRatio: "16 / 10",
                  borderRadius: 14,
                  border: `1px solid ${ROSE}`,
                  background:
                    "linear-gradient(165deg, rgba(255,234,224,0.6), rgba(244,212,212,0.6))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: DEEP,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: `1px solid ${DEEP}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: DEEP,
                  }}
                >
                  ◉
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}
                >
                  Map · Beverly Hills
                </span>
              </div>
            </InfoCard>

            <InfoCard eyebrow="Hours">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  rowGap: 10,
                  columnGap: 18,
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: WINE,
                  lineHeight: 1.4,
                }}
              >
                <span>Monday – Friday</span>
                <span>9:00 AM – 5:00 PM (PT)</span>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: DEEP,
                  lineHeight: 1.5,
                }}
              >
                <em style={{ color: DEEP }}>
                  New patient consults by appointment.
                </em>
              </div>
            </InfoCard>

            <InfoCard eyebrow="Consult options">
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  lineHeight: 1.25,
                  color: WINE,
                  marginBottom: 12,
                }}
              >
                In-person care in Beverly Hills, with virtual consults when
                they are the right fit.
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: WINE,
                  opacity: 0.92,
                }}
              >
                Choose &ldquo;Virtual consult&rdquo; if you want to start with a
                conversation. Exams and procedures are confirmed by the office
                and may require an in-person visit.
              </div>
            </InfoCard>

            <InfoCard eyebrow="Concierge program">
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  lineHeight: 1.45,
                  color: WINE,
                  marginBottom: 12,
                }}
              >
                Direct line for established patients — same-day responses,
                priority scheduling, and travel coordination.
              </div>
              <a
                href="/contact/"
                style={{
                  fontFamily: MONO,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  fontSize: 11,
                  color: DEEP,
                  textDecoration: "none",
                  borderBottom: `1px solid ${DEEP}`,
                  paddingBottom: 3,
                }}
              >
                Learn more →
              </a>
            </InfoCard>
          </motion.div>
        </div>
      </div>

      {/* 3. PAGE TAIL — Brief signup catches visitors who don't submit the form */}
      <PageTail />

      {/* 4. FOOTER */}
      <SiteFooter />
    </section>
  );
}

function MessageArea({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      id="message"
      name="message"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
      autoComplete="off"
      maxLength={800}
      rows={6}
      aria-required="true"
      aria-invalid={error ? "true" : undefined}
      placeholder="What you're hoping to address — a sentence or two is plenty."
      style={{
        ...inputBase,
        minHeight: 140,
        resize: "vertical",
        fontFamily: SERIF,
        fontSize: 16,
        lineHeight: 1.55,
        letterSpacing: "0",
        borderColor: error ? ERROR_ROSE : focused ? ROSE_FOCUS : ROSE,
        background: focused ? CREAM : "rgba(255,245,241,0.85)",
        boxShadow: focused ? `0 0 0 3px rgba(217,117,128,0.18)` : "none",
      }}
    />
  );
}
