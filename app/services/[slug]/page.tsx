import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  SERVICE_SLUGS,
  type ServiceSlug,
} from "@/lib/services/content";

import ServiceDetailPage, {
  generateServiceDetailMetadata,
} from "../_service-detail-renderer";

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  if (!SERVICE_SLUGS.includes(params.slug as ServiceSlug)) return {};
  const slug = params.slug as ServiceSlug;
  return generateServiceDetailMetadata(slug, `/services/${slug}/`);
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!SERVICE_SLUGS.includes(params.slug as ServiceSlug)) notFound();
  const slug = params.slug as ServiceSlug;
  return <ServiceDetailPage slug={slug} canonicalPath={`/services/${slug}/`} />;
}
