import type { Metadata } from "next";

import JournalClient from "../journal/_journal-client";
import {
  getAllArticleSummaries,
  getArticlesByPage,
} from "@/lib/journal/articles";

const seo = {
  title: "Blog — Dr. Jennifer Berman",
  description:
    "Women's health articles from Dr. Jennifer Berman on hormones, sexual health, pelvic medicine, regenerative care, and patient questions.",
  url: "/blog/",
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

export default function BlogPage() {
  const { articles, totalPages, total } = getArticlesByPage(1);
  const allSummaries = getAllArticleSummaries();

  return (
    <main data-active="E">
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
