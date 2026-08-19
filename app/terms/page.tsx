import type { Metadata } from "next";

import TermsClient from "./_terms-client";

const seo = {
  title: "Terms of Use — JRB Medical Wellness",
  description:
    "The terms and conditions governing your use of the JRB Medical Wellness website.",
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
