import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

import BiotypeClient from "./_biotype-client";

const seo = {
  title: "The Menopause Biotype™ — Dr. Jennifer Berman, MD",
  description:
    "The Menopause Biotype™ decodes your unique genetic profile to deliver a personalized, evidence-based approach to perimenopause and menopause care — no more guesswork.",
  url: "/biotype",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: "article",
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function BiotypePage() {
  const procedureLd = {
    "@type": "MedicalProcedure",
    name: "Menopause Biotype™ — DNA-Guided Precision Menopause Care",
    procedureType: "Diagnostic",
    performedBy: {
      "@type": "Physician",
      name: "Dr. Jennifer Berman, MD",
    },
    description:
      "A DNA-guided assessment that decodes your genetic profile across six biological pathways (hormone metabolism, hormone sensitivity, detoxification & methylation, inflammation & stress, sexual health, metabolic health) to deliver personalized, evidence-based perimenopause and menopause care.",
    url: `${siteUrl}/biotype`,
    audience: {
      "@type": "PeopleAudience",
      suggestedMinAge: 35,
      suggestedMaxAge: 55,
      suggestedGender: "Female",
    },
  };

  const breadcrumbLd = {
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
        name: "About",
        item: `${siteUrl}/about`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "The Menopause Biotype",
        item: `${siteUrl}/biotype`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [procedureLd, breadcrumbLd],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BiotypeClient />
    </main>
  );
}
