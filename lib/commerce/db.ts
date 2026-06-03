import { sql } from "@vercel/postgres";
import { jwtVerify } from "jose";
import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  CreateOrderRequest,
  Order,
  OrderItem,
  OrderListItem,
  OrderStatus,
  SalesStats,
} from "./types";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "dev-fallback-secret-change-me",
);

const COUNTED_STATUSES = [
  "paid",
  "fulfilled",
  "awaiting_stripe_setup",
] as const;

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL);
}

function warnNoDb(fn: string) {
  // eslint-disable-next-line no-console
  console.warn(
    `[commerce/db] ${fn}: POSTGRES_URL not set — returning mock data.`,
  );
}

export function generateOrderId(): string {
  return `ord_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export async function verifyAdminToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, ADMIN_SECRET);
    return true;
  } catch {
    return false;
  }
}

interface OrderRow {
  id: string;
  created_at: string | Date;
  status: string;
  customer_email: string;
  customer_first: string;
  customer_last: string;
  customer_phone: string | null;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_postal: string;
  ship_country: string;
  subtotal: string | number;
  tax: string | number;
  shipping_cost: string | number;
  total: string | number;
  notes: string | null;
}

interface ItemRow {
  product_slug: string;
  product_name: string;
  unit_price: string | number;
  quantity: number;
  line_total: string | number;
}

function rowToOrder(row: OrderRow, items: OrderItem[]): Order {
  const created =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString();
  return {
    id: row.id,
    createdAt: created,
    customer: {
      email: row.customer_email,
      firstName: row.customer_first,
      lastName: row.customer_last,
      phone: row.customer_phone ?? undefined,
    },
    shipping: {
      line1: row.ship_line1,
      line2: row.ship_line2 ?? undefined,
      city: row.ship_city,
      state: row.ship_state,
      postalCode: row.ship_postal,
      country: row.ship_country,
    },
    items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    shippingCost: Number(row.shipping_cost),
    total: Number(row.total),
    status: row.status as OrderStatus,
    notes: row.notes ?? undefined,
  };
}

export async function createOrder(
  req: CreateOrderRequest,
  total: number,
  items: OrderItem[],
): Promise<Order> {
  const id = generateOrderId();
  const status: OrderStatus = "awaiting_stripe_setup";
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  // tax + shipping recomputed from total - subtotal in case caller did rounding;
  // but we trust caller for the canonical value.
  const order: Order = {
    id,
    createdAt: new Date().toISOString(),
    customer: req.customer,
    shipping: { ...req.shipping, country: req.shipping.country || "US" },
    items,
    subtotal,
    tax: 0,
    shippingCost: 0,
    total,
    status,
    notes: req.notes,
  };

  if (!hasDb()) {
    warnNoDb("createOrder");
    return order;
  }

  // Compute tax/shipping by inferring from total - subtotal — we can't know
  // the breakdown here without the caller passing it. The route hands us
  // total only; tax/shipping are baked in. For DB integrity we store them
  // as 0 + the residual in shipping_cost so totals reconcile.
  const residual = +(total - subtotal).toFixed(2);
  const taxValue = 0;
  const shippingValue = residual;

  await sql.query(
    `INSERT INTO orders (
       id, status,
       customer_email, customer_first, customer_last, customer_phone,
       ship_line1, ship_line2, ship_city, ship_state, ship_postal, ship_country,
       subtotal, tax, shipping_cost, total,
       notes
     ) VALUES (
       $1, $2,
       $3, $4, $5, $6,
       $7, $8, $9, $10, $11, $12,
       $13, $14, $15, $16,
       $17
     )`,
    [
      id,
      status,
      req.customer.email,
      req.customer.firstName,
      req.customer.lastName,
      req.customer.phone ?? null,
      req.shipping.line1,
      req.shipping.line2 ?? null,
      req.shipping.city,
      req.shipping.state,
      req.shipping.postalCode,
      req.shipping.country || "US",
      subtotal,
      taxValue,
      shippingValue,
      total,
      req.notes ?? null,
    ],
  );

  for (const item of items) {
    await sql.query(
      `INSERT INTO order_items (
         order_id, product_slug, product_name, unit_price, quantity, line_total
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        item.productSlug,
        item.name,
        item.unitPrice,
        item.quantity,
        item.lineTotal,
      ],
    );
  }

  order.tax = taxValue;
  order.shippingCost = shippingValue;
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!hasDb()) {
    warnNoDb("getOrder");
    return null;
  }

  const orderRes = await sql.query<OrderRow>(
    `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
    [id],
  );
  if (orderRes.rowCount === 0) return null;
  const row = orderRes.rows[0];

  const itemsRes = await sql.query<ItemRow>(
    `SELECT product_slug, product_name, unit_price, quantity, line_total
     FROM order_items WHERE order_id = $1 ORDER BY id ASC`,
    [id],
  );
  const items: OrderItem[] = itemsRes.rows.map((i) => ({
    productSlug: i.product_slug,
    name: i.product_name,
    unitPrice: Number(i.unit_price),
    quantity: Number(i.quantity),
    lineTotal: Number(i.line_total),
  }));

  return rowToOrder(row, items);
}

export async function listOrders(opts: {
  limit?: number;
  status?: OrderStatus;
}): Promise<OrderListItem[]> {
  if (!hasDb()) {
    warnNoDb("listOrders");
    return [];
  }

  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);

  const params: (string | number)[] = [];
  let where = "";
  if (opts.status) {
    where = "WHERE o.status = $1";
    params.push(opts.status);
  }
  params.push(limit);

  const res = await sql.query<{
    id: string;
    created_at: string | Date;
    status: string;
    customer_email: string;
    customer_first: string;
    customer_last: string;
    total: string | number;
    item_count: string | number;
  }>(
    `SELECT
       o.id, o.created_at, o.status,
       o.customer_email, o.customer_first, o.customer_last, o.total,
       COALESCE(SUM(oi.quantity), 0) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${where}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return res.rows.map((r) => ({
    id: r.id,
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : new Date(r.created_at).toISOString(),
    customerName: `${r.customer_first} ${r.customer_last}`.trim(),
    customerEmail: r.customer_email,
    itemCount: Number(r.item_count),
    total: Number(r.total),
    status: r.status as OrderStatus,
  }));
}

