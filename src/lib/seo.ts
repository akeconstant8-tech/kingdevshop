// Page metadata helpers: title, description, Open Graph, canonical URL and JSON-LD.
// Set VITE_SITE_URL (e.g. https://www.kingdevshop.com) so canonical URLs are absolute;
// without it they stay relative, which search engines accept but rank less reliably.

export const SITE_NAME = "King Dev Shop";
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "").replace(/\/+$/, "");
export const DEFAULT_SHARE_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5a7b30f7-89d9-4a9b-a806-2d2c1f5a993b/id-preview-e6d10998--0d2e111c-1bb7-4a15-834b-e3f42fc39737.lovable.app-1779206063196.png";

export const SHOP_PHONE = "+2250711257655";
export const FACEBOOK_URL = "https://www.facebook.com/share/1BB1KvBqSm/";
export const TIKTOK_URL = "https://www.tiktok.com/@king.dav.shop";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

type PageMeta = { title: string; description: string; path: string; image?: string; type?: string };

export function pageHead({ title, description, path, image = DEFAULT_SHARE_IMAGE, type = "website" }: PageMeta) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "fr_CI" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

// Appends JSON-LD blocks to a page head. TanStack renders `{ "script:ld+json": … }` meta
// entries as escaped <script type="application/ld+json"> tags; its React typings do
// not list that shape, hence the cast.
export function withJsonLd<T extends { meta: object[] }>(head: T, ...blocks: object[]): T {
  return { ...head, meta: [...head.meta, ...blocks.map((block) => ({ "script:ld+json": block }) as never)] };
}

export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    image: DEFAULT_SHARE_IMAGE,
    telephone: SHOP_PHONE,
    priceRange: "8 500 – 13 000 FCFA",
    currenciesAccepted: "XOF",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrefour 8 kilos",
      addressLocality: "Bonoua",
      addressCountry: "CI",
    },
    areaServed: "Côte d'Ivoire",
    sameAs: [FACEBOOK_URL, TIKTOK_URL],
  };
}

type SeoProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  collection: string;
  in_stock: boolean;
};

export function productJsonLd(p: SeoProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? `${p.name} — ${p.collection}`,
    image: p.image_url ? [p.image_url] : undefined,
    sku: p.id,
    category: p.collection,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/produit/${p.id}`),
      priceCurrency: "XOF",
      price: Number(p.price),
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export function productListJsonLd(products: SeoProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/produit/${p.id}`),
      name: p.name,
    })),
  };
}
