import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = SITE_URL || new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Disallow: /admin",
          "Disallow: /reset-password",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
