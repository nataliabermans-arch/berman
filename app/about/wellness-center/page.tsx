import type { Metadata } from "next";

import LegacySimplePage from "@/components/legacy/LegacySimplePage";
import { getLegacyPageAliasByPath } from "@/lib/legacy-pages";

const alias = getLegacyPageAliasByPath("/about/wellness-center/");

export async function generateMetadata(): Promise<Metadata> {
  if (!alias) return {};
  return {
    title: alias.title,
    description: alias.description,
    alternates: {
      canonical: alias.path,
    },
    openGraph: {
      title: alias.title,
      description: alias.description,
      url: alias.path,
      type: "website",
    },
  };
}

export default function WellnessCenterPage() {
  return (
    <LegacySimplePage
      title={alias?.title ?? "The Berman Women's Wellness Center"}
      description={
        alias?.description ??
        "About Dr. Jennifer Berman and The Berman Women's Wellness Center."
      }
      ctaHref="/contact/"
      ctaLabel="Request a consult"
    />
  );
}
