"use client";

import { CheckCircle2, ChevronLeft, Loader2, Phone } from "lucide-react";
import { FORM_ACKNOWLEDGMENT_TEXT } from "@/lib/leads/a2p";
import { type FormEvent, useRef, useState } from "react";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import Recaptcha from "@/components/booking/Recaptcha";

// The one booking implementation. The modal wraps this in its chrome; the
// /contact and /appointment-request pages render it inline. Previously each of
// those three surfaces carried its own copy of intake, which is how they came
// to disagree about which fields they even collected.

// Opt-in, matching lib/booking/human.ts. Off unless explicitly switched on.
const CAPTCHA_REQUIRED =
  (process.env.NEXT_PUBLIC_BOOKING_REQUIRE_CAPTCHA || "").trim() === "true" &&
  Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

export type ReasonValue =
  | "menopause-hormones"
  | "sexual-health"
  | "pelvic-urinary"
  | "vaginal-rejuvenation"
  | "aesthetic-regenerative"
  | "menopause-perimenopause"
  | "berman-supplements"
  | "not-sure";

type PreferredContact = "phone" | "email" | "either";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: PreferredContact;
  reasons: ReasonValue[];
  note: string;
  formAcknowledgment: boolean;
  smsConsent: boolean;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredContact: "phone",
  reasons: [],
  note: "",
  formAcknowledgment: false,
  smsConsent: false,
};

const REASONS: Array<{ value: ReasonValue; label: string }> = [
  { value: "menopause-hormones", label: "Hormone Replacement Therapy" },
  { value: "sexual-health", label: "Sexual health" },
  { value: "pelvic-urinary", label: "Pelvic Floor and Urinary Tract Health" },
  { value: "vaginal-rejuvenation", label: "Vaginal rejuvenation" },
  { value: "aesthetic-regenerative", label: "Aesthetic and Regenerative Care" },
  { value: "menopause-perimenopause", label: "Menopause and Perimenopause Care" },
  { value: "berman-supplements", label: "Supplement and Peptide" },
  { value: "not-sure", label: "I am not sure yet" },
];

const CONTACT_METHODS: Array<{ value: PreferredContact; label: string }> = [
  { value: "phone", label: "Call me" },
  { value: "email", label: "Email me" },
  { value: "either", label: "Either" },
];

type SubmitState = "idle" | "submitting" | "success" | "error";

export type BookingFlowProps = {
  displayPhone: string;
  phoneNumber: string;
  /** "modal" adds the Done button; "page" has nothing to close. */
  variant?: "modal" | "page";
  onDone?: () => void;
  /** Distinguishes which surface a lead came from, in the CRM. */
  source?: string;
  /** Lets the modal know it must not be dismissed mid-request. */
  onBusyChange?: (busy: boolean) => void;
  titleId?: string;
};

