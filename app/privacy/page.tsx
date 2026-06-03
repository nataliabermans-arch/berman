import type { Metadata } from "next";

import PrivacyClient from "./_privacy-client";

const seo = {
  title: "Privacy Policy — The Berman Women's Wellness Center",
  description:
    "How we collect, use, and protect your information at The Berman Women's Wellness Center.",
  url: "/privacy",
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

export default function PrivacyPage() {
  return (
    <main data-active="E">
      <PrivacyClient />
    </main>
  );
}
