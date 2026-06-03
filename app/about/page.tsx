import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

import AboutClient from "./_about-client";

const seo = {
  title: "About Dr. Jennifer Berman — Beverly Hills Urologist & Founder",
  description:
    "Dr. Jennifer Berman, MD — internationally recognized urologist, pioneer of female sexual medicine, twice NYT best-selling author. Founder of The Berman Women's Wellness Center, Beverly Hills.",
  url: "/about",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: "profile",
      images: [
        {
          url: "/images/dr-berman/headshot-portrait.webp",
          width: 1200,
          height: 1500,
          alt: "Dr. Jennifer Berman, MD — Beverly Hills",
        },
      ],
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function AboutPage() {
  const person = {
    "@type": "Physician",
    name: "Dr. Jennifer Berman, MD",
    jobTitle: "Urologist & Founder",
    worksFor: {
      "@type": "MedicalOrganization",
      name: "The Berman Women's Wellness Center",
    },
    alumniOf: [
      "Boston University School of Medicine",
      "UCLA Female Sexual Medicine",
    ],
    url: `${siteUrl}/about`,
    image: `${siteUrl}/images/dr-berman/headshot-portrait.webp`,
    sameAs: [],
  };

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
        name: "About",
        item: `${siteUrl}/about`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [person, breadcrumbList],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </main>
  );
}
