"use client";

import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Phone,
  X,
} from "lucide-react";
import {
  FORM_ACKNOWLEDGMENT_TEXT,
} from "@/lib/leads/a2p";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";

type ReasonValue =
  | "menopause-hormones"
  | "sexual-health"
  | "pelvic-urinary"
  | "vaginal-rejuvenation"
  | "aesthetic-regenerative"
  | "body-contouring"
  | "menopause-perimenopause"
  | "berman-supplements"
  | "not-sure";

type PreferredContact = "phone" | "email" | "either";
type VisitType = "in-person" | "telehealth" | "either";

type LeadFormState = {
  fullName: string;
  email: string;
  phone: string;
  preferredContact: PreferredContact;
  visitType: VisitType;
  requestedDate: string;
  requestedTimeWindow: string;
  reasons: ReasonValue[];
  note: string;
  formAcknowledgment: boolean;
  smsConsent: boolean;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM: LeadFormState = {
  fullName: "",
  email: "",
  phone: "",
  preferredContact: "phone",
  visitType: "either",
  requestedDate: "",
  requestedTimeWindow: "first-available",
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

function splitName(fullName: string) {
  const parts = fullName.trim().replace(/\s+/g, " ").split(" ");
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "Not provided";
  return { firstName, lastName };
}

type LeadCaptureModalProps = {
  displayPhone: string;
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
};

export default function LeadCaptureModal({
  displayPhone,
  isOpen,
  onClose,
  phoneNumber,
}: LeadCaptureModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LeadFormState>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const renderedAtRef = useRef(Date.now());
  // Step 2 — the consult is booked here, in-page. No redirect.
  const [startTime, setStartTime] = useState("");
  const [bookedAt, setBookedAt] = useState("");
  const [slotRefresh, setSlotRefresh] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitState("idle");
    setError("");
    renderedAtRef.current = Date.now();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const setField = <K extends keyof LeadFormState>(
    key: K,
    value: LeadFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const toggleReason = (reason: ReasonValue) => {
    setForm((current) => {
      const reasons = current.reasons.includes(reason)
        ? current.reasons.filter((item) => item !== reason)
        : [...current.reasons, reason];
      return { ...current, reasons };
    });
  };

  const canContinue = form.reasons.length > 0;
  const detailsComplete =
    form.fullName.trim().length > 1 &&
    form.email.trim().includes("@") &&
    (form.phone.match(/\d/g) || []).length >= 10 &&
    form.formAcknowledgment;
  const canSubmit =
    detailsComplete && Boolean(startTime) && submitState !== "submitting";

  // Analytics: funnel visibility only. Reason-for-visit and any other clinical
  // detail must never enter the dataLayer — it is readable by every tag on the
  // page and by anyone with devtools open.
  const track = (event: string, params: Record<string, unknown> = {}) => {
    try {
      const w = window as unknown as {
        dataLayer?: Array<Record<string, unknown>>;
      };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event, lead_source: "website_lead_modal", ...params });
    } catch {
      // no-op
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 0) {
      if (!canContinue) {
        setError("Choose at least one area so we can route your message.");
        return;
      }
      setError("");
      setStep(1);
      track("booking_step_complete", { step: 1 });
      return;
    }

    if (step === 1) {
      if (!detailsComplete) {
        setError(
          "Please add your name, email, phone number, and acknowledgment.",
        );
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
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website,
          elapsedMs: Date.now() - renderedAtRef.current,
          preferredContact: form.preferredContact,
          visitType: form.visitType,
          reasons: form.reasons,
          note: form.note.trim(),
          formAcknowledgment: form.formAcknowledgment,
          smsConsent: form.smsConsent,
          startTime,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "America/Los_Angeles",
          source: "website_lead_modal",
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        consultId?: string;
        startTime?: string;
        code?: string;
        error?: string;
      } | null;

      // Someone else took the slot between render and submit. Refresh the
      // times and let them pick again rather than failing the whole form.
      if (response.status === 409 || data?.code === "slot_taken") {
        setStartTime("");
        setSlotRefresh((n) => n + 1);
        setSubmitState("idle");
        setError("That time was just taken. Please choose another.");
        track("booking_failed", { reason: "slot_taken" });
        return;
      }

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error || "We could not confirm that booking. Please call us.",
        );
      }

      setTicketId(data.consultId || "");
      setBookedAt(data.startTime || startTime);
      setSubmitState("success");
      track("booking_confirmed", { transaction_id: data.consultId });
    } catch (err) {
      setSubmitState("error");
      track("booking_failed", { reason: "error" });
      setError(
        err instanceof Error
          ? err.message
          : "We could not confirm that booking. Please call us.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="lead-modal-shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
    >
      <button
        type="button"
        className="lead-modal-backdrop"
        aria-label="Close request form"
        onClick={onClose}
      />
      <div className="lead-modal-panel">
        <button
          type="button"
          className="lead-modal-close"
          aria-label="Close request form"
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>

        {submitState === "success" ? (
          <div className="lead-success">
            <CheckCircle2 aria-hidden="true" size={34} />
            <p className="lead-kicker">Your consult is booked</p>
            <h2 id="lead-modal-title">
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
            <p>
              We&apos;ve emailed your confirmation. A patient coordinator will
              call you at that time for your complimentary 15-minute consult.
            </p>
            <button type="button" onClick={onClose}>
              Done
            </button>
            <p>
              Need to change it? Call{" "}
              <a href={`tel:${phoneNumber}`}>{displayPhone}</a>.
            </p>
            {ticketId ? <small>Reference {ticketId}</small> : null}
          </div>
        ) : (
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
                <h2 id="lead-modal-title">
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
                            className={
                              form.reasons.includes(reason.value)
                                ? "selected"
                                : ""
                            }
                            onClick={() => toggleReason(reason.value)}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </>
                ) : step === 1 ? (
                  <>
                    <div className="lead-field-grid">
                      <label>
                        <span>Name</span>
                        <input
                          name="name"
                          value={form.fullName}
                          onChange={(event) =>
                            setField("fullName", event.target.value)
                          }
                          autoComplete="name"
                          placeholder="Your name"
                        />
                      </label>
                      <label>
                        <span>Phone</span>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={(event) =>
                            setField("phone", event.target.value)
                          }
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder={displayPhone}
                        />
                      </label>
                    </div>
                    <label>
                      <span>Email</span>
                      <input
                        name="email"
                        value={form.email}
                        onChange={(event) =>
                          setField("email", event.target.value)
                        }
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                      />
                    </label>

                    <fieldset>
                      <legend>How should we reach you?</legend>
                      <div className="lead-segmented">
                        {CONTACT_METHODS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={
                              form.preferredContact === option.value
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setField("preferredContact", option.value)
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <p className="lead-field-note">
                      This is an appointment request, not a confirmed
                      appointment. Our office will call to confirm
                      availability.
                    </p>

                    <label>
                      <span>Anything non-urgent you want us to know?</span>
                      <textarea
                        name="note"
                        value={form.note}
                        onChange={(event) =>
                          setField("note", event.target.value.slice(0, 500))
                        }
                        placeholder="Please do not include detailed medical information here."
                        rows={3}
                      />
                    </label>

                    <label className="lead-consent">
                      <input
                        name="formAcknowledgment"
                        type="checkbox"
                        checked={form.formAcknowledgment}
                        onChange={(event) =>
                          setField("formAcknowledgment", event.target.checked)
                        }
                      />
                      <span>{FORM_ACKNOWLEDGMENT_TEXT}</span>
                    </label>

                    <label className="lead-consent">
                      <input
                        name="smsConsent"
                        type="checkbox"
                        checked={form.smsConsent}
                        onChange={(event) =>
                          setField("smsConsent", event.target.checked)
                        }
                      />
                      <span>
                        By checking this box, I consent to receive customer care
                        and support SMS messages from JRB Medical Wellness. Reply
                        STOP to opt-out; Reply HELP for support. Message &amp;
                        data rates may apply; Messaging frequency may vary. Visit{" "}
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
                        for a Terms of Use. Consent is not a condition of
                        purchase or treatment.
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
                      onChange={(next) => {
                        setStartTime(next);
                        setError("");
                        track("booking_slot_selected");
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
                  <button
                    type="submit"
                    className="lead-submit"
                    disabled={
                      submitState === "submitting" ||
                      (step === 2 && !startTime)
                    }
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
                </div>

                <p className="lead-fineprint">
                  This website form is for contact requests only and is not a
                  secure medical record. For urgent symptoms, call 911 or go to
                  the nearest ER.
                </p>
              </form>
            )}
      </div>
    </div>
  );
}
