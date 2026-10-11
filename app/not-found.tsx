import type { Metadata } from "next";
import NotFoundClient from "./_not-found-client";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundClient />;
}
