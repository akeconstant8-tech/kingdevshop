import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProducts, type Product } from "@/lib/products.functions";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButtons } from "@/components/AddToCartButtons";
import { formatFcfa } from "@/lib/order-logic";
import { pageHead, productListJsonLd, withJsonLd } from "@/lib/seo";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/collection")({
  // Loaded on the server so the HTML sent to Google already lists the products.
  loader: async () => ({ products: await listProducts().catch(() => [] as Product[]) }),
  head: ({ loaderData }) => {
    const head = pageHead({
      title: "Collection de draps et parures — King Dev Shop",
      description: "Toute la collection King Dev Shop : parures de draps 2 places, 4 et 6 pièces, de 8 500 à 13 000 FCFA. Livraison partout en Côte d'Ivoire.",
      path: "/collection",
    });
    const products = loaderData?.products ?? [];
    return products.length ? withJsonLd(head, productListJsonLd(products)) : head;
  },
  component: Collection,
});

function Collection() {
  const initial = Route.useLoaderData();
  const fetchFn = useServerFn(listProducts);
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: () => fetchFn(), initialData: initial.products, staleTime: 30_000 });
  const [active, setActive] = useState<string>("Tous");

  const filters = useMemo<string[]>(() => ["Tous", ...Array.from(new Set(products.map((p: Product) => p.collection)))], [products]);
  const items = active === "Tous" ? products : products.filter((p: Product) => p.collection === active);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <header className="max-w-3xl">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">Collection</span>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Le linge d'un règne</h1>
        <p className="mt-4 text-muted-foreground">
          Chaque pièce est conçue pour durer, vieillir avec grâce et apporter à votre lit
          un confort souverain, nuit après nuit.
        </p>
      </header>

      {filters.length > 1 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              aria-pressed={active === f}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                active === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="mt-16 text-center text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Aucun produit dans cette collection.</p>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p: Product, index: number) => (
            <article key={p.id} className="group">
              <Link to="/produit/$id" params={{ id: p.id }} className="relative block overflow-hidden rounded-lg bg-white aspect-[4/3]">
                <ProductImage src={p.image_url} alt={p.name} priority={index < 3} className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-wider text-primary">{p.collection}</span>
                {!p.in_stock && (
                  <span className="absolute right-3 top-3 rounded-full bg-destructive px-3 py-1 text-[10px] uppercase tracking-wider text-white">Rupture de stock</span>
                )}
              </Link>
              <div className="mt-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl"><Link to="/produit/$id" params={{ id: p.id }} className="hover:text-primary">{p.name}</Link></h2>
                  <span className="text-sm font-medium whitespace-nowrap">{formatFcfa(p.price)}</span>
                </div>
                {p.material && <p className="mt-1 text-sm text-muted-foreground">{p.material}</p>}
                {p.description && <p className="mt-2 text-sm text-muted-foreground/80">{p.description}</p>}
                <AddToCartButtons product={p} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
