import type { Metadata } from "next";

import SupplementsClient from "./_supplements-client";
import { SUPPLEMENT_BUNDLE, SUPPLEMENTS } from "@/lib/services/supplements";
import { siteUrl } from "@/lib/site";

const SEO = {
  title: "Berman Supplements — Physician-Formulated by Dr. Jennifer Berman",
  description:
    "A small line of practitioner-grade supplements formulated by Dr. Jennifer Berman. Clinical doses, bioavailable forms, third-party tested. Hormone, libido, and foundational support.",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: SEO.title,
    description: SEO.description,
    openGraph: {
      title: SEO.title,
      description: SEO.description,
      url: "/services/supplements/",
      type: "website",
    },
    alternates: {
      canonical: "/services/supplements/",
    },
  };
}

export default function Page() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS].map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: p.tagline,
        url: p.shopUrl,
        image: `${siteUrl}${p.image}`,
        brand: { "@type": "Brand", name: "Dr. Jennifer Berman" },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: p.price.replace(/[^0-9.]/g, ""),
          availability: "https://schema.org/InStock",
          url: p.shopUrl,
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Treatments",
        item: `${siteUrl}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Berman Supplements",
        item: `${siteUrl}/services/supplements`,
      },
    ],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [breadcrumbJsonLd, itemListJsonLd],
          }),
        }}
      />
      <SupplementsClient />
    </main>
  );
}
