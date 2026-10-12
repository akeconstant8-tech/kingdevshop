import { createFileRoute } from "@tanstack/react-router";
import { listProducts } from "@/lib/products.functions";
import { SITE_URL } from "@/lib/seo";

const STATIC_PAGES = ["/", "/collection", "/temoignages", "/contact", "/a-propos"];

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = SITE_URL || new URL(request.url).origin;
        const products = await listProducts().catch(() => []);
        const urls = [...STATIC_PAGES, ...products.map((p) => `/produit/${p.id}`)];
        const body = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`),
          `</urlset>`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
