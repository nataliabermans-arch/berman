"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OrderListItem, OrderStatus } from "@/lib/commerce/types";
import {
  COLORS,
  Card,
  Eyebrow,
  PageTitle,
  StatusPill,
  shortDate,
} from "../_shared";

const STATUS_OPTIONS: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "awaiting_stripe_setup", label: "Awaiting Stripe Setup" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<OrderListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        const json = (await res.json()) as { orders: OrderListItem[] };
        if (!cancelled) {
          setOrders(json.orders ?? []);
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

  const total = useMemo(() => orders?.length ?? 0, [orders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <header>
        <Eyebrow>All orders</Eyebrow>
        <PageTitle>Orders</PageTitle>
        <div
          style={{
            marginTop: "0.5rem",
            color: COLORS.creamMuted,
            fontSize: "0.9rem",
          }}
        >
          {loading
            ? "Loading…"
            : `${total} ${total === 1 ? "order" : "orders"} shown${
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
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | OrderStatus)
          }
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
          <div style={{ padding: "1.25rem 1.4rem", color: COLORS.creamFaint }}>
            Loading orders…
          </div>
        ) : !orders || orders.length === 0 ? (
          <div style={{ padding: "1.25rem 1.4rem", color: COLORS.creamFaint }}>
            No orders match this filter.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.wineLine}` }}>
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
                    style={{ borderBottom: `1px solid ${COLORS.wineLine}` }}
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
                      <div
                        style={{
                          color: COLORS.creamFaint,
                          fontSize: "0.75rem",
                        }}
                      >
                        {o.customerEmail}
                      </div>
                    </Td>
                    <Td align="right">
                      <span style={{ color: COLORS.creamMuted }}>
                        {o.itemCount}
                      </span>
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
        )}
      </Card>
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
