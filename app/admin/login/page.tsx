"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GrainGradient } from "@paper-design/shaders-react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("Wrong username or password");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error — try again");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        background: "#1a0a10",
        color: "#fff5f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
      }}
    >
      <GrainGradient
        colors={["#a13a48", "#6a2230", "#1a0a10"]}
        colorBack="#1a0a10"
        shape="sphere"
        speed={0.6}
        scale={0.7}
        noise={0.45}
        softness={0.8}
        intensity={0.28}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 245, 241, 0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(217, 155, 161, 0.25)",
          borderRadius: "12px",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#d99ba1",
            marginBottom: "0.75rem",
          }}
        >
          Berman · Staff
        </div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "2.25rem",
            lineHeight: 1.1,
            margin: 0,
            color: "#fff5f1",
          }}
        >
          Welcome back.
        </h1>
        <p
          style={{
            marginTop: "0.5rem",
            color: "rgba(255, 245, 241, 0.7)",
            fontSize: "0.95rem",
          }}
        >
          Sign in to the dashboard.
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <label
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255, 245, 241, 0.65)",
              }}
            >
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={{
                background: "rgba(74, 28, 38, 0.6)",
                border: "1px solid rgba(217, 155, 161, 0.25)",
                borderRadius: "6px",
                padding: "0.75rem 0.9rem",
                color: "#fff5f1",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#d99ba1")}
              onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(217, 155, 161, 0.25)")
              }
            />
          </label>

          <label
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255, 245, 241, 0.65)",
              }}
            >
              Password
            </span>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  background: "rgba(74, 28, 38, 0.6)",
                  border: "1px solid rgba(217, 155, 161, 0.25)",
                  borderRadius: "6px",
                  padding: "0.75rem 2.5rem 0.75rem 0.9rem",
                  color: "#fff5f1",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d99ba1")}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(217, 155, 161, 0.25)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 245, 241, 0.6)",
                  cursor: "pointer",
                  padding: "0.4rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error ? (
            <div
              role="alert"
              style={{
                color: "#f4d4d4",
                fontSize: "0.85rem",
                background: "rgba(138, 58, 68, 0.35)",
                border: "1px solid rgba(217, 155, 161, 0.4)",
                borderRadius: "6px",
                padding: "0.6rem 0.8rem",
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              position: "relative",
              marginTop: "0.5rem",
              padding: "0.85rem 1.2rem",
              background: "#4a1c26",
              color: "#fff5f1",
              border: "1px solid rgba(217, 155, 161, 0.5)",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: loading ? 0.6 : 1,
              overflow: "hidden",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </main>
  );
}
