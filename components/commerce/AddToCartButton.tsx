"use client";

import { BorderBeam } from "@/components/ui/border-beam";
import { siteUrl } from "@/lib/site";

interface AddToCartButtonProps {
  productSlug: string;
  name: string;
  price: number;
  image: string;
  /**
   * The page Snipcart crawls to validate this product's price and definition.
   * Defaults to the supplement's detail page, which renders this same button —
   * so the definition Snipcart validates against always exists. Override only
   * for a product whose canonical page lives elsewhere.
   */
  url?: string;
  description?: string;
  className?: string;
}

/**
 * Add-to-cart button, powered by Snipcart.
 *
 * Snipcart binds to the `snipcart-add-item` class and reads the `data-item-*`
 * attributes — no cart state of our own. On click it validates the product by
 * fetching `data-item-url` server-side and matching the id + price, then opens
 * the cart. That anti-tampering crawl is why the detail page must carry this
 * button; every call site therefore points `data-item-url` at the detail page.
 */
export default function AddToCartButton({
  productSlug,
  name,
  price,
  image,
  url,
  description,
  className,
}: AddToCartButtonProps) {
  const itemUrl = url ?? `/services/supplements/${productSlug}`;
  const itemImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <button
      type="button"
      className={`snipcart-add-item${className ? ` ${className}` : ""}`}
      aria-label={`Add ${name} to cart`}
      data-item-id={productSlug}
      data-item-name={name}
      data-item-price={price}
      data-item-url={itemUrl}
      data-item-image={itemImage}
      {...(description ? { "data-item-description": description } : {})}
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
      <span style={{ position: "relative", zIndex: 2 }}>Add to cart</span>
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
