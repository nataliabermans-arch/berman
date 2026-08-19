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
      title={alias?.title ?? "JRB Medical Wellness"}
      description={
        alias?.description ??
        "About Dr. Jennifer Berman and JRB Medical Wellness."
      }
      ctaHref="/contact/"
      ctaLabel="Request a consult"
    />
  );
}
