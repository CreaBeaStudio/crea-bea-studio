import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import ClarityInit from './clarity-init';

export const metadata: Metadata = {
  title: "CreaBeaStudio – Custom Paint by Number",
  description: "Turn your favourite photos into Paint-by-Number colouring pages with a personalised Guangna marker colour palette guide.",
  openGraph: {
    title: "CreaBeaStudio – Custom Paint by Number",
    description: "Turn your favourite photos into Paint-by-Number colouring pages with personalised Guangna marker colours.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ClarityInit />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-PFXB1CJ13C" />
      </body>
    </html>
  );
}