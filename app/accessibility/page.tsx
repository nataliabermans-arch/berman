import type { Metadata } from "next";

import AccessibilityClient from "./_accessibility-client";

const seo = {
  title: "Accessibility — The Berman Women's Wellness Center",
  description: "Our commitment to making this website accessible to everyone.",
  url: "/accessibility",
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

export default function AccessibilityPage() {
  return (
    <main data-active="E">
      <AccessibilityClient />
    </main>
  );
}
