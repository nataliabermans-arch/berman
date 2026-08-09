"use client";

/**
 * Static, near-zero-cost stand-in for @paper-design/shaders-react.
 *
 * The animated WebGL shaders looked lovely but ran a continuous rAF + GPU loop
 * on EVERY page — the dominant cost behind the poor Lighthouse scores, the
 * sluggish inner-page rendering, and the footer/seal not painting until a
 * hover/repaint. We now render a static CSS gradient built from the SAME colors
 * on all screens: visually near-identical, effectively free, and it lets the
 * rest of the page (including the footer) paint immediately.
 *
 * Every page imports its shader components from here instead of the library, so
 * this single file controls the whole site's ambient backgrounds. The library
 * is no longer imported anywhere, so it also drops out of the JS bundle.
 */

import * as React from "react";

type AnyShaderProps = {
  colors?: string[];
  colorBack?: string;
  colorMid?: string;
  colorFront?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

function fallbackBackground(props: AnyShaderProps): string {
  const colors = (Array.isArray(props.colors) ? props.colors : []).filter(
    (c): c is string => typeof c === "string" && c.length > 0,
  );
  if (colors.length >= 2) {
    // Multi-stop diagonal gradient across all the shader's colors, plus a soft
    // off-corner radial for depth — approximates the original mesh look.
    const last = colors[colors.length - 1];
    return `radial-gradient(120% 120% at 12% 8%, ${last}22, transparent 55%), linear-gradient(135deg, ${colors.join(", ")})`;
  }
  if (colors.length === 1) return colors[0];
  if (props.colorBack) return props.colorBack;
  return "transparent";
}

function StaticShader(props: AnyShaderProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        ...(props.style || {}),
        background: fallbackBackground(props),
      }}
    />
  );
}

export const MeshGradient = StaticShader;
export const GrainGradient = StaticShader;
export const NeuroNoise = StaticShader;
export const Warp = StaticShader;
export const SmokeRing = StaticShader;
export const Voronoi = StaticShader;
export const Dithering = StaticShader;
