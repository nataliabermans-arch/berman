"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/concierge/types";
import { COLORS, Card, Eyebrow, PageTitle, shortDate } from "../_shared";
import { LeadStatusPill, type LeadStatus } from "./_pill";

type StatusFilter = "all" | LeadStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
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

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`;
}

export default function LeadsListPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/admin/leads?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load leads");
        const json = (await res.json()) as { leads: Lead[] };
        if (!cancelled) {
          setLeads(json.leads ?? []);
          setLoading(false);
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
  }, [statusFilter]);

  const total = useMemo(() => leads?.length ?? 0, [leads]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <header>
        <Eyebrow>Concierge captures</Eyebrow>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.85rem",
            flexWrap: "wrap",
          }}
        >
          <PageTitle>Leads</PageTitle>
          <span
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: COLORS.creamMuted,
            }}
          >
            ({total} total)
          </span>
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            color: COLORS.creamMuted,
            fontSize: "0.9rem",
          }}
        >
          {loading
            ? "Loading…"
            : `${total} ${total === 1 ? "lead" : "leads"} shown${
                statusFilter === "all" ? "" : ` · filter: ${statusFilter}`
              }`}
        </div>
      </header>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <label
          htmlFor="status-filter"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: COLORS.creamMuted,
          }}
        >
          Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            background: COLORS.wineDeep,
            color: COLORS.cream,
            border: `1px solid ${COLORS.wineLine}`,
            borderRadius: "6px",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <Card>
          <div style={{ color: COLORS.roseSoft }}>Failed to load: {error}</div>
        </Card>
      ) : null}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <SkeletonRows />
        ) : !leads || leads.length === 0 ? (
          <div style={{ padding: "1.6rem 1.4rem", color: COLORS.creamFaint }}>
            No leads yet. They&apos;ll appear here as the concierge captures
            them.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.wineLine}` }}>
                  <Th>Lead ID</Th>
                  <Th>Date</Th>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Specialty</Th>
                  <Th>Visit</Th>
                  <Th>Summary</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const sp = specialtyStyle(lead.recommendedSpecialty);
                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.wineLine}`,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        window.location.href = `/admin/leads/${lead.id}`;
                      }}
                    >
                      <Td>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: COLORS.cream,
                            textDecoration: "none",
                            fontFamily: "var(--font-dm-mono), monospace",
                            fontSize: "0.78rem",
                          }}
                        >
                          {lead.id}
                        </Link>
                      </Td>
                      <Td>
                        <span
                          style={{
                            fontFamily: "var(--font-cormorant), serif",
                            fontStyle: "italic",
                            fontSize: "1rem",
                          }}
                        >
                          {shortDate(lead.createdAt)}
                        </span>
                      </Td>
                      <Td>
                        <span
                          style={{ color: COLORS.cream, fontSize: "0.9rem" }}
                        >
                          {lead.firstName} {lead.lastName}
                        </span>
                      </Td>
                      <Td>
                        <div
                          style={{
                            color: COLORS.creamMuted,
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-dm-mono), monospace",
                          }}
                        >
                          {lead.email}
                        </div>
                        <div
                          style={{
                            color: COLORS.creamFaint,
                            fontSize: "0.72rem",
                            fontFamily: "var(--font-dm-mono), monospace",
                          }}
                        >
                          {lead.phone}
                        </div>
                      </Td>
                      <Td>
                        {lead.recommendedSpecialty ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.22rem 0.55rem",
                              borderRadius: "4px",
                              background: sp.bg,
                              color: sp.color,
                              fontFamily: "var(--font-dm-mono), monospace",
                              fontSize: "0.6rem",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {lead.recommendedSpecialty}
                          </span>
                        ) : (
                          <span style={{ color: COLORS.creamFaint }}>—</span>
                        )}
                      </Td>
                      <Td>
                        <span
                          style={{
                            color: COLORS.creamMuted,
                            fontSize: "0.8rem",
                          }}
                        >
                          {visitTypeLabel(lead.visitTypePreference)}
                        </span>
                      </Td>
                      <Td>
                        <span
                          style={{
                            fontFamily: "var(--font-cormorant), serif",
                            fontStyle: "italic",
                            fontSize: "0.95rem",
                            color: COLORS.creamMuted,
                            display: "block",
                            maxWidth: "320px",
                            lineHeight: 1.4,
                          }}
                        >
                          {truncate(lead.conversationSummary ?? "", 120)}
                        </span>
                      </Td>
                      <Td>
                        <LeadStatusPill status={lead.status} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ padding: "0.5rem 0" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1.4fr 1fr 0.8fr 2fr 0.8fr",
            gap: "1rem",
            padding: "1rem 1.4rem",
            borderBottom: `1px solid ${COLORS.wineLine}`,
          }}
        >
          {Array.from({ length: 8 }).map((__, j) => (
            <div
              key={j}
              style={{
                height: "0.85rem",
                borderRadius: "4px",
                background:
                  "linear-gradient(90deg, rgba(255,245,241,0.04), rgba(255,245,241,0.10), rgba(255,245,241,0.04))",
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: "0.85rem 1.4rem",
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: COLORS.creamFaint,
        fontWeight: 400,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "0.9rem 1.4rem",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}
