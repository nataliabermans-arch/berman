import type { Metadata } from "next";

import HomeClient from "./_home-client";
import styles from "./page.module.css";

const seo = {
  title: "Beverly Hills Women's Wellness Clinic | Dr. Jennifer Berman, MD",
  description:
    "Physician-led women's wellness care in Beverly Hills for menopause, hormone therapy, sexual health, pelvic and urinary concerns, vaginal rejuvenation, and body contouring.",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: "/",
      type: "website",
      images: [
        {
          url: "/images/dr-berman/headshot-portrait.webp",
          width: 1200,
          height: 1500,
          alt: "Dr. Jennifer Berman, MD — The Berman Women's Wellness Center",
        },
      ],
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function Home() {
  return (
    <main className={styles.page} data-active="E">
      <HomeClient />
    </main>
  );
}
