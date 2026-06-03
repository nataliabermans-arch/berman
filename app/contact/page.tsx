import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

import ContactClient from "./_contact-client";

const seo = {
  title: "Contact — Dr. Jennifer Berman",
  description:
    "Reach The Berman Women's Wellness Center in Beverly Hills, with virtual consults available when appropriate. New patient consultations are by appointment; the patient coordinator follows up within one business day.",
  url: "/contact",
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
      images: [
        {
          url: "/images/dr-berman/headshot-portrait.webp",
          width: 1200,
          height: 1500,
          alt: "Contact The Berman Women's Wellness Center — Beverly Hills",
        },
      ],
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function ContactPage() {
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
        name: "Contact",
        item: `${siteUrl}/contact`,
      },
    ],
  };

  const medicalBusiness = {
    "@type": "MedicalBusiness",
    name: "The Berman Women's Wellness Center",
    physician: { "@type": "Physician", name: "Dr. Jennifer Berman, MD" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "415 N. Crescent Drive, Suite 355",
      addressLocality: "Beverly Hills",
      addressRegion: "CA",
      postalCode: "90210",
      addressCountry: "US",
    },
    telephone: "+1-310-772-0072",
    url: `${siteUrl}/contact`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
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
      <ContactClient />
    </main>
  );
}
