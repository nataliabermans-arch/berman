"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MeshGradient } from "@paper-design/shaders-react";

import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import { BorderBeam } from "@/components/ui/border-beam";
import { useCartStore } from "@/lib/commerce/cart-store";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  CustomerInfo,
  ShippingAddress,
} from "@/lib/commerce/types";

const EASE = [0.2, 0.7, 0.2, 1] as [number, number, number, number];
const VIEWPORT = { once: true, margin: "-80px" } as const;

const SERIF = "'Cormorant Garamond', 'Times New Roman', serif";
const MONO = "'DM Mono', ui-monospace, monospace";

const WINE = "#4a1c26";
const DEEP = "#8a3a44";
const ROSE = "#d99ba1";
const ROSE_FOCUS = "#d97580";
const CREAM = "#fff5f1";
const ERROR_RED = "#a83a3a";

const US_STATES: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

type Step = 1 | 2 | 3;

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

const formatMoney = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ItalicHeadline({
  text,
  italicWord,
}: {
  text: string;
  italicWord: string;
}) {
  const idx = text.indexOf(italicWord);
  if (idx === -1) return <>{text}</>;
  const pre = text.slice(0, idx);
  const post = text.slice(idx + italicWord.length);
  return (
    <>
      {pre}
      <em style={{ color: DEEP, fontStyle: "italic" }}>{italicWord}</em>
      {post}
    </>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const items: Array<{ n: Step; label: string }> = [
    { n: 1, label: "Contact" },
    { n: 2, label: "Shipping" },
    { n: 3, label: "Review" },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 28,
        fontFamily: MONO,
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        fontSize: 11,
        color: "rgba(74,28,38,0.55)",
        marginBottom: 28,
      }}
    >
      {items.map((it) => (
        <span
          key={it.n}
          style={{
            color: it.n === current ? WINE : "rgba(74,28,38,0.45)",
            fontWeight: it.n === current ? 600 : 400,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              border:
                it.n === current
                  ? `1px solid ${DEEP}`
                  : "1px solid rgba(74,28,38,0.25)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              background:
                it.n === current ? "rgba(217,155,161,0.18)" : "transparent",
            }}
          >
            {it.n}
          </span>
          {it.label}
        </span>
      ))}
    </div>
  );
}

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
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function Field({
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
  name: keyof FormState;
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
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        style={{
          ...inputBase,
          borderColor: error ? ERROR_RED : focused ? ROSE_FOCUS : ROSE,
          boxShadow: focused ? `0 0 0 3px rgba(217,117,128,0.18)` : "none",
        }}
      />
      {error ? (
        <div
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: ERROR_RED,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

function StateSelect({
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
    <div style={{ marginBottom: 18 }}>
      <label htmlFor="state" style={labelStyle}>
        State *
      </label>
      <select
        id="state"
        name="state"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        style={{
          ...inputBase,
          appearance: "none",
          backgroundImage:
            "linear-gradient(45deg, transparent 50%, #4a1c26 50%), linear-gradient(135deg, #4a1c26 50%, transparent 50%)",
          backgroundPosition: "calc(100% - 22px) 50%, calc(100% - 16px) 50%",
          backgroundSize: "6px 6px, 6px 6px",
          backgroundRepeat: "no-repeat",
          paddingRight: 38,
          borderColor: error ? ERROR_RED : focused ? ROSE_FOCUS : ROSE,
          boxShadow: focused ? `0 0 0 3px rgba(217,117,128,0.18)` : "none",
        }}
      >
        <option value="">Select a state</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      {error ? (
        <div
          style={{
            marginTop: 6,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: ERROR_RED,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

function ContinueButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
        textDecoration: "none",
        fontFamily: MONO,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        fontSize: 12,
        overflow: "hidden",
        border: "1px solid rgba(244,163,170,0.35)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        minWidth: 220,
      }}
    >
      <BorderBeam
        size={80}
        duration={8}
        colorFrom="#f4a3aa"
        colorTo="#d97580"
        borderWidth={1.5}
      />
      <span style={{ position: "relative", zIndex: 2 }}>{label}</span>
      <span style={{ position: "relative", zIndex: 2 }}>→</span>
    </button>
  );
}

const glassPanel: React.CSSProperties = {
  background: "rgba(255,245,241,0.7)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${ROSE}`,
  borderRadius: 24,
  padding: "40px 40px",
  color: WINE,
};

export default function CheckoutClient() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
  );
  const clearCart = useCartStore((s) => s.clear);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !submitting) {
      router.push("/checkout/empty");
    }
  }, [hydrated, lines.length, router, submitting]);

  const setField = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateField = (k: keyof FormState, v: string): string | undefined => {
    const trimmed = v.trim();
    if (k === "phone" || k === "line2") return undefined;
    if (k === "email") {
      if (!trimmed) return "Email is required.";
      if (!EMAIL_RE.test(trimmed)) return "Enter a valid email.";
      return undefined;
    }
    if (k === "postalCode") {
      if (!trimmed) return "ZIP code is required.";
      if (!ZIP_RE.test(trimmed)) return "Enter a 5-digit ZIP.";
      return undefined;
    }
    if (k === "state") {
      if (!trimmed) return "Select a state.";
      return undefined;
    }
    if (k === "country") return undefined;
    if (!trimmed) return "Required.";
    return undefined;
  };

  const blurField = (k: keyof FormState) => () => {
    setErrors((prev) => ({ ...prev, [k]: validateField(k, form[k]) }));
  };

  const stepFields: Record<Step, Array<keyof FormState>> = {
    1: ["email", "firstName", "lastName", "phone"],
    2: ["line1", "line2", "city", "state", "postalCode", "country"],
    3: [],
  };

  const validateStep = (s: Step): boolean => {
    const fields = stepFields[s];
    const next: Errors = {};
    let ok = true;
    for (const f of fields) {
      const err = validateField(f, form[f]);
      if (err) {
        next[f] = err;
        ok = false;
      }
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return ok;
  };

  const advance = () => {
    if (step === 3) return;
    if (!validateStep(step)) return;
    setStep((s) => (s + 1) as Step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((s) => (s - 1) as Step);
  };

  const tax = useMemo(() => subtotal * 0.0875, [subtotal]);
  const shipping = useMemo(
    () => (subtotal >= 150 || subtotal === 0 ? 0 : 8.95),
    [subtotal],
  );
  const total = subtotal + tax + shipping;

  const submit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const customer: CustomerInfo = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
      };
      const shippingAddr: ShippingAddress = {
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        postalCode: form.postalCode.trim(),
        country: form.country || "US",
      };
      const body: CreateOrderRequest = {
        customer,
        shipping: shippingAddr,
        items: lines.map((l) => ({
          productSlug: l.productSlug,
          quantity: l.quantity,
        })),
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Order could not be placed.");
      }
      const data = (await res.json()) as CreateOrderResponse;
      clearCart();
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(data.orderId)}`,
      );
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Something went wrong placing your order.",
      );
      setSubmitting(false);
    }
  };

  return (
    <section className="wf" data-id="E">
      <MeshGradient
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

      <SiteNav showCart />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "160px 6vw 100px",
          maxWidth: 1280,
          margin: "0 auto",
          color: WINE,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            fontFamily: MONO,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            fontSize: 11,
            color: DEEP,
            marginBottom: 14,
          }}
        >
          Checkout
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: "clamp(40px, 5.4vw, 76px)",
            lineHeight: 1.04,
            letterSpacing: "-0.012em",
            color: WINE,
            margin: "0 0 56px",
            maxWidth: 880,
          }}
        >
          <ItalicHeadline text="Almost there." italicWord="there." />
        </motion.h1>

        <div
          className="checkout-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 56,
            alignItems: "flex-start",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
            style={glassPanel}
          >
            <StepIndicator current={step} />

            {submitError ? (
              <div
                role="alert"
                style={{
                  marginBottom: 24,
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: `1px solid ${ERROR_RED}`,
                  background: "rgba(168,58,58,0.08)",
                  color: ERROR_RED,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 15,
                }}
              >
                {submitError}
              </div>
            ) : null}

            {step === 1 && (
              <>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(28px, 3.4vw, 44px)",
                    lineHeight: 1.1,
                    margin: "0 0 32px",
                    color: WINE,
                  }}
                >
                  How can we{" "}
                  <em style={{ color: DEEP, fontStyle: "italic" }}>
                    reach you?
                  </em>
                </h2>
                <Field
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Field
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={setField("firstName")}
                    onBlur={blurField("firstName")}
                    error={errors.firstName}
                    autoComplete="given-name"
                    required
                  />
                  <Field
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
                <Field
                  label="Phone (optional)"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={setField("phone")}
                  onBlur={blurField("phone")}
                  error={errors.phone}
                  autoComplete="tel"
                  placeholder="+1 (___) ___-____"
                />
                <div style={{ marginTop: 32 }}>
                  <ContinueButton label="Continue" onClick={advance} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(28px, 3.4vw, 44px)",
                    lineHeight: 1.1,
                    margin: "0 0 32px",
                    color: WINE,
                  }}
                >
                  Where should we{" "}
                  <em style={{ color: DEEP, fontStyle: "italic" }}>send it?</em>
                </h2>
                <Field
                  label="Address line 1"
                  name="line1"
                  value={form.line1}
                  onChange={setField("line1")}
                  onBlur={blurField("line1")}
                  error={errors.line1}
                  autoComplete="address-line1"
                  required
                />
                <Field
                  label="Address line 2 (optional)"
                  name="line2"
                  value={form.line2}
                  onChange={setField("line2")}
                  onBlur={blurField("line2")}
                  error={errors.line2}
                  autoComplete="address-line2"
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={setField("city")}
                    onBlur={blurField("city")}
                    error={errors.city}
                    autoComplete="address-level2"
                    required
                  />
                  <StateSelect
                    value={form.state}
                    onChange={setField("state")}
                    onBlur={blurField("state")}
                    error={errors.state}
                  />
                  <Field
                    label="ZIP"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={setField("postalCode")}
                    onBlur={blurField("postalCode")}
                    error={errors.postalCode}
                    autoComplete="postal-code"
                    placeholder="90210"
                    required
                  />
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    fontSize: 10,
                    color: "rgba(74,28,38,0.55)",
                    marginTop: 4,
                    marginBottom: 32,
                  }}
                >
                  We ship to the United States only.
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={goBack}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: DEEP,
                      fontFamily: MONO,
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      fontSize: 11,
                      cursor: "pointer",
                      padding: "12px 0",
                    }}
                  >
                    ← Back
                  </button>
                  <ContinueButton label="Continue" onClick={advance} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(28px, 3.4vw, 44px)",
                    lineHeight: 1.1,
                    margin: "0 0 32px",
                    color: WINE,
                  }}
                >
                  Look it{" "}
                  <em style={{ color: DEEP, fontStyle: "italic" }}>over.</em>
                </h2>

                <div style={{ marginBottom: 32 }}>
                  <div style={labelStyle}>Contact</div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      lineHeight: 1.5,
                      color: WINE,
                    }}
                  >
                    {form.firstName} {form.lastName}
                    <br />
                    {form.email}
                    {form.phone ? (
                      <>
                        <br />
                        {form.phone}
                      </>
                    ) : null}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={labelStyle}>Shipping to</div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      lineHeight: 1.5,
                      color: WINE,
                    }}
                  >
                    {form.line1}
                    {form.line2 ? (
                      <>
                        <br />
                        {form.line2}
                      </>
                    ) : null}
                    <br />
                    {form.city}, {form.state} {form.postalCode}
                    <br />
                    {form.country}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={labelStyle}>Items</div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      fontFamily: SERIF,
                      fontSize: 18,
                      lineHeight: 1.5,
                      color: WINE,
                    }}
                  >
                    {lines.map((l) => (
                      <li
                        key={l.productSlug}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          padding: "6px 0",
                        }}
                      >
                        <span>
                          {l.name}{" "}
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 12,
                              color: "rgba(74,28,38,0.6)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            × {l.quantity}
                          </span>
                        </span>
                        <span
                          style={{
                            fontStyle: "italic",
                            color: DEEP,
                          }}
                        >
                          {formatMoney(l.price * l.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: DEEP,
                    background: "rgba(217,155,161,0.18)",
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1px solid ${ROSE}`,
                    margin: "0 0 28px",
                  }}
                >
                  Heads up: our online payment processor is being finalized.
                  We&apos;ll save your order, then reach out within 24 hours to
                  confirm and arrange payment by phone.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={submitting}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: DEEP,
                      fontFamily: MONO,
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      fontSize: 11,
                      cursor: submitting ? "not-allowed" : "pointer",
                      padding: "12px 0",
                      opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    ← Back
                  </button>
                  <ContinueButton
                    label={submitting ? "Placing order…" : "Place order"}
                    onClick={submit}
                    disabled={submitting || lines.length === 0}
                  />
                </div>
              </>
            )}
          </motion.div>

          <OrderSummary
            lines={lines}
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>

      <SiteFooter />

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.checkout-grid) {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          :global(.checkout-grid > aside) {
            position: static !important;
            order: -1;
          }
        }
      `}</style>
    </section>
  );
}

function OrderSummary({
  lines,
  subtotal,
  tax,
  shipping,
  total,
}: {
  lines: ReturnType<typeof useCartStore.getState>["lines"];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.65, delay: 0.24, ease: EASE }}
      style={{
        ...glassPanel,
        position: "sticky",
        top: 120,
        padding: 32,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          fontSize: 11,
          color: DEEP,
          marginBottom: 20,
        }}
      >
        Your order
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {lines.length === 0 ? (
          <li
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              color: "rgba(74,28,38,0.6)",
            }}
          >
            Your cart is empty.
          </li>
        ) : (
          lines.map((l) => (
            <li
              key={l.productSlug}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "rgba(74,28,38,0.85)",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={l.image}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1.25,
                    color: WINE,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={l.name}
                >
                  {l.name}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "rgba(74,28,38,0.6)",
                    marginTop: 2,
                  }}
                >
                  Qty {l.quantity} × {formatMoney(l.price)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 18,
                  color: DEEP,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {formatMoney(l.price * l.quantity)}
              </div>
            </li>
          ))
        )}
      </ul>

      <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />
      <SummaryRow label="Tax (est.)" value={formatMoney(tax)} muted />
      <SummaryRow
        label="Shipping (est.)"
        value={shipping === 0 ? "FREE" : formatMoney(shipping)}
        muted
      />

      <div
        style={{
          height: 1,
          background: ROSE,
          opacity: 0.6,
          margin: "16px 0 14px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontSize: 11,
            color: WINE,
          }}
        >
          Total
        </span>
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 28,
            color: WINE,
          }}
        >
          {formatMoney(total)}
        </span>
      </div>

      <div
        style={{
          marginTop: 18,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 13,
          color: "rgba(74,28,38,0.6)",
          lineHeight: 1.45,
        }}
      >
        Tax + shipping calculated on order confirmation.
      </div>
    </motion.aside>
  );
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "6px 0",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontSize: 10,
          color: muted ? "rgba(74,28,38,0.55)" : WINE,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 16,
          color: muted ? "rgba(74,28,38,0.7)" : WINE,
        }}
      >
        {value}
      </span>
    </div>
  );
}
