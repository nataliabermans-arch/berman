"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ChatMessage, Lead } from "@/lib/concierge/types";
import { COLORS, Card, Eyebrow, PageTitle, formatDate } from "../../_shared";
import { LeadStatusPill } from "../_pill";

type LeadStatus = Lead["status"];

const STATUS_ACTIONS: Array<{ status: LeadStatus; label: string }> = [
  { status: "contacted", label: "Mark as contacted" },
  { status: "booked", label: "Mark as booked" },
  { status: "closed", label: "Mark as closed" },
];

const SPECIALTY_PALETTE: Array<{ bg: string; color: string }> = [
  { bg: "rgba(217, 155, 161, 0.22)", color: "#fff5f1" },
  { bg: "rgba(180, 130, 90, 0.22)", color: "#e8c8a8" },
  { bg: "rgba(150, 200, 160, 0.22)", color: "#cfeacd" },
  { bg: "rgba(150, 170, 220, 0.22)", color: "#cfd8f4" },
  { bg: "rgba(220, 180, 130, 0.22)", color: "#f0d9b0" },
  { bg: "rgba(200, 150, 200, 0.22)", color: "#ecd0ec" },
];

function specialtyStyle(specialty: string | undefined) {
  if (!specialty)
    return { bg: "rgba(255, 245, 241, 0.06)", color: COLORS.creamFaint };
  let h = 0;
  for (let i = 0; i < specialty.length; i++) {
    h = (h * 31 + specialty.charCodeAt(i)) >>> 0;
  }
  return SPECIALTY_PALETTE[h % SPECIALTY_PALETTE.length];
}

function visitTypeLabel(v?: Lead["visitTypePreference"]) {
  if (!v) return "—";
  if (v === "in_person") return "In person";
  if (v === "telehealth") return "Telehealth";
  return "Either";
}

