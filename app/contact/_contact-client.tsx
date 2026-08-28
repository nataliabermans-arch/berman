"use client";


import BookingFlow from "@/components/booking/BookingFlow";
import { useRef, useState } from "react";
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
  { value: "menopause-hormones", label: "Hormone Replacement Therapy" },
  { value: "sexual-health", label: "Sexual Health" },
  { value: "pelvic-urinary", label: "Pelvic Floor and Urinary Tract Health" },
  { value: "vaginal-rejuvenation", label: "Vaginal Rejuvenation" },
  { value: "aesthetic-regenerative", label: "Aesthetic and Regenerative Care" },
  { value: "menopause-perimenopause", label: "Menopause and Perimenopause Care" },
  { value: "berman-supplements", label: "Supplement and Peptide" },
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
            <div className="booking-page-panel booking-page-panel--inline">
              <BookingFlow
                variant="page"
                displayPhone="(310) 772-0072"
                phoneNumber="+13107720072"
                source="website_contact_page"
                titleId="contact-booking-title"
              />
            </div>
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
                JRB Medical Wellness
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
