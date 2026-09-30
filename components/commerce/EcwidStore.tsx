"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    xProductBrowser?: (...args: string[]) => void;
    Ecwid?: unknown;
  }
}

/**
 * Embeds the Ecwid storefront (catalog + product pages + cart + checkout) for
 * a given store. Ecwid ships as a script that renders into a mount div; the
 * whole store — browsing, product detail, cart, checkout — lives inside it and
 * stays on this domain. Catalog, payments, tax and shipping are managed in the
 * Ecwid dashboard, so there is no backend of ours.
 */
export default function EcwidStore({ storeId }: { storeId: string }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const init = () => {
      window.xProductBrowser?.(
        "categoriesPerRow=3",
        "views=grid(20,3) list(60) table(60)",
        "categoryView=grid",
        "searchView=list",
        `id=my-store-${storeId}`,
      );
    };

    if (typeof window.xProductBrowser === "function") {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://app.ecwid.com/script.js?${storeId}&data_platform=code`;
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("data-cfasync", "false");
    script.onload = init;
    document.body.appendChild(script);
  }, [storeId]);

  return <div id={`my-store-${storeId}`} />;
}
