"use client";

import { useRef, useState } from "react";

import { FORM_ACKNOWLEDGMENT_TEXT } from "@/lib/leads/a2p";

const WINE = "#4a1c26";
const DEEP = "#8a3a44";
const ROSE = "#d99ba1";
const CREAM = "#fff5f1";
const ERROR_ROSE = "#a83a3a";
const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  consent?: string;
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
  background: "rgba(255,245,241,0.9)",
  color: WINE,
  fontFamily: MONO,
  fontSize: 15,
  outline: "none",
};

function countDigits(s: string): number {
  let n = 0;
  for (const c of s) if (c >= "0" && c <= "9") n++;
  return n;
}

export default function AppointmentRequestForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ack, setAck] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const renderedAtRef = useRef(Date.now());

  const validate = (): Errors => {
    const e: Errors = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email.";
    if (!phone.trim()) e.phone = "Phone is required.";
    else if (countDigits(phone) < 10) e.phone = "Enter at least 10 digits.";
    if (!ack) e.consent = "Please confirm before sending.";
    return e;
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setSubmitError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website,
          elapsedMs: Date.now() - renderedAtRef.current,
          preferredContact: "either",
          reasons: ["not-sure"],
          visitType: "either",
          preferredWindow: "",
          requestedDate: "",
          requestedTimeWindow: "first-available",
          message: "Submitted via the website appointment-request form.",
          formAcknowledgment: ack,
          smsConsent,
          source: "website_appointment_request_form",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error || "We couldn't send your request. Please try again.",
        );
      }
      const data = (await res.json()) as { ok: boolean; ticketId: string };
      if (!data.ok) {
        throw new Error("We couldn't send your request. Please try again.");
      }
      setDone(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "48px 20px 64px",
        background:
          "radial-gradient(circle at 20% 12%, rgba(244,163,170,0.28), transparent 40%), linear-gradient(180deg,#fff5f1 0%,#ffe9e2 60%,#f4d4d4 100%)",
      }}
    >
      <a href="/" aria-label="JRB Medical Wellness — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/jb-logo.webp"
          alt="Jennifer Berman MD"
          width={213}
          height={96}
          style={{ height: 46, width: "auto", marginBottom: 24 }}
        />
      </a>

      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "rgba(255,250,248,0.96)",
          border: "1px solid rgba(138,58,68,0.18)",
          borderRadius: 18,
          boxShadow: "0 22px 70px rgba(74,28,38,0.12)",
          padding: "clamp(24px, 4vw, 40px)",
          color: WINE,
        }}
      >
        <p
          style={{
            fontFamily: MONO,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: 11,
            color: DEEP,
            margin: "0 0 8px",
          }}
        >
          JRB Medical Wellness · Beverly Hills
        </p>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(30px, 5vw, 42px)",
            lineHeight: 1.05,
            margin: "0 0 20px",
          }}
        >
          Request an appointment
        </h1>

        {done ? (
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.5 }}>
              Thank you — your request has been received. Our office will reach
              out to confirm.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: 16,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: 11,
                color: DEEP,
                borderBottom: `1px solid ${DEEP}`,
                paddingBottom: 3,
                textDecoration: "none",
              }}
            >
              Back to homepage →
            </a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            {/* Honeypot: hidden from people, bait for bots. Must stay empty. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                overflow: "hidden",
              }}
            >
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div>
                <label htmlFor="firstName" style={labelStyle}>
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  autoComplete="given-name"
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    ...inputBase,
                    borderColor: errors.firstName ? ERROR_ROSE : ROSE,
                  }}
                />
                {errors.firstName ? (
                  <Err>{errors.firstName}</Err>
                ) : null}
              </div>
              <div>
                <label htmlFor="lastName" style={labelStyle}>
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  autoComplete="family-name"
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    ...inputBase,
                    borderColor: errors.lastName ? ERROR_ROSE : ROSE,
                  }}
                />
                {errors.lastName ? <Err>{errors.lastName}</Err> : null}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="email" style={labelStyle}>
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...inputBase,
                  borderColor: errors.email ? ERROR_ROSE : ROSE,
                }}
              />
              {errors.email ? <Err>{errors.email}</Err> : null}
            </div>

            <div style={{ marginBottom: 22 }}>
              <label htmlFor="phone" style={labelStyle}>
                Phone (mobile) *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                autoComplete="tel"
                placeholder="(310) 000-0000"
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  ...inputBase,
                  borderColor: errors.phone ? ERROR_ROSE : ROSE,
                }}
              />
              {errors.phone ? <Err>{errors.phone}</Err> : null}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.5,
                marginBottom: 16,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="formAcknowledgment"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                style={{ marginTop: 4, width: 18, height: 18, accentColor: DEEP }}
              />
              <span>{FORM_ACKNOWLEDGMENT_TEXT}</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.55,
                marginBottom: 24,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="smsConsent"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                style={{ marginTop: 4, width: 18, height: 18, accentColor: DEEP }}
              />
              <span>
                By checking this box, I consent to receive customer care and
                support SMS messages from JRB Medical Wellness. Reply STOP to
                opt-out; Reply HELP for support. Message &amp; data rates may
                apply; Messaging frequency may vary. Visit{" "}
                <a
                  href="https://bermansexualhealth.com/privacy/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: DEEP, textDecoration: "underline" }}
                >
                  https://bermansexualhealth.com/privacy/
                </a>{" "}
                to see our Privacy Policy and{" "}
                <a
                  href="https://bermansexualhealth.com/terms/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: DEEP, textDecoration: "underline" }}
                >
                  https://bermansexualhealth.com/terms/
                </a>{" "}
                for a Terms of Use. Consent is not a condition of purchase or
                treatment.
              </span>
            </label>

            {submitError ? (
              <p
                role="alert"
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  color: ERROR_ROSE,
                  marginBottom: 14,
                }}
              >
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(180deg,#5a2030 0%,#4a1c26 60%,#3a141d 100%)",
                color: CREAM,
                fontFamily: MONO,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: 12,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Sending…" : "Send request →"}
            </button>
          </form>
        )}
      </div>

      <p
        style={{
          maxWidth: 560,
          margin: "18px auto 0",
          fontFamily: MONO,
          fontSize: 11,
          lineHeight: 1.6,
          color: "rgba(74,28,38,0.6)",
          textAlign: "center",
        }}
      >
        This form is for appointment requests and general coordination only and
        is not a secure medical record. For urgent symptoms, call 911 or go to
        the nearest ER.
      </p>
    </main>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 6,
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: 13,
        color: ERROR_ROSE,
      }}
    >
      {children}
    </div>
  );
}
