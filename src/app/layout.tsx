import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://progressjogja.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Progress Jogja - Produk Herbal dan Tradisional Berkualitas",
    template: "%s | Progress Jogja"
  },
  description: "Temukan produk herbal dan minuman tradisional berkualitas tinggi dari Progress Jogja. Menghadirkan kesehatan alami dengan cita rasa autentik Indonesia.",
  keywords: [
    "Progress Jogja",
    "produk herbal",
    "minuman tradisional",
    "herbal Indonesia",
    "kesehatan alami",
    "jamu tradisional",
    "produk organik",
    "Yogyakarta",
    "UMKM Indonesia"
  ],
  authors: [{ name: "Progress Jogja" }],
  creator: "Progress Jogja",
  publisher: "Progress Jogja",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "E-commerce",
  classification: "Business",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Progress Jogja",
    title: "Progress Jogja - Produk Herbal dan Tradisional Berkualitas",
    description: "Temukan produk herbal dan minuman tradisional berkualitas tinggi dari Progress Jogja. Menghadirkan kesehatan alami dengan cita rasa autentik Indonesia.",
    images: [
      {
        url: `${BASE_URL}/progressjogja-logo.webp`,
        width: 1200,
        height: 630,
        alt: "Progress Jogja Logo",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Progress Jogja - Produk Herbal dan Tradisional Berkualitas",
    description: "Temukan produk herbal dan minuman tradisional berkualitas tinggi dari Progress Jogja.",
    images: [`${BASE_URL}/progressjogja-logo.webp`],
    creator: "@progressjogja",
    site: "@progressjogja",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "id-ID": BASE_URL,
      "id": BASE_URL,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    other: {
      me: [BASE_URL],
    },
  },
  manifest: `${BASE_URL}/manifest.json`,
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Progress Jogja",
    "application-name": "Progress Jogja",
    "msapplication-TileColor": "#dc2626",
    "msapplication-config": `${BASE_URL}/browserconfig.xml`,
    "theme-color": "#dc2626",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const midtransSnapUrl = isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <html lang="id" dir="ltr">
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="SeU7j1p_RghwijQK39HcGyU9L5su7-xhodHrPXhE2Xs" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://snpygntfpumljzhikwym.supabase.co" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/progressjogja-logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/progressjogja-logo.webp" />
        <link rel="mask-icon" href="/progressjogja-logo.webp" color="#dc2626" />
        
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Progress Jogja" />
        <meta name="application-name" content="Progress Jogja" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="theme-color" content="#dc2626" />
        
        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Progress Jogja",
              url: BASE_URL,
              logo: `${BASE_URL}/progressjogja-logo.webp`,
              description: "Produk herbal dan minuman tradisional berkualitas tinggi dari Yogyakarta",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Yogyakarta",
                addressCountry: "Indonesia",
              },
              sameAs: [
                // Add your social media URLs here
              ],
            }),
          }}
        />
        
        {/* Midtrans script */}
        <Script
          type="text/javascript"
          src={midtransSnapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}