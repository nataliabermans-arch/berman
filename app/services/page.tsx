import type { Metadata } from "next";

import ServicesOverviewClient from "./_services-client";
import { SERVICES } from "@/lib/services/content";
import { siteUrl } from "@/lib/site";

const seo = {
  title: "Women's Wellness Treatments Beverly Hills | Dr. Jennifer Berman",
  description:
    "Explore menopause and hormone therapy, sexual health, pelvic and urinary care, vaginal rejuvenation, aesthetic regenerative medicine, and body contouring in Beverly Hills.",
  url: "/services",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: "website",
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function ServicesPage() {
  const breadcrumbList = {
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
    ],
  };

  const medicalBusiness = {
    "@type": "MedicalBusiness",
    name: "The Berman Women's Wellness Center",
    url: `${siteUrl}/`,
    image: `${siteUrl}/images/dr-berman/headshot-portrait.webp`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beverly Hills",
      addressRegion: "CA",
      addressCountry: "US",
    },
    medicalSpecialty: [
      "Endocrine",
      "Gynecologic",
      "Urologic",
      "PlasticSurgery",
    ],
    availableService: SERVICES.map((s) => ({
      "@type": s.procedureType,
      name: s.name,
      url: `${siteUrl}/services/${s.slug}`,
      description: s.spreadLede,
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbList, medicalBusiness],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesOverviewClient />
    </main>
  );
}
