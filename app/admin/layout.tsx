import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin — Berman Wellness",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#1a0a10",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