export async function getSalesStats(): Promise<SalesStats> {
  if (!hasDb()) {
    warnNoDb("getSalesStats");
    return {
      today: { orders: 0, revenue: 0 },
      last7Days: { orders: 0, revenue: 0 },
      last30Days: { orders: 0, revenue: 0 },
      allTime: { orders: 0, revenue: 0 },
      topProducts: [],
    };
  }

  const statusList = COUNTED_STATUSES.map((s) => `'${s}'`).join(",");

  const windowRes = await sql.query<{
    today_orders: string | number;
    today_rev: string | number;
    week_orders: string | number;
    week_rev: string | number;
    month_orders: string | number;
    month_rev: string | number;
    all_orders: string | number;
    all_rev: string | number;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')   AS today_orders,
       COALESCE(SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day'), 0)   AS today_rev,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')  AS week_orders,
       COALESCE(SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0)  AS week_rev,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS month_orders,
       COALESCE(SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) AS month_rev,
       COUNT(*)         AS all_orders,
       COALESCE(SUM(total), 0) AS all_rev
     FROM orders
     WHERE status IN (${statusList})`,
  );

  const w = windowRes.rows[0];

  const topRes = await sql.query<{
    product_name: string;
    units_sold: string | number;
    revenue: string | number;
  }>(
    `SELECT oi.product_name,
            SUM(oi.quantity)   AS units_sold,
            SUM(oi.line_total) AS revenue
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE o.status IN (${statusList})
     GROUP BY oi.product_slug, oi.product_name
     ORDER BY units_sold DESC
     LIMIT 5`,
  );

  return {
    today: { orders: Number(w.today_orders), revenue: Number(w.today_rev) },
    last7Days: { orders: Number(w.week_orders), revenue: Number(w.week_rev) },
    last30Days: {
      orders: Number(w.month_orders),
      revenue: Number(w.month_rev),
    },
    allTime: { orders: Number(w.all_orders), revenue: Number(w.all_rev) },
    topProducts: topRes.rows.map((r) => ({
      name: r.product_name,
      unitsSold: Number(r.units_sold),
      revenue: Number(r.revenue),
    })),
  };
}

export async function runMigrations(): Promise<void> {
  if (!hasDb()) {
    warnNoDb("runMigrations");
    return;
  }

  const schemaPath = path.join(process.cwd(), "lib/commerce/schema.sql");
  const raw = readFileSync(schemaPath, "utf8");

  // Strip line comments, then split on `;` to execute statements one-by-one.
  const cleaned = raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[commerce/db] migration statement failed:", stmt, err);
      throw err;
    }
  }
}
