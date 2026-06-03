import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

import JournalClient from "../journal/_journal-client";
import {
  getAllArticleSummaries,
  getArticlesByPage,
} from "@/lib/journal/articles";

const seo = {
  title: "Women's Health Blog — Dr. Jennifer Berman",
  description:
    "Long-form journal from Dr. Jennifer Berman on women's wellness, hormones, sexual health, pelvic medicine, regenerative care, and the questions patients ask behind the door.",
  url: "/womens-health-blog/",
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
          alt: "Women's Health Blog — Dr. Jennifer Berman",
        },
      ],
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function WomensHealthBlogPage() {
  const { articles, totalPages, total } = getArticlesByPage(1);
  const allSummaries = getAllArticleSummaries();

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
        name: "Women's Health Blog",
        item: `${siteUrl}/womens-health-blog/`,
      },
    ],
  };

  const blog = {
    "@type": "Blog",
    name: "Women's Health Blog",
    description:
      "Long-form journal from Dr. Jennifer Berman on women's wellness, hormones, sexual health, pelvic medicine, and regenerative care.",
    url: `${siteUrl}/womens-health-blog/`,
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      datePublished: a.publishedAt,
      url: a.originalUrl || `${siteUrl}/${a.slug}/`,
      ...(a.featuredImage
        ? {
            image: a.featuredImage.startsWith("http")
              ? a.featuredImage
              : `${siteUrl}${a.featuredImage}`,
          }
        : {}),
      author: {
        "@type": "Person",
        name: "Dr. Jennifer Berman",
      },
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbList, blog],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JournalClient
        pageArticles={articles}
        totalPages={totalPages}
        total={total}
        currentPage={1}
        allArticleSummaries={allSummaries}
      />
    </main>
  );
}
