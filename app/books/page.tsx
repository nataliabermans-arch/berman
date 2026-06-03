import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { BOOKS } from "@/lib/books";

import BooksClient from "./_books-client";

const seo = {
  title:
    "Books — Dr. Jennifer Berman | Two New York Times Bestsellers on Women's Health",
  description:
    "Dr. Jennifer Berman's two New York Times bestselling books on female sexual health: For Women Only (2001) and Secrets of the Sexually Satisfied Woman (2005). Translated into 18 languages.",
  url: "/books",
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
          url: BOOKS[0].coverImage,
          alt: `${BOOKS[0].title} — book cover`,
        },
      ],
    },
    alternates: {
      canonical: seo.url,
    },
  };
}

export default function BooksPage() {
  const booksLd = BOOKS.map((b) => ({
    "@context": "https://schema.org",
    "@type": "Book",
    name: b.title,
    author: { "@type": "Person", name: "Dr. Jennifer Berman, MD" },
    datePublished: String(b.publishedYear),
    publisher: { "@type": "Organization", name: b.publisher },
    image: `${siteUrl}${b.coverImage}`,
    url: `${siteUrl}/books#${b.slug}`,
    description: b.description.split("\n")[0],
  }));

  const breadcrumb = {
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
        name: "About",
        item: `${siteUrl}/about`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Books",
        item: `${siteUrl}/books`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [...booksLd, breadcrumb],
  };

  return (
    <main data-active="E">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BooksClient />
    </main>
  );
}
