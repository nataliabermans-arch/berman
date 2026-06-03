"use client";

import { useEffect, useRef, useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { useCartStore } from "@/lib/commerce/cart-store";

interface AddToCartButtonProps {
  productSlug: string;
  name: string;
  price: number;
  image: string;
  className?: string;
}

export default function AddToCartButton({
  productSlug,
  name,
  price,
  image,
  className,
}: AddToCartButtonProps) {
  const addLine = useCartStore((s) => s.addLine);
  const open = useCartStore((s) => s.open);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    addLine({ productSlug, name, price, image, quantity: 1 });
    open();
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`Add ${name} to cart`}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "14px 28px",
        borderRadius: 999,
        background: "#4a1c26",
        color: "#fff5f1",
        border: "none",
        cursor: "pointer",
        fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, monospace",
        fontSize: 12,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        overflow: "hidden",
        transition: "transform 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>
        {added ? "Added ✓" : "Add to cart"}
      </span>
      <BorderBeam
        size={80}
        duration={8}
        colorFrom="#f4a3aa"
        colorTo="#d97580"
        borderWidth={1.5}
      />
    </button>
  );
}
