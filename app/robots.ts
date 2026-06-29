import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/confirm"],
      },
    ],
    sitemap: "https://www.creabeastudio.com/sitemap.xml",
  };
}