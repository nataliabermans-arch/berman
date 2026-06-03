"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { OrderListItem, SalesStats } from "@/lib/commerce/types";
import {
  COLORS,
  Card,
  Eyebrow,
  Money,
  PageTitle,
  StatusPill,
  shortDate,
} from "./_shared";

interface Loaded {
  stats: SalesStats | null;
  orders: OrderListItem[] | null;
  loading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<Loaded>({
    stats: null,
    orders: null,
    loading: true,
    error: null,
  });
  const [setupRunning, setSetupRunning] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setData((d) => ({ ...d, loading: true, error: null }));
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/orders?limit=10", { cache: "no-store" }),
      ]);
      if (!statsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to load dashboard");
      }
      const stats = (await statsRes.json()) as SalesStats;
      const ordersJson = (await ordersRes.json()) as {
        orders: OrderListItem[];
      };
      setData({
        stats,
        orders: ordersJson.orders ?? [],
        loading: false,
        error: null,
      });
    } catch (err) {
      setData({
        stats: null,
        orders: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runSetup() {
    setSetupRunning(true);
    setSetupMessage(null);
    try {
      const res = await fetch("/api/admin/init", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setSetupMessage(json.error ?? "Setup failed");
      } else {
        setSetupMessage("Schema applied — refreshing…");
        await load();
      }
    } catch {
      setSetupMessage("Network error during setup");
    } finally {
      setSetupRunning(false);
    }
  }

  const isAllZero =
    data.stats &&
    data.stats.allTime.orders === 0 &&
    data.stats.last7Days.orders === 0 &&
    data.stats.last30Days.orders === 0 &&
    data.stats.today.orders === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <Eyebrow>Dashboard</Eyebrow>
        <PageTitle>Welcome back.</PageTitle>
      </header>

      {isAllZero ? (
        <div
          style={{
            background: "rgba(180, 130, 90, 0.14)",
            border: "1px solid rgba(217, 155, 161, 0.4)",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontStyle: "italic",
                fontSize: "1.15rem",
              }}
            >
              Database may not be provisioned.
            </div>
            <div
              style={{
                color: COLORS.creamMuted,
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Click below to apply the schema. Safe to run multiple times.
            </div>
            {setupMessage ? (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                  color: COLORS.roseSoft,
                }}
              >
                {setupMessage}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={runSetup}
            disabled={setupRunning}
            style={{
              padding: "0.65rem 1rem",
              background: COLORS.wineDeep,
              border: `1px solid ${COLORS.rose}`,
              borderRadius: "6px",
              color: COLORS.cream,
              cursor: setupRunning ? "wait" : "pointer",
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: setupRunning ? 0.6 : 1,
            }}
          >
            {setupRunning ? "Running…" : "Run setup"}
          </button>
        </div>
      ) : null}

      {data.error ? (
        <Card>
          <div style={{ color: COLORS.roseSoft }}>
            Failed to load: {data.error}
          </div>
        </Card>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {data.loading || !data.stats ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <StatCard label="Today" stat={data.stats.today} />
            <StatCard label="7 days" stat={data.stats.last7Days} />
            <StatCard label="30 days" stat={data.stats.last30Days} />
            <StatCard label="All time" stat={data.stats.allTime} />
          </>
        )}
      </section>

      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <Card>
          <Eyebrow>Top products</Eyebrow>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {data.loading ? (
              <div style={{ color: COLORS.creamFaint }}>Loading…</div>
            ) : !data.stats?.topProducts.length ? (
              <div style={{ color: COLORS.creamFaint, fontSize: "0.9rem" }}>
                No sales yet.
              </div>
            ) : (
              data.stats.topProducts.slice(0, 5).map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "1rem",
                    paddingBottom: "0.6rem",
                    borderBottom: `1px solid ${COLORS.wineLine}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: COLORS.cream,
                        fontSize: "0.95rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        color: COLORS.creamFaint,
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-dm-mono), monospace",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {p.unitsSold} sold
                    </div>
                  </div>
                  <div style={{ color: COLORS.cream, fontSize: "1.05rem" }}>
                    <Money value={p.revenue} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <Eyebrow>Quick stats</Eyebrow>
          <div
            style={{
              marginTop: "1rem",
              color: COLORS.creamMuted,
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            View all orders in the Orders tab. Use status filters to triage
            incoming sales.
          </div>
          <div style={{ marginTop: "1.25rem" }}>
            <Link
              href="/admin/orders"
              style={{
                display: "inline-block",
                padding: "0.55rem 0.9rem",
                background: "transparent",
                border: `1px solid ${COLORS.rose}`,
                borderRadius: "6px",
                color: COLORS.cream,
                textDecoration: "none",
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              View all orders →
            </Link>
          </div>
        </Card>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.75rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "1.5rem",
              margin: 0,
              color: COLORS.cream,
            }}
          >
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            style={{
              color: COLORS.rose,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontFamily: "var(--font-dm-mono), monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            See all →
          </Link>
        </div>
        <Card style={{ padding: 0 }}>
          <OrdersTable orders={data.orders} loading={data.loading} />
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  stat,
}: {
  label: string;
  stat: { orders: number; revenue: number };
}) {
  return (
    <Card>
      <Eyebrow>{label}</Eyebrow>
      <div
        style={{
          marginTop: "0.5rem",
          fontFamily: "var(--font-cormorant), serif",
          fontStyle: "italic",
          fontSize: "2.1rem",
          color: COLORS.cream,
          lineHeight: 1.1,
        }}
      >
        {`$${stat.revenue.toFixed(2)}`}
      </div>
      <div
        style={{
          marginTop: "0.4rem",
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.14em",
          color: COLORS.creamMuted,
          textTransform: "uppercase",
        }}
      >
        {stat.orders} {stat.orders === 1 ? "order" : "orders"}
      </div>
    </Card>
  );
}

function SkeletonStat() {
  return (
    <Card>
      <div
        style={{
          height: "0.6rem",
          width: "40%",
          background: "rgba(217, 155, 161, 0.14)",
          borderRadius: "3px",
        }}
      />
      <div
        style={{
          height: "1.6rem",
          width: "70%",
          background: "rgba(217, 155, 161, 0.12)",
          borderRadius: "4px",
          marginTop: "0.7rem",
        }}
      />
      <div
        style={{
          height: "0.6rem",
          width: "30%",
          background: "rgba(217, 155, 161, 0.1)",
          borderRadius: "3px",
          marginTop: "0.6rem",
        }}
      />
    </Card>
  );
}

function OrdersTable({
  orders,
  loading,
}: {
  orders: OrderListItem[] | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{ padding: "1.25rem 1.4rem", color: COLORS.creamFaint }}>
        Loading orders…
      </div>
    );
  }
  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: "1.25rem 1.4rem", color: COLORS.creamFaint }}>
        No orders yet.
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              borderBottom: `1px solid ${COLORS.wineLine}`,
            }}
          >
            <Th>Order</Th>
            <Th>Date</Th>
            <Th>Customer</Th>
            <Th align="right">Items</Th>
            <Th align="right">Total</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{
                borderBottom: `1px solid ${COLORS.wineLine}`,
              }}
            >
              <Td>
                <Link
                  href={`/admin/orders/${o.id}`}
                  style={{
                    color: COLORS.cream,
                    textDecoration: "none",
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: "0.78rem",
                  }}
                >
                  {o.id}
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
                  {shortDate(o.createdAt)}
                </span>
              </Td>
              <Td>
                <div style={{ color: COLORS.cream, fontSize: "0.9rem" }}>
                  {o.customerName}
                </div>
                <div style={{ color: COLORS.creamFaint, fontSize: "0.75rem" }}>
                  {o.customerEmail}
                </div>
              </Td>
              <Td align="right">
                <span style={{ color: COLORS.creamMuted }}>{o.itemCount}</span>
              </Td>
              <Td align="right">
                <span
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontStyle: "italic",
                    fontSize: "1.05rem",
                  }}
                >
                  {`$${o.total.toFixed(2)}`}
                </span>
              </Td>
              <Td>
                <StatusPill status={o.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
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
