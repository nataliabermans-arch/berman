import { redirect } from "next/navigation";

// The bespoke checkout is retired — Snipcart runs the cart and checkout as an
// on-site overlay, so there is no dedicated checkout page any more. Anyone
// landing on the old URL (a stale link or bookmark) is sent to the shop.
export default function Page() {
  redirect("/services/supplements");
}
