"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GrainGradient } from "@paper-design/shaders-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BorderBeam } from "@/components/ui/border-beam";
import { useConciergeStore } from "@/lib/concierge/store";
import type { ChatMessage } from "@/lib/concierge/types";

const PALETTE = {
  cream: "#fff5f1",
  wine: "#4a1c26",
  rose: "#d99ba1",
  accent: "#8a3a44",
  lightRose: "#f4a3aa",
  maroon: "#1a0a10",
} as const;

const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_MONO = "'DM Mono', ui-monospace, SFMono-Regular, monospace";

export default function ConciergeModal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isOpen = useConciergeStore((s) => s.isOpen);
  const close = useConciergeStore((s) => s.close);
  const messages = useConciergeStore((s) => s.messages);
  const toolEvents = useConciergeStore((s) => s.toolEvents);
  const status = useConciergeStore((s) => s.status);
  const send = useConciergeStore((s) => s.send);
  const errorMessage = useConciergeStore((s) => s.errorMessage);
  const visitorFirstName = useConciergeStore((s) => s.visitorFirstName);

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useLayoutEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, toolEvents.length, status]);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => textareaRef.current?.focus(), 320);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const isOffline = status === "offline";
  const isBusy = status === "sending" || status === "streaming";
  const showTypingIndicator = status === "sending";

  const headerTitle = useMemo(() => {
    if (visitorFirstName) return `Hi, ${visitorFirstName}`;
    return "Berman Wellness Concierge";
  }, [visitorFirstName]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (isBusy || isOffline) return;
    const value = draft.trim();
    if (!value) return;
    setDraft("");
    void send(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="concierge-backdrop"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(26,10,16,0.7)",
              zIndex: 299,
              cursor: "pointer",
            }}
            aria-hidden="true"
          />
          <motion.aside
            key="concierge-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Berman Wellness Concierge"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0.2 }
                : { type: "spring", stiffness: 300, damping: 30, mass: 1 }
            }
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100dvh",
              width: "min(720px, 100vw)",
              background: PALETTE.wine,
              color: PALETTE.cream,
              zIndex: 300,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-32px 0 80px rgba(0,0,0,0.55)",
            }}
          >
            <GrainGradient
              colors={["#a13a48", "#6a2230", "#1a0a10"]}
              colorBack="#1a0a10"
              shape="sphere"
              speed={1.4}
              scale={0.55}
              noise={0.5}
              softness={0.7}
              intensity={0.35}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                pointerEvents: "none",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Header title={headerTitle} onClose={close} />
              <MessageList
                listRef={listRef}
                messages={messages}
                toolEvents={toolEvents}
                showTypingIndicator={showTypingIndicator}
              />
              {errorMessage && status === "error" && (
                <div
                  role="alert"
                  style={{
                    margin: "0 28px 8px",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(244,163,170,0.35)",
                    background: "rgba(138,58,68,0.35)",
                    color: PALETTE.cream,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {errorMessage}
                </div>
              )}
              {isOffline ? (
                <OfflineFooter />
              ) : (
                <Composer
                  value={draft}
                  onChange={setDraft}
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                  textareaRef={textareaRef}
                  disabled={isBusy}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <header
      style={{
        padding: "26px 28px 18px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        borderBottom: "1px solid rgba(244,163,170,0.18)",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,245,241,0.6)",
          }}
        >
          Concierge
        </p>
        <h2
          style={{
            margin: "6px 0 0",
            fontFamily: FONT_SERIF,
            fontSize: 32,
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.1,
            color: PALETTE.cream,
          }}
        >
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close concierge"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "transparent",
          border: "1px solid rgba(217,155,161,0.4)",
          color: PALETTE.cream,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </header>
  );
}

interface ToolEventLite {
  id: string;
  name: string;
  result: unknown;
}

function MessageList({
  listRef,
  messages,
  toolEvents,
  showTypingIndicator,
}: {
  listRef: MutableRefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  toolEvents: ToolEventLite[];
  showTypingIndicator: boolean;
}) {
  return (
    <div
      ref={listRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px 28px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {toolEvents.map((t) => (
        <ToolPill key={t.id} event={t} />
      ))}
      {showTypingIndicator && <TypingDots />}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          padding: "12px 18px",
          borderRadius: 24,
          borderBottomRightRadius: 6,
          background: "rgba(255,245,241,0.95)",
          color: PALETTE.wine,
          fontFamily: FONT_SERIF,
          fontSize: 17,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    );
  }
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        padding: "10px 16px",
        borderRadius: 18,
        background: "rgba(244,163,170,0.10)",
        color: PALETTE.cream,
        fontFamily: FONT_SERIF,
        fontSize: 18,
        lineHeight: 1.55,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          em: ({ children }) => (
            <em style={{ color: PALETTE.lightRose, fontStyle: "italic" }}>
              {children}
            </em>
          ),
          strong: ({ children }) => (
            <strong style={{ color: PALETTE.cream, fontWeight: 600 }}>
              {children}
            </strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              style={{
                color: PALETTE.lightRose,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p style={{ margin: "0 0 8px" }}>{children}</p>,
          ul: ({ children }) => (
            <ul style={{ margin: "4px 0 8px", paddingLeft: 18 }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "4px 0 8px", paddingLeft: 18 }}>{children}</ol>
          ),
          li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
        }}
      >
        {message.content || "​"}
      </ReactMarkdown>
    </div>
  );
}

function ToolPill({ event }: { event: ToolEventLite }) {
  const result = event.result as { id?: string; leadId?: string } | undefined;
  const id = result?.id || result?.leadId;
  const label =
    event.name === "save_lead"
      ? `Lead saved${id ? ` · ID: ${id}` : ""}`
      : `${event.name} complete`;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid rgba(244,163,170,0.4)",
        background: "rgba(138,58,68,0.35)",
        color: PALETTE.lightRose,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      ✓ {label}
    </div>
  );
}

