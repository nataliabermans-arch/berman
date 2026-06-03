import {
  SUPPLEMENTS,
  SUPPLEMENT_BUNDLE,
  type Supplement,
} from "@/lib/services/supplements";
import type { OrderItem } from "./types";

const CATALOG: Supplement[] = [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS];

const TAX_RATE = 0.0875;
const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 8.95;

export function getProductBySlug(slug: string): Supplement | null {
  return CATALOG.find((p) => p.slug === slug) ?? null;
}

export function priceToNumber(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateOrderTotals(
  items: Array<{ productSlug: string; quantity: number }>,
): {
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  lineItems: OrderItem[];
} {
  const lineItems: OrderItem[] = items.map((line) => {
    const product = getProductBySlug(line.productSlug);
    if (!product) throw new Error("Unknown product: " + line.productSlug);
    const unitPrice = priceToNumber(product.price);
    const lineTotal = round2(unitPrice * line.quantity);
    return {
      productSlug: product.slug,
      name: product.name,
      unitPrice,
      quantity: line.quantity,
      lineTotal,
    };
  });

  const subtotal = round2(lineItems.reduce((s, i) => s + i.lineTotal, 0));
  const tax = round2(subtotal * TAX_RATE);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = round2(subtotal + tax + shippingCost);

  return { subtotal, tax, shippingCost, total, lineItems };
}
