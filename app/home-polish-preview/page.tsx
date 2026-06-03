import type { Metadata } from "next";

import HomeClient from "../_home-client";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Homepage Polish Preview | Dr. Jennifer Berman",
  description:
    "Local-only preview of homepage polish directions before updating the live Berman website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePolishPreview() {
  return (
    <main
      className={`${styles.page} berman-polish-preview`}
      data-active="E"
      data-preview="homepage-polish"
    >
      <HomeClient />
    </main>
  );
}
