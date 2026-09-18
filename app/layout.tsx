import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat"
});

const siteUrl = "https://www.pourproteinwater.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "POUR Protein Water | 10g Protein, Zero Sugar",
    template: "%s | POUR Protein Water"
  },
  description:
    "POUR is a refreshing protein water with 10g protein per 250 ml can, zero sugar, low calories, and real fruit flavour in Guava Chilli, Raw Mango, and Watermelon.",
  keywords: [
    "protein water",
    "POUR protein water",
    "zero sugar protein drink",
    "healthy protein drink",
    "low calorie protein drink",
    "guava chilli drink",
    "raw mango protein water",
    "watermelon protein water"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "POUR Protein Water",
    description: "10g protein. Zero sugar. Low calorie. Real fruit flavour.",
    url: siteUrl,
    siteName: "POUR Protein Water",
    images: [
      {
        url: "/images/Guava Chilli 1.png",
        width: 1024,
        height: 1536,
        alt: "POUR Guava Chilli protein water can with splash"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "POUR Protein Water",
    description: "10g protein per can, zero sugar, low calorie protein water.",
    images: ["/images/Guava Chilli 1.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <SessionProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
        {/* ✅ Google Analytics 4 – replace G-XXXXXXXXXX with your Measurement ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GEHJX13DTZ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){ window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', 'G-GEHJX13DTZ');
          `}
        </Script>
      </body>
    </html>
  );
}
