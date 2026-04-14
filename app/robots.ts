import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/profile/", "/admin/", "/employer/", "/seeker/"],
      },
    ],
    sitemap: "https://dasaqmdi.com/sitemap.xml",
  };
}
