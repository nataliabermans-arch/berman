import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Inter } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import LeadCaptureProvider from "@/components/lead/LeadCapture";
import { defaultDescription, siteName, siteUrl } from "@/lib/site";

import "./globals.css";
import { cn } from "@/lib/utils";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-WT38TW7";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Hero headline uses a hand-subset Cormorant (only the headline's glyphs,
// ~1.9KB) served from /public/fonts and preloaded in <head>. It loads before
// first paint even on slow connections, so the giant LCP headline shows the
// real brand font immediately with no late font-swap. See public/fonts.

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  openGraph: {
    title: siteName,
    description: defaultDescription,
    siteName,
    url: "/",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "JRB Medical Wellness",
      description: defaultDescription,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?s={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "JRB Medical Wellness",
      alternateName: "Berman Women's Wellness",
      url: siteUrl,
      logo: `${siteUrl}/images/jb-logo.png`,
      image: `${siteUrl}/images/dr-berman/headshot-portrait.jpg`,
      telephone: "+1-310-772-0072",
      email: "info@bermanwomenswellness.com",
      founder: {
        "@id": `${siteUrl}/#dr-jennifer-berman`,
      },
      sameAs: [
        "https://www.facebook.com/people/Berman-Womens-Wellness-Center/61559558050724/",
        "https://twitter.com/jenbermanmd",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#dr-jennifer-berman`,
      name: "Dr. Jennifer Berman",
      givenName: "Jennifer",
      familyName: "Berman",
      honorificPrefix: "Dr.",
      honorificSuffix: "MD",
      jobTitle: "Urologist",
      description:
        "Internationally recognized urologist, pioneer of female sexual medicine, and founder and director of JRB Medical Wellness in Beverly Hills.",
      knowsAbout: [
        "Menopause",
        "Perimenopause",
        "Hormone therapy",
        "Bioidentical hormone replacement therapy (BHRT)",
        "Female sexual dysfunction",
        "Female urology",
        "Pelvic floor and urinary health",
        "Vaginal rejuvenation",
      ],
      award: "Two-time New York Times best-selling author",
      image: `${siteUrl}/images/dr-berman/headshot-portrait.jpg`,
      url: siteUrl,
      worksFor: {
        "@id": `${siteUrl}/#medical-business`,
      },
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "Boston University",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "University of Maryland",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "UCLA",
        },
      ],
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Doctor of Medicine (MD)",
      },
      sameAs: [
        "https://en.wikipedia.org/wiki/Jennifer_Berman",
        "https://twitter.com/jenbermanmd",
      ],
    },
    {
      "@type": "MedicalBusiness",
      "@id": `${siteUrl}/#medical-business`,
      name: "JRB Medical Wellness",
      url: siteUrl,
      image: `${siteUrl}/images/dr-berman/headshot-portrait.jpg`,
      telephone: "+1-310-772-0072",
      email: "info@bermanwomenswellness.com",
      medicalSpecialty: [
        "https://schema.org/Urologic",
        "https://schema.org/Gynecologic",
      ],
      knowsAbout: [
        "Menopause and perimenopause care",
        "Female sexual medicine",
        "Bioidentical hormone therapy",
        "Peptide therapy",
        "Pelvic and urinary health",
        "Women's wellness",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "415 N. Crescent Drive, Suite 355",
        addressLocality: "Beverly Hills",
        addressRegion: "CA",
        postalCode: "90210",
        addressCountry: "US",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "17:00",
        },
      ],
      founder: {
        "@id": `${siteUrl}/#dr-jennifer-berman`,
      },
      parentOrganization: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const gaInitScript = gaMeasurementId
    ? `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      gtag("js", new Date());
      gtag("config", ${JSON.stringify(gaMeasurementId)}, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `
    : null;

  return (
    <html
      lang="en"
      className={cn(
        "text-text-primary",
        cormorant.variable,
        inter.variable,
        dmMono.variable,
        "font-sans",
      )}
    >
      <head>
        <link
          rel="preload"
          href="/images/jb-logo.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/cormorant-hero-300.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cormorant-hero-300-italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="min-h-screen font-inter antialiased"
        data-motion="on"
        data-accent="blush"
      >
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
        />
        {gtmId ? (
          <Script
            id="gtm-loader"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        ) : null}
        {gaMeasurementId && gaInitScript ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: gaInitScript }}
            />
          </>
        ) : null}
        <LeadCaptureProvider>{children}</LeadCaptureProvider>
      </body>
    </html>
  );
}
