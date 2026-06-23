import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import ClarityInit from './clarity-init';
import { locales } from '../../i18n';

export const metadata: Metadata = {
  title: "CreaBeaStudio – Custom Paint by Number",
  description: "Turn your favourite photos into Paint-by-Number colouring pages with a personalised Guangna marker colour palette guide.",
  openGraph: {
    title: "CreaBeaStudio – Custom Paint by Number",
    description: "Turn your favourite photos into Paint-by-Number colouring pages with personalised Guangna marker colours.",
    images: ["/og-image.png"],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <ClarityInit />
      <Analytics />
      <SpeedInsights />
      <GoogleAnalytics gaId="G-PFXB1CJ13C" />
    </NextIntlClientProvider>
  );
}