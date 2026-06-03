import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SUPPLEMENTS, SUPPLEMENT_BUNDLE } from "@/lib/services/supplements";
import { siteUrl } from "@/lib/site";
import ProductClient from "./_product-client";

const SITE = siteUrl;
const ALL = [SUPPLEMENT_BUNDLE, ...SUPPLEMENTS];

export async function generateStaticParams() {
  return ALL.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = ALL.find((x) => x.slug === params.slug);
  if (!p) return {};
  const url = `/services/supplements/${p.slug}`;
  const title = `${p.name} — Berman Supplements`;
  return {
    title,
    description: p.tagline,
    openGraph: {
      title: p.name,
      description: p.tagline,
      url,
      type: "website",
      images: [`${SITE}${p.image}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const p = ALL.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const pageUrl = `${SITE}/services/supplements/${p.slug}`;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline,
    image: `${SITE}${p.image}`,
    sku: p.slug,
    category: p.category,
    brand: { "@type": "Brand", name: "Dr. Jennifer Berman" },
    url: pageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price.replace(/[^0-9.]/g, ""),
      availability: "https://schema.org/InStock",
      url: pageUrl,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Treatments",
        item: `${SITE}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Berman Supplements",
        item: `${SITE}/services/supplements`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: p.name,
        item: pageUrl,
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
            "@graph": [breadcrumbLd, productLd],
          }),
        }}
      />
      <ProductClient slug={params.slug} />
    </main>
  );
}
