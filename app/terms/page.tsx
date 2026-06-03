import type { Metadata } from "next";

import TermsClient from "./_terms-client";

const seo = {
  title: "Terms of Use — The Berman Women's Wellness Center",
  description:
    "The terms and conditions governing your use of the Berman Women's Wellness Center website.",
  url: "/terms",
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

export default function TermsPage() {
  return (
    <main data-active="E">
      <TermsClient />
    </main>
  );
}
