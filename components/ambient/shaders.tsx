"use client";

/**
 * Mobile-aware wrapper around @paper-design/shaders-react.
 *
 * The animated WebGL shaders are gorgeous but run a continuous rAF/GPU loop that
 * blocks the main thread — the dominant cost behind our poor mobile Lighthouse
 * score. On phones (and for prefers-reduced-motion users) we skip WebGL entirely
 * and paint a static CSS gradient derived from the same colors, so section
 * backgrounds still look right at effectively zero runtime cost. Desktop keeps
 * the full animated treatment, unchanged.
 *
 * Every page imports its shaders from here instead of the library directly.
 */

import * as React from "react";
import { useSyncExternalStore } from "react";
import * as Shaders from "@paper-design/shaders-react";

const DESKTOP_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(DESKTOP_QUERY);
  const handler = () => callback();
  mq.addEventListener?.("change", handler);
  return () => mq.removeEventListener?.("change", handler);
}

function getSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// Server (and first hydration paint) renders the lightweight fallback; desktop
// clients upgrade to the animated shader immediately after hydration. Shaders
// are canvas-painted client-side only, so desktop output is visually identical.
function getServerSnapshot() {
  return false;
}

function useAnimatedShaders() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

type AnyShaderProps = {
  colors?: string[];
  colorBack?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

function fallbackBackground(props: AnyShaderProps): string {
  const colors = Array.isArray(props.colors) ? props.colors : [];
  if (colors.length >= 2) {
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[colors.length - 1]} 100%)`;
  }
  if (colors.length === 1) return colors[0];
  if (props.colorBack) return props.colorBack;
  return "transparent";
}

function gate<P extends AnyShaderProps>(
  Real: React.ComponentType<P>,
  name: string,
): React.FC<P> {
  const Gated: React.FC<P> = (props) => {
    const animated = useAnimatedShaders();
    if (animated) return <Real {...props} />;
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
  };
  Gated.displayName = `Ambient(${name})`;
  return Gated;
}

const as = <T,>(c: T) => c as React.ComponentType<AnyShaderProps>;

export const MeshGradient = gate(as(Shaders.MeshGradient), "MeshGradient");
export const GrainGradient = gate(as(Shaders.GrainGradient), "GrainGradient");
export const NeuroNoise = gate(as(Shaders.NeuroNoise), "NeuroNoise");
export const Warp = gate(as(Shaders.Warp), "Warp");
export const SmokeRing = gate(as(Shaders.SmokeRing), "SmokeRing");
export const Voronoi = gate(as(Shaders.Voronoi), "Voronoi");
export const Dithering = gate(as(Shaders.Dithering), "Dithering");
