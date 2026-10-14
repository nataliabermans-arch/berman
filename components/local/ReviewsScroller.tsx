"use client";

import { useRef, type ReactNode } from "react";

const WINE = "#4a1c26";

/** Horizontal, swipeable track of review cards with prev/next buttons. */
export default function ReviewsScroller({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrow = {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: `1px solid ${WINE}`,
    background: "transparent",
    color: WINE,
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
  } as const;

  return (
    <>
      <style>{`
        .reviews-track { scrollbar-width: none; }
        .reviews-track::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        ref={track}
        className="reviews-track"
        role="region"
        aria-label="Google reviews, scroll sideways for more"
        tabIndex={0}
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 2,
          paddingBottom: 6,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
      <div
        style={{
          marginTop: 22,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" aria-label="Previous reviews" onClick={() => scroll(-1)} style={arrow}>
            ←
          </button>
          <button type="button" aria-label="Next reviews" onClick={() => scroll(1)} style={arrow}>
            →
          </button>
        </div>
        {footer}
      </div>
    </>
  );
}
