import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/cookie"],
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/network",
          "/network/",
          "/login",
          "/invito-network/",
          "/podcast/invito",
          "/report/",
        ],
      },
    ],
    sitemap: "https://ildispaccio.energy/sitemap.xml",
    host: "https://ildispaccio.energy",
  };
}