function timeOf(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/leads/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) throw new Error("Lead not found");
        if (!res.ok) throw new Error("Failed to load lead");
        const json = (await res.json()) as {
          lead: Lead;
          transcript: ChatMessage[];
        };
        if (!cancelled) {
          setLead(json.lead);
          setTranscript(json.transcript ?? []);
          setLoading(false);
          if (typeof window !== "undefined") window.scrollTo(0, 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Link
          href="/admin/leads"
          style={{
            color: COLORS.rose,
            textDecoration: "none",
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ← All leads
        </Link>
      </div>

      {loading ? (
        <Card>
          <div style={{ color: COLORS.creamFaint }}>Loading lead…</div>
        </Card>
      ) : error ? (
        <Card>
          <div style={{ color: COLORS.roseSoft }}>{error}</div>
        </Card>
      ) : !lead ? (
        <Card>
          <div style={{ color: COLORS.creamFaint }}>Lead not found.</div>
        </Card>
      ) : (
        <LeadView lead={lead} transcript={transcript} />
      )}
    </div>
  );
}

function LeadView({
  lead,
  transcript,
}: {
  lead: Lead;
  transcript: ChatMessage[];
}) {
  const sp = specialtyStyle(lead.recommendedSpecialty);
  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>Lead detail</Eyebrow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
            }}
          >
            <PageTitle>Lead {lead.id}</PageTitle>
            <LeadStatusPill status={lead.status} />
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              color: COLORS.creamMuted,
              fontSize: "0.85rem",
            }}
          >
            {formatDate(lead.createdAt)}
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.66fr) minmax(0, 1fr)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <Eyebrow>Lead</Eyebrow>
              <LeadStatusPill status={lead.status} />
            </div>
            <div
              style={{
                marginTop: "0.6rem",
                fontFamily: "var(--font-cormorant), serif",
                fontStyle: "italic",
                fontSize: "2rem",
                lineHeight: 1.1,
                color: COLORS.cream,
              }}
            >
              {lead.firstName} {lead.lastName}
            </div>

            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <a
                href={`mailto:${lead.email}`}
                style={{
                  color: COLORS.cream,
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.82rem",
                  borderBottom: `1px solid ${COLORS.wineLine}`,
                  paddingBottom: "0.15rem",
                  width: "fit-content",
                }}
              >
                {lead.email}
              </a>
              <a
                href={`tel:${lead.phone}`}
                style={{
                  color: COLORS.creamMuted,
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.82rem",
                  width: "fit-content",
                }}
              >
                {lead.phone}
              </a>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {lead.recommendedSpecialty ? (
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.28rem 0.6rem",
                    borderRadius: "4px",
                    background: sp.bg,
                    color: sp.color,
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {lead.recommendedSpecialty}
                </span>
              ) : null}
              <span
                style={{
                  color: COLORS.creamMuted,
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Visit · {visitTypeLabel(lead.visitTypePreference)}
              </span>
            </div>

            {lead.conversationSummary ? (
              <div style={{ marginTop: "1.1rem" }}>
                <Eyebrow>Summary</Eyebrow>
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontFamily: "var(--font-cormorant), serif",
                    fontStyle: "italic",
                    fontSize: "1.05rem",
                    lineHeight: 1.55,
                    color: COLORS.cream,
                  }}
                >
                  {lead.conversationSummary}
                </p>
              </div>
            ) : null}

            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1rem",
                borderTop: `1px solid ${COLORS.wineLine}`,
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.creamFaint,
              }}
            >
              Created {formatDate(lead.createdAt)}
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {STATUS_ACTIONS.map((a) => (
                <button
                  key={a.status}
                  type="button"
                  disabled
                  title="Status updates wired in next sprint"
                  style={{
                    padding: "0.55rem 0.9rem",
                    background: "transparent",
                    border: `1px solid ${COLORS.wineLine}`,
                    borderRadius: "6px",
                    color: COLORS.creamFaint,
                    cursor: "not-allowed",
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    textAlign: "left",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow>Metadata</Eyebrow>
            <dl
              style={{
                marginTop: "0.6rem",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                rowGap: "0.4rem",
                columnGap: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <dt style={{ color: COLORS.creamFaint }}>Lead ID</dt>
              <dd
                style={{
                  color: COLORS.cream,
                  margin: 0,
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.78rem",
                  wordBreak: "break-all",
                }}
              >
                {lead.id}
              </dd>
              <dt style={{ color: COLORS.creamFaint }}>Conversation</dt>
              <dd
                style={{
                  color: COLORS.cream,
                  margin: 0,
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.78rem",
                  wordBreak: "break-all",
                }}
              >
                {lead.conversationId}
              </dd>
            </dl>
          </Card>
        </div>

        <Card style={{ padding: 0 }}>
          <div
            style={{
              padding: "1.1rem 1.4rem",
              borderBottom: `1px solid ${COLORS.wineLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <Eyebrow>Conversation</Eyebrow>
            <span
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: COLORS.creamFaint,
              }}
            >
              {transcript.length}{" "}
              {transcript.length === 1 ? "message" : "messages"}
            </span>
          </div>

          <div
            style={{
              padding: "1.25rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {transcript.length === 0 ? (
              <div style={{ color: COLORS.creamFaint }}>
                No transcript available for this lead.
              </div>
            ) : (
              transcript.map((m, i) => (
                <MessageBubble key={m.id ?? i} message={m} />
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  if (isSystem) {
    return (
      <div
        style={{
          alignSelf: "center",
          maxWidth: "85%",
          padding: "0.55rem 0.85rem",
          borderRadius: "6px",
          border: `1px dashed ${COLORS.wineLine}`,
          background: "transparent",
          color: COLORS.creamFaint,
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "0.25rem", textTransform: "uppercase" }}>
          System
        </div>
        <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
        {message.createdAt ? (
          <div style={{ marginTop: "0.35rem", color: COLORS.creamFaint }}>
            {timeOf(message.createdAt)}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "0.75rem 1rem",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background: isUser
            ? "rgba(255, 245, 241, 0.92)"
            : "rgba(217, 155, 161, 0.10)",
          color: isUser ? COLORS.wineDeep : COLORS.cream,
          border: isUser
            ? "1px solid rgba(255, 245, 241, 0.6)"
            : `1px solid ${COLORS.wineLine}`,
          fontSize: "0.95rem",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: isUser
            ? "var(--font-dm-mono), monospace"
            : "var(--font-cormorant), serif",
          fontStyle: isUser ? "normal" : "normal",
        }}
      >
        {message.content}
      </div>
      <div
        style={{
          marginTop: "0.3rem",
          color: COLORS.creamFaint,
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {isUser ? "Visitor" : "Concierge"}
        {message.createdAt ? ` · ${timeOf(message.createdAt)}` : ""}
      </div>
    </div>
  );
}
