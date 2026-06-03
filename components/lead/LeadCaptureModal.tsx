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
  REQUESTED_TIME_WINDOWS,
} from "@/lib/leads/a2p";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

type ReasonValue =
  | "menopause-hormones"
  | "sexual-health"
  | "pelvic-urinary"
  | "vaginal-rejuvenation"
  | "aesthetic-regenerative"
  | "body-contouring"
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
  { value: "menopause-hormones", label: "Hormones or menopause" },
  { value: "sexual-health", label: "Sexual health" },
  { value: "pelvic-urinary", label: "Pelvic or urinary symptoms" },
  { value: "vaginal-rejuvenation", label: "Vaginal rejuvenation" },
  { value: "aesthetic-regenerative", label: "Aesthetic or regenerative care" },
  { value: "body-contouring", label: "Body contouring" },
  { value: "berman-supplements", label: "Supplements" },
  { value: "not-sure", label: "I am not sure yet" },
];

const VISIT_TYPES: Array<{ value: VisitType; label: string }> = [
  { value: "either", label: "Either" },
  { value: "in-person", label: "Beverly Hills" },
  { value: "telehealth", label: "Virtual consult" },
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

function isInteractiveConsentTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("a, button, input, select, textarea"));
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

  useEffect(() => {
    if (!isOpen) return;
    setSubmitState("idle");
    setError("");
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
  const canSubmit =
    form.fullName.trim().length > 1 &&
    form.email.trim().includes("@") &&
    (form.phone.match(/\d/g) || []).length >= 10 &&
    form.reasons.length > 0 &&
    form.formAcknowledgment &&
    submitState !== "submitting";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 0) {
      if (!canContinue) {
        setError("Choose at least one area so we can route your message.");
        return;
      }
      setError("");
      setStep(1);
      return;
    }

    if (!canSubmit) {
      setError("Please add your name, email, phone number, and acknowledgment.");
      return;
    }

    setSubmitState("submitting");
    setError("");
    const { firstName, lastName } = splitName(form.fullName);
    const note = form.note.trim();
    const message =
      note ||
      [
        "New website call request.",
        `Area(s): ${form.reasons.join(", ")}.`,
        `Requested date: ${form.requestedDate || "not specified"}.`,
        `Requested time window: ${form.requestedTimeWindow || "not specified"}.`,
      ].join(" ");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email.trim(),
          phone: form.phone.trim(),
          preferredContact: form.preferredContact,
          reasons: form.reasons,
          visitType: form.visitType,
          requestedDate: form.requestedDate,
          requestedTimeWindow: form.requestedTimeWindow,
          message,
          formAcknowledgment: form.formAcknowledgment,
          smsConsent: form.smsConsent,
          source: "website_lead_modal",
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        ticketId?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error || "We could not send that yet. Please call us.",
        );
      }

      setTicketId(data.ticketId || "");
      setSubmitState("success");
      setForm(INITIAL_FORM);
      setStep(0);
    } catch (err) {
      setSubmitState("error");
      setError(
        err instanceof Error
          ? err.message
          : "We could not send that yet. Please call us.",
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
            <p className="lead-kicker">Request received</p>
            <h2 id="lead-modal-title">
              You are on our radar. A coordinator will reach out soon.
            </h2>
            <p>
              If you need help faster, call{" "}
              <a href={`tel:${phoneNumber}`}>{displayPhone}</a>.
            </p>
            {ticketId ? <small>Reference {ticketId}</small> : null}
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
              <form onSubmit={submit} className="lead-modal-form" noValidate>
                <p className="lead-kicker">Ready to be heard?</p>
                <h2 id="lead-modal-title">
                  {step === 0
                    ? "Tell us what kind of support would feel useful right now."
                    : "How should our team reach you?"}
                </h2>
                <div className="lead-progress" aria-hidden="true">
                  <span className={step === 0 ? "active" : ""} />
                  <span className={step === 1 ? "active" : ""} />
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

                    <fieldset>
                      <legend>What kind of visit feels right?</legend>
                      <div className="lead-segmented">
                        {VISIT_TYPES.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={
                              form.visitType === option.value ? "selected" : ""
                            }
                            onClick={() => setField("visitType", option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </>
                ) : (
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

                    <label>
                      <span>Preferred appointment date</span>
                      <input
                        name="requestedDate"
                        type="date"
                        value={form.requestedDate}
                        onChange={(event) =>
                          setField("requestedDate", event.target.value)
                        }
                      />
                    </label>

                    <fieldset>
                      <legend>Preferred appointment time</legend>
                      <div className="lead-segmented lead-time-grid">
                        {REQUESTED_TIME_WINDOWS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={
                              form.requestedTimeWindow === option.value
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setField("requestedTimeWindow", option.value)
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p className="lead-field-note">
                        This is an appointment request, not a confirmed
                        appointment. Our office will call to confirm
                        availability.
                      </p>
                    </fieldset>

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

                    <label
                      className="lead-consent"
                      onClick={(event) => {
                        if (isInteractiveConsentTarget(event.target)) return;
                        setField(
                          "formAcknowledgment",
                          !form.formAcknowledgment,
                        );
                      }}
                    >
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

                    <label
                      className="lead-consent"
                      onClick={(event) => {
                        if (isInteractiveConsentTarget(event.target)) return;
                        setField("smsConsent", !form.smsConsent);
                      }}
                    >
                      <input
                        name="smsConsent"
                        type="checkbox"
                        checked={form.smsConsent}
                        onChange={(event) =>
                          setField("smsConsent", event.target.checked)
                        }
                      />
                      <span>
                        I agree to receive customer care text messages from
                        Berman Women&apos;s Wellness Center about appointment
                        requests, scheduling, and service updates. Message
                        frequency varies, up to 10 messages/month. Message and
                        data rates may apply. Reply HELP for help and STOP to
                        unsubscribe. Consent is not a condition of purchase or
                        treatment. See our{" "}
                        <a href="/privacy/" target="_blank" rel="noreferrer">
                          Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a href="/terms/" target="_blank" rel="noreferrer">
                          Terms of Use
                        </a>
                        .
                      </span>
                    </label>
                  </>
                )}

                {error ? <p className="lead-error">{error}</p> : null}

                <div className="lead-actions">
                  {step === 1 ? (
                    <button
                      type="button"
                      className="lead-back"
                      onClick={() => {
                        setError("");
                        setStep(0);
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
                    disabled={step === 1 ? !canSubmit : !canContinue}
                  >
                    {submitState === "submitting" ? (
                      <Loader2 aria-hidden="true" size={16} />
                    ) : null}
                    {step === 0 ? "Continue" : "Send request"}
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
