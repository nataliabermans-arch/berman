import type { Metadata } from "next";
import CheckoutClient from "./_checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Berman Supplements",
  description:
    "Complete your order from Dr. Jennifer Berman's supplement line.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main data-active="E">
      <CheckoutClient />
    </main>
  );
}
