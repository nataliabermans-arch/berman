import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { STORIES } from "@/lib/stories";

import StoriesClient from "./_stories-client";

const seo = {
  title: "Patient Stories — In Their Own Words | Berman Women's Wellness",
  description:
    "Eight women, eight different concerns, one consistent thread — they were finally heard. Patient stories from The Berman Women's Wellness Center, Beverly Hills.",
  url: "/stories",
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
      images: [
        {
          url: "/images/stories/sarah-portrait.webp",
          alt: "Patient stories — Berman Women's Wellness Center",
        },
      ],
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function StoriesPage() {
  const reviews = STORIES.filter((s) => s.featured).map((story) => ({
    "@type": "Review",
    itemReviewed: {
      "@type": "MedicalBusiness",
      name: "The Berman Women's Wellness Center",
    },
    reviewBody: story.excerpt,
    author: {
      "@type": "Person",
      name: `${story.patient.name}, ${story.patient.age} (${story.patient.location})`,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: 5,
      bestRating: 5,
    },
  }));

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${siteUrl}/about`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Patient Stories",
        item: `${siteUrl}/stories`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [...reviews, breadcrumbList],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoriesClient />
    </main>
  );
}
