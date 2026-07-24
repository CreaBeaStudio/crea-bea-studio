import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // ── PUBLIC ASSETS (2026-07-17): example-page comparison images (and,
  // once migrated, coloring-page assets) live in a public GCS bucket
  // instead of /public, to avoid baking large binary files into git
  // history. next/image refuses to optimize external sources unless
  // the hostname is explicitly allow-listed here. pathname is scoped to
  // this one bucket's name, not just the hostname, so this doesn't
  // accidentally allow-list every public GCS bucket on the internet.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/crea-bea-public-assets/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
