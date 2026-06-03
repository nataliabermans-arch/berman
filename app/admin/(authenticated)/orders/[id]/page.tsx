"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/commerce/types";
import {
  COLORS,
  Card,
  Eyebrow,
  Money,
  PageTitle,
  StatusPill,
  formatDate,
} from "../../_shared";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/orders/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) throw new Error("Order not found");
        if (!res.ok) throw new Error("Failed to load order");
        const json = (await res.json()) as { order: Order };
        if (!cancelled) {
          setOrder(json.order);
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
  }, [id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Link
          href="/admin/orders"
          style={{
            color: COLORS.rose,
            textDecoration: "none",
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ← All orders
        </Link>
      </div>

      {loading ? (
        <Card>
          <div style={{ color: COLORS.creamFaint }}>Loading order…</div>
        </Card>
      ) : error ? (
        <Card>
          <div style={{ color: COLORS.roseSoft }}>{error}</div>
        </Card>
      ) : !order ? (
        <Card>
          <div style={{ color: COLORS.creamFaint }}>Order not found.</div>
        </Card>
      ) : (
        <OrderView order={order} />
      )}
    </div>
  );
}

function nextStatusAction(status: OrderStatus): string | null {
  switch (status) {
    case "awaiting_stripe_setup":
      return "Mark as Paid (manual)";
    case "pending_payment":
      return "Mark as Paid";
    case "paid":
      return "Mark as Fulfilled";
    case "fulfilled":
      return null;
    case "cancelled":
    case "refunded":
      return null;
    default:
      return null;
  }
}

function OrderView({ order }: { order: Order }) {
  const action = nextStatusAction(order.status);
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
          <Eyebrow>Order detail</Eyebrow>
          <PageTitle>Order {order.id}</PageTitle>
          <div
            style={{
              marginTop: "0.5rem",
              color: COLORS.creamMuted,
              fontSize: "0.85rem",
            }}
          >
            {formatDate(order.createdAt)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.6rem",
          }}
        >
          <StatusPill status={order.status} />
          {action ? (
            <button
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
              }}
            >
              {action}
            </button>
          ) : null}
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card>
            <Eyebrow>Customer</Eyebrow>
            <div
              style={{
                marginTop: "0.6rem",
                fontFamily: "var(--font-cormorant), serif",
                fontStyle: "italic",
                fontSize: "1.4rem",
                color: COLORS.cream,
              }}
            >
              {order.customer.firstName} {order.customer.lastName}
            </div>
            <div
              style={{
                marginTop: "0.4rem",
                color: COLORS.creamMuted,
                fontSize: "0.9rem",
              }}
            >
              {order.customer.email}
            </div>
            {order.customer.phone ? (
              <div style={{ color: COLORS.creamMuted, fontSize: "0.9rem" }}>
                {order.customer.phone}
              </div>
            ) : null}
          </Card>

          <Card>
            <Eyebrow>Shipping</Eyebrow>
            <div
              style={{
                marginTop: "0.6rem",
                color: COLORS.cream,
                fontSize: "0.95rem",
                lineHeight: 1.55,
              }}
            >
              <div>{order.shipping.line1}</div>
              {order.shipping.line2 ? <div>{order.shipping.line2}</div> : null}
              <div>
                {order.shipping.city}, {order.shipping.state}{" "}
                {order.shipping.postalCode}
              </div>
              <div>{order.shipping.country}</div>
            </div>
          </Card>

          {order.notes ? (
            <Card>
              <Eyebrow>Notes</Eyebrow>
              <div
                style={{
                  marginTop: "0.6rem",
                  color: COLORS.creamMuted,
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {order.notes}
              </div>
            </Card>
          ) : null}

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
              <dt style={{ color: COLORS.creamFaint }}>Created</dt>
              <dd style={{ color: COLORS.cream, margin: 0 }}>
                {formatDate(order.createdAt)}
              </dd>
              <dt style={{ color: COLORS.creamFaint }}>Status</dt>
              <dd style={{ margin: 0 }}>
                <StatusPill status={order.status} />
              </dd>
              <dt style={{ color: COLORS.creamFaint }}>Order ID</dt>
              <dd
                style={{
                  color: COLORS.cream,
                  margin: 0,
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.78rem",
                }}
              >
                {order.id}
              </dd>
            </dl>
          </Card>
        </div>

        <Card style={{ padding: 0 }}>
          <div
            style={{
              padding: "1.1rem 1.4rem",
              borderBottom: `1px solid ${COLORS.wineLine}`,
            }}
          >
            <Eyebrow>Line items</Eyebrow>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.wineLine}` }}>
                  <Th>Item</Th>
                  <Th align="right">Qty</Th>
                  <Th align="right">Unit</Th>
                  <Th align="right">Line total</Th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={`${item.productSlug}-${item.name}`}
                    style={{ borderBottom: `1px solid ${COLORS.wineLine}` }}
                  >
                    <Td>
                      <div style={{ color: COLORS.cream, fontSize: "0.95rem" }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          color: COLORS.creamFaint,
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-dm-mono), monospace",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {item.productSlug}
                      </div>
                    </Td>
                    <Td align="right">
                      <span style={{ color: COLORS.creamMuted }}>
                        {item.quantity}
                      </span>
                    </Td>
                    <Td align="right">
                      <Money value={item.unitPrice} />
                    </Td>
                    <Td align="right">
                      <Money value={item.lineTotal} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              padding: "1.1rem 1.4rem",
              borderTop: `1px solid ${COLORS.wineLine}`,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              alignItems: "flex-end",
            }}
          >
            <TotalsRow label="Subtotal" value={order.subtotal} />
            <TotalsRow label="Shipping" value={order.shippingCost} />
            <TotalsRow label="Tax" value={order.tax} />
            <div
              style={{
                marginTop: "0.4rem",
                paddingTop: "0.5rem",
                borderTop: `1px solid ${COLORS.wineLine}`,
                display: "flex",
                gap: "1rem",
                alignItems: "baseline",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: COLORS.creamMuted,
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontStyle: "italic",
                  fontSize: "1.6rem",
                  color: COLORS.cream,
                }}
              >
                {`$${order.total.toFixed(2)}`}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function TotalsRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
      <span
        style={{
          fontFamily: "var(--font-dm-mono), monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.creamFaint,
        }}
      >
        {label}
      </span>
      <span style={{ color: COLORS.cream, fontSize: "0.95rem" }}>
        <Money value={value} />
      </span>
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
