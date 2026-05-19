import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProducts, type Product } from "@/lib/products.functions";
import { ProductImage } from "@/components/ProductImage";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection — King Dev Shop" },
      { name: "description", content: "Découvrez toute la collection de draps royaux King Dev Shop." },
    ],
  }),
  component: Collection,
});

function Collection() {
  const fetchFn = useServerFn(listProducts);
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: () => fetchFn() });
  const { add } = useCart();
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
          {items.map((p: Product) => (
            <article key={p.id} className="group">
              <div className="relative overflow-hidden rounded-lg bg-secondary aspect-[4/5]">
                <ProductImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-wider text-primary">{p.collection}</span>
              </div>
              <div className="mt-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <span className="text-sm font-medium whitespace-nowrap">{Number(p.price).toLocaleString("fr-FR")} FCFA</span>
                </div>
                {p.material && <p className="mt-1 text-sm text-muted-foreground">{p.material}</p>}
                {p.description && <p className="mt-2 text-sm text-muted-foreground/80">{p.description}</p>}
                <button
                  onClick={() => add(p)}
                  className="mt-4 w-full rounded-full border border-primary py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  🛏️ Ajouter au panier
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
