/**
 * Commerce types — single source of truth for cart, orders, and admin views.
 * Imported by cart store, API routes, admin dashboard, and checkout flow.
 */

export interface CartLine {
  productSlug: string;
  name: string;
  price: number; // dollars (decimal)
  image: string;
  quantity: number;
  shopUrl?: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // 2-letter ISO, default "US"
}

export type OrderStatus =
  | "awaiting_stripe_setup" // built before Stripe wired
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productSlug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string; // ord_<timestamp>_<random>
  createdAt: string; // ISO
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  notes?: string;
}

export interface OrderListItem {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
}

export interface SalesStats {
  today: { orders: number; revenue: number };
  last7Days: { orders: number; revenue: number };
  last30Days: { orders: number; revenue: number };
  allTime: { orders: number; revenue: number };
  topProducts: Array<{ name: string; unitsSold: number; revenue: number }>;
}

/** API request body for POST /api/orders */
export interface CreateOrderRequest {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: Array<{ productSlug: string; quantity: number }>;
  notes?: string;
}

/** API response for POST /api/orders */
export interface CreateOrderResponse {
  orderId: string;
  status: OrderStatus;
  total: number;
  message: string;
}
