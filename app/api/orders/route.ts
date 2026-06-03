import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/commerce/db";
import { calculateOrderTotals } from "@/lib/commerce/products";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/lib/commerce/types";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function nonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export async function POST(req: NextRequest) {
  let body: CreateOrderRequest;
  try {
    body = (await req.json()) as CreateOrderRequest;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object") return badRequest("Missing body");
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return badRequest("At least one item is required");
  }
  for (const item of body.items) {
    if (!item || !nonEmpty(item.productSlug)) {
      return badRequest("Each item needs a productSlug");
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return badRequest("Each item needs a positive quantity");
    }
  }

  const c = body.customer;
  if (
    !c ||
    !nonEmpty(c.email) ||
    !nonEmpty(c.firstName) ||
    !nonEmpty(c.lastName)
  ) {
    return badRequest("Customer email, first name, and last name are required");
  }

  const s = body.shipping;
  if (
    !s ||
    !nonEmpty(s.line1) ||
    !nonEmpty(s.city) ||
    !nonEmpty(s.state) ||
    !nonEmpty(s.postalCode) ||
    !nonEmpty(s.country)
  ) {
    return badRequest("Complete shipping address is required");
  }

  try {
    const totals = calculateOrderTotals(body.items);
    const order = await createOrder(body, totals.total, totals.lineItems);

    const payload: CreateOrderResponse = {
      orderId: order.id,
      status: "awaiting_stripe_setup",
      total: totals.total,
      message:
        "Order received. We'll be in touch about payment as soon as our shop is fully connected.",
    };
    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.startsWith("Unknown product") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
