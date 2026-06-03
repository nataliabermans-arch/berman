"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GrainGradient } from "@paper-design/shaders-react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/leads", label: "Leads" },
];

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#1a0a10",
        color: "#fff5f1",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <GrainGradient
        colors={["#a13a48", "#6a2230", "#1a0a10"]}
        colorBack="#1a0a10"
        shape="sphere"
        speed={0.4}
        scale={0.85}
        noise={0.4}
        softness={0.85}
        intensity={0.18}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <aside
        style={{
          position: "relative",
          zIndex: 2,
          width: "240px",
          flexShrink: 0,
          minHeight: "100vh",
          background: "rgba(74, 28, 38, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(217, 155, 161, 0.18)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 1.25rem 1.5rem",
        }}
      >
        <div style={{ marginBottom: "2.25rem" }}>
          <div
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontSize: "1.75rem",
              fontWeight: 400,
              color: "#fff5f1",
              lineHeight: 1,
            }}
          >
            Berman
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#d99ba1",
              marginTop: "0.4rem",
            }}
          >
            Admin
          </div>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.7rem 0.9rem",
                  borderLeft: active
                    ? "2px solid #d99ba1"
                    : "2px solid transparent",
                  borderRadius: "0 4px 4px 0",
                  background: active
                    ? "rgba(217, 155, 161, 0.12)"
                    : "transparent",
                  color: active ? "#fff5f1" : "rgba(255, 245, 241, 0.75)",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  transition: "color 0.15s ease, background 0.15s ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <div
            aria-disabled
            title="Coming soon"
            style={{
              display: "block",
              padding: "0.7rem 0.9rem",
              borderLeft: "2px solid transparent",
              color: "rgba(255, 245, 241, 0.35)",
              fontSize: "0.95rem",
              cursor: "not-allowed",
            }}
          >
            Products (coming soon)
          </div>
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <button
            type="button"
            onClick={signOut}
            style={{
              width: "100%",
              padding: "0.65rem 0.9rem",
              background: "transparent",
              border: "1px solid rgba(217, 155, 161, 0.3)",
              borderRadius: "6px",
              color: "rgba(255, 245, 241, 0.85)",
              cursor: "pointer",
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: "100vh",
          padding: "2.5rem 2.5rem 4rem",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
