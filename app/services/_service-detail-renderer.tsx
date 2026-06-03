import type { Metadata } from "next";

import {
  SERVICE_BY_SLUG,
  type ServiceSlug,
} from "@/lib/services/content";
import { siteUrl } from "@/lib/site";

import ServiceDetailClient from "./[slug]/_service-client";

const SITE = siteUrl;

export function generateServiceDetailMetadata(
  slug: ServiceSlug,
  canonicalPath: string,
): Metadata {
  const s = SERVICE_BY_SLUG[slug];
  const url = canonicalPath;
  return {
    title: s.seo.title,
    description: s.seo.description,
    openGraph: {
      title: s.seo.title,
      description: s.seo.description,
      url,
      type: "article",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function ServiceDetailPage({
  slug,
  canonicalPath,
}: {
  slug: ServiceSlug;
  canonicalPath: string;
}) {
  const s = SERVICE_BY_SLUG[slug];
  const pageUrl = `${SITE}${canonicalPath}`;

  const breadcrumbList = {
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
        name: s.name,
        item: pageUrl,
      },
    ],
  };

  const medicalProcedure = {
    "@type": s.procedureType,
    name: s.name,
    description: s.seo.description,
    procedureType: s.procedureType,
    url: pageUrl,
    performedBy: {
      "@type": "Physician",
      name: "Dr. Jennifer Berman, MD",
      url: `${SITE}/`,
    },
  };

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: s.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbList, medicalProcedure, faqPage],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient slug={slug} />
    </main>
  );
}