function TypingDots() {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        gap: 6,
        padding: "12px 16px",
        borderRadius: 18,
        background: "rgba(244,163,170,0.10)",
      }}
      aria-label="Concierge is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.25, y: 0 }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: PALETTE.lightRose,
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  textareaRef,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e?: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <form
      onSubmit={onSubmit}
      style={{
        position: "sticky",
        bottom: 0,
        padding: "14px 28px 24px",
        background: "rgba(26,10,16,0.55)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(244,163,170,0.22)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,245,241,0.55)",
        }}
      >
        Concierge · powered by Dr. Berman&apos;s clinical playbook
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Tell me what you're experiencing…"
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            minHeight: 52,
            maxHeight: 180,
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(255,245,241,0.12)",
            color: PALETTE.cream,
            border: `1px solid ${focused ? PALETTE.rose : "rgba(244,163,170,0.4)"}`,
            outline: "none",
            boxShadow: focused ? `0 0 0 3px rgba(217,117,128,0.25)` : "none",
            fontFamily: FONT_SERIF,
            fontSize: 17,
            lineHeight: 1.4,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
        <SendButton disabled={disabled || !value.trim()} />
      </div>
    </form>
  );
}

function SendButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label="Send message"
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 22px",
        borderRadius: 999,
        background: PALETTE.wine,
        color: PALETTE.cream,
        border: "1px solid rgba(244,163,170,0.3)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: FONT_MONO,
        fontSize: 12,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity: disabled ? 0.55 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>Send →</span>
      <BorderBeam
        size={80}
        duration={8}
        colorFrom="#f4a3aa"
        colorTo="#d97580"
        borderWidth={1.5}
      />
    </button>
  );
}

function OfflineFooter() {
  return (
    <div
      style={{
        padding: "20px 28px 28px",
        background: "rgba(26,10,16,0.55)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(244,163,170,0.22)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT_SERIF,
          fontSize: 19,
          fontStyle: "italic",
          color: PALETTE.cream,
        }}
      >
        The concierge is <em style={{ color: PALETTE.lightRose }}>offline</em>{" "}
        right now.
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,245,241,0.65)",
        }}
      >
        Leave your details on the contact form and we&apos;ll reach out.
      </p>
      <a
        href="/contact/"
        data-lead-open
        data-cta="open-form"
        style={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: 10,
          padding: "14px 22px",
          borderRadius: 999,
          background: PALETTE.wine,
          color: PALETTE.cream,
          textDecoration: "none",
          border: "1px solid rgba(244,163,170,0.3)",
          fontFamily: FONT_MONO,
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ position: "relative", zIndex: 2 }}>
          Go to contact form →
        </span>
        <BorderBeam
          size={80}
          duration={8}
          colorFrom="#f4a3aa"
          colorTo="#d97580"
          borderWidth={1.5}
        />
      </a>
    </div>
  );
}