export default function BookingFlow({
  displayPhone,
  phoneNumber,
  variant = "page",
  onDone,
  source = "website_booking_flow",
  onBusyChange,
  titleId = "booking-flow-title",
}: BookingFlowProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitState, setSubmitStateRaw] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [consultId, setConsultId] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const renderedAtRef = useRef(Date.now());
  const [startTime, setStartTime] = useState("");
  const [bookedAt, setBookedAt] = useState("");
  const [slotRefresh, setSlotRefresh] = useState(0);
  const [humanPass, setHumanPass] = useState("");

  const setSubmitState = (next: SubmitState) => {
    setSubmitStateRaw(next);
    onBusyChange?.(next === "submitting");
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleReason = (reason: ReasonValue) => {
    setForm((current) => ({
      ...current,
      reasons: current.reasons.includes(reason)
        ? current.reasons.filter((item) => item !== reason)
        : [...current.reasons, reason],
    }));
  };

  // Set when the CAPTCHA reports that verification isn't required in this
  // environment (a Vercel preview, which is already behind Vercel's login).
  const [captchaSkipped, setCaptchaSkipped] = useState(false);
  // True when the outcome is genuinely unknown — the request may have booked.
  // Retrying from here is how a patient ends up with two appointments, so the
  // submit button is withdrawn rather than re-armed.
  const [terminal, setTerminal] = useState(false);
  const humanVerified =
    !CAPTCHA_REQUIRED || captchaSkipped || Boolean(humanPass);

  // Name exactly what is wrong. One message listing every field leaves the
  // patient guessing, and a phone of "test" looks filled in.
  const detailProblems = (): string[] => {
    const problems: string[] = [];
    if (form.firstName.trim().length < 1) problems.push("your first name");
    if (form.lastName.trim().length < 1) problems.push("your last name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      problems.push("a valid email address");
    }
    const digits = (form.phone.match(/\d/g) || []).length;
    if (digits === 0) problems.push("a phone number");
    else if (digits < 10) problems.push("a phone number with at least 10 digits");
    if (!form.formAcknowledgment) problems.push("the acknowledgment ticked");
    return problems;
  };

  // Funnel visibility only. Reason-for-visit and any other clinical detail must
  // never enter the dataLayer — it is readable by every tag on the page.
  const track = (event: string, params: Record<string, unknown> = {}) => {
    try {
      const w = window as unknown as {
        dataLayer?: Array<Record<string, unknown>>;
      };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event, lead_source: source, ...params });
    } catch {
      // no-op
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 0) {
      if (form.reasons.length === 0) {
        setError("Choose at least one area so we can route your message.");
        return;
      }
      if (!humanVerified) {
        setError("Please complete the verification below to continue.");
        return;
      }
      setError("");
      setStep(1);
      track("booking_step_complete", { step: 1 });
      return;
    }

    if (step === 1) {
      const problems = detailProblems();
      if (problems.length) {
        const list =
          problems.length === 1
            ? problems[0]
            : `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`;
        setError(`Please add ${list}.`);
        return;
      }
      setError("");
      setStep(2);
      track("booking_step_complete", { step: 2 });
      track("booking_availability_shown");
      return;
    }

    if (!startTime) {
      setError("Choose a time for your consult.");
      return;
    }

    setSubmitState("submitting");
    setError("");
    track("booking_submitted");

    try {
      const response = await fetch("/api/booking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Without a deadline a dropped mobile connection hangs this fetch for
        // minutes. The modal blocks its own close while submitting, so the
        // patient would be trapped in a dialog they cannot dismiss, on a page
        // they cannot scroll, at the moment of conversion.
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website,
          elapsedMs: Date.now() - renderedAtRef.current,
          preferredContact: form.preferredContact,
          visitType: "either",
          reasons: form.reasons,
          note: form.note.trim(),
          formAcknowledgment: form.formAcknowledgment,
          smsConsent: form.smsConsent,
          humanPass,
          startTime,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "America/Los_Angeles",
          source,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        consultId?: string;
        startTime?: string;
        code?: string;
        error?: string;
      } | null;

      // Someone else took the slot between render and submit.
      if (response.status === 409 || data?.code === "slot_taken") {
        setStartTime("");
        setSlotRefresh((n) => n + 1);
        setSubmitState("idle");
        setError("That time was just taken. Please choose another.");
        track("booking_failed", { reason: "slot_taken" });
        return;
      }

      // Verification lapsed — send them back to the checkbox and clear the
      // dead pass, or `humanVerified` stays truthy on a stale string.
      if (response.status === 403 || data?.code === "verification_expired") {
        setHumanPass("");
        setStep(0);
        setSubmitState("idle");
        setError(
          data?.error ||
            "Your verification expired. Please tick the verification box again.",
        );
        track("booking_failed", { reason: "verification_expired" });
        return;
      }

      // The server could not establish whether the booking landed. Retrying is
      // exactly how a patient ends up with two appointments, so this is
      // terminal: no submit button, and clear instructions.
      if (data?.code === "unverified") {
        setTerminal(true);
        setSubmitState("error");
        setError(
          data.error ||
            `We're still confirming your time. Please check your email before booking again, or call ${displayPhone}.`,
        );
        track("booking_failed", { reason: "unverified" });
        return;
      }

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            `We could not confirm that booking. Please call ${displayPhone}.`,
        );
      }

      setConsultId(data.consultId || "");
      setBookedAt(data.startTime || startTime);
      setSubmitState("success");
      track("booking_confirmed", { transaction_id: data.consultId });
    } catch (err) {
      setSubmitState("error");
      // A timeout means the request may well have booked — we simply stopped
      // listening. Treat it like the server's own "unverified": terminal, with
      // instructions, never a retry button.
      const timedOut =
        err instanceof DOMException && err.name === "TimeoutError";
      const isNetwork = err instanceof TypeError;

      if (timedOut) {
        setTerminal(true);
        track("booking_failed", { reason: "client_timeout" });
        setError(
          `This is taking longer than expected and your booking may already be confirmed. Please check your email before trying again, or call ${displayPhone}.`,
        );
        return;
      }

      track("booking_failed", { reason: isNetwork ? "network" : "error" });
      setError(
        isNetwork
          ? `We couldn't reach the booking system — please check your connection and try again, or call ${displayPhone}.`
          : err instanceof Error
            ? err.message
            : `We could not confirm that booking. Please call ${displayPhone}.`,
      );
    }
  };

  if (submitState === "success") {
    return (
      <div className="lead-success">
        <CheckCircle2 aria-hidden="true" size={34} />

        <p className="lead-kicker">Thank you</p>

        <h2 id={titleId}>
          {bookedAt
            ? new Date(bookedAt).toLocaleString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "You're all set."}
        </h2>

        <p className="lead-success-lead">
          Your complimentary 15-minute consult is booked.
        </p>

        <p className="lead-success-detail">
          We&apos;ve emailed the details. A patient coordinator will call you at
          that time.
        </p>

        {variant === "modal" && onDone ? (
          <button type="button" onClick={onDone}>
            Done
          </button>
        ) : null}

        <p className="lead-success-detail">
          Need to change it? Call{" "}
          <a href={`tel:${phoneNumber}`}>{displayPhone}</a>.
        </p>

        {consultId ? <small>Reference {consultId}</small> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="lead-modal-form" noValidate>
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

      <h2 id={titleId}>
        {step === 0
          ? "Book your complimentary 15-minute consult."
          : step === 1
            ? "How should our team reach you?"
            : "Pick a time that works for you."}
      </h2>
      <div className="lead-progress" aria-hidden="true">
        <span className={step === 0 ? "active" : ""} />
        <span className={step === 1 ? "active" : ""} />
        <span className={step === 2 ? "active" : ""} />
      </div>

      {step === 0 ? (
        <>
          <fieldset>
            <legend>What brings you here?</legend>
            <div className="lead-chip-grid">
              {REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  className={form.reasons.includes(reason.value) ? "selected" : ""}
                  onClick={() => toggleReason(reason.value)}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </fieldset>
          {/* Reports its own failures inline. */}
          <Recaptcha
            onPass={setHumanPass}
            onSkipped={() => setCaptchaSkipped(true)}
          />
        </>
      ) : step === 1 ? (
        <>
          <div className="lead-field-grid">
            <label>
              <span>First name</span>
              <input
                name="firstName"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                autoComplete="given-name"
                placeholder="First name"
              />
            </label>
            <label>
              <span>Last name</span>
              <input
                name="lastName"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                autoComplete="family-name"
                placeholder="Last name"
              />
            </label>
          </div>
          <div className="lead-field-grid">
            <label>
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                placeholder={displayPhone}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <fieldset>
            <legend>How should we reach you?</legend>
            <div className="lead-segmented">
              {CONTACT_METHODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    form.preferredContact === option.value ? "selected" : ""
                  }
                  onClick={() => setField("preferredContact", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            <span>Anything non-urgent you want us to know?</span>
            <textarea
              name="note"
              value={form.note}
              onChange={(e) => setField("note", e.target.value.slice(0, 500))}
              placeholder="Please do not include detailed medical information here."
              rows={3}
            />
          </label>

          <label className="lead-consent">
            <input
              name="formAcknowledgment"
              type="checkbox"
              checked={form.formAcknowledgment}
              onChange={(e) => setField("formAcknowledgment", e.target.checked)}
            />
            <span>{FORM_ACKNOWLEDGMENT_TEXT}</span>
          </label>

          <label className="lead-consent">
            <input
              name="smsConsent"
              type="checkbox"
              checked={form.smsConsent}
              onChange={(e) => setField("smsConsent", e.target.checked)}
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
              >
                https://bermansexualhealth.com/privacy/
              </a>{" "}
              to see our Privacy Policy and{" "}
              <a
                href="https://bermansexualhealth.com/terms/"
                target="_blank"
                rel="noreferrer"
              >
                https://bermansexualhealth.com/terms/
              </a>{" "}
              for a Terms of Use. Consent is not a condition of purchase or
              treatment.
            </span>
          </label>
        </>
      ) : (
        <>
          {startTime ? (
            <p className="booking-chosen">
              Selected&nbsp;&mdash;{" "}
              {new Date(startTime).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          ) : null}
          <TimeSlotPicker
            value={startTime}
            refreshToken={slotRefresh}
            // The server consumes the slot partway through the request, so a
            // poll landing mid-submit would see it gone and tell the patient
            // their booking failed while it is in fact succeeding — and push a
            // false booking_failed into the analytics for a confirmed consult.
            //
            // `terminal` matters just as much: on the outcome-unknown paths the
            // booking has most likely gone through, so the slot legitimately
            // disappears. Un-freezing there would replace "your booking may
            // already be confirmed — check your email" with "choose another
            // time" on a screen whose submit button has been withdrawn, which
            // is how a patient ends up booking twice.
            frozen={submitState === "submitting" || terminal}
            onChange={(next) => {
              setStartTime(next);
              setError("");
              track("booking_slot_selected");
            }}
            onSelectedSlotGone={() => {
              setStartTime("");
              setError("Someone just booked that time. Please choose another.");
              track("booking_failed", { reason: "slot_gone_live" });
            }}
          />
        </>
      )}

      {error ? <p className="lead-error">{error}</p> : null}

      <div className="lead-actions">
        {step > 0 ? (
          <button
            type="button"
            className="lead-back"
            onClick={() => {
              setError("");
              // Leaving the picker drops the selection. Keeping it meant a
              // double-click on "Choose a time →" could advance to step 2 and
              // immediately submit the old slot, booking an appointment the
              // patient never saw a picker for.
              if (step === 2) setStartTime("");
              setStep(step - 1);
            }}
          >
            <ChevronLeft aria-hidden="true" size={16} />
            Back
          </button>
        ) : (
          <a href={`tel:${phoneNumber}`}>
            <Phone aria-hidden="true" size={16} />
            {displayPhone}
          </a>
        )}
        {/* Withdrawn entirely once the outcome is unknown: a retry from here
            is how a patient ends up with two appointments. */}
        {terminal ? null : (
          <button
            type="submit"
            className="lead-submit"
            disabled={submitState === "submitting" || (step === 2 && !startTime)}
          >
            {submitState === "submitting" ? (
              <Loader2 aria-hidden="true" size={16} />
            ) : null}
            {step === 0
              ? "Continue"
              : step === 1
                ? "Choose a time →"
                : "Confirm my booking →"}
          </button>
        )}
      </div>

      <p className="lead-fineprint">
        This website form is for contact requests only and is not a secure
        medical record. For urgent symptoms, call 911 or go to the nearest ER.
      </p>
    </form>
  );
}
