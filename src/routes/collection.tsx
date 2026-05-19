import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { useState } from "react";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection — King Dev Shop" },
      { name: "description", content: "Découvrez toute la collection de draps royaux King Dev Shop." },
    ],
  }),
  component: Collection,
});

const filters = ["Tous", "Signature", "Romance", "Héritage"] as const;

function Collection() {
  const [active, setActive] = useState<(typeof filters)[number]>("Tous");
  const items = active === "Tous" ? products : products.filter((p) => p.collection === active);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <header className="max-w-3xl">
        <span className="text-xs uppercase tracking-[0.3em] text-gold">Collection</span>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Le linge d'un règne</h1>
        <p className="mt-4 text-muted-foreground">
          Chaque pièce est conçue pour durer, vieillir avec grâce et apporter à votre lit
          un confort souverain, nuit après nuit.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${
              active === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-gold"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <article key={p.id} className="group">
            <div className="relative overflow-hidden rounded-lg bg-secondary">
              <img src={p.image} alt={p.name} loading="lazy" width={800} height={1000} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{p.collection}</span>
            </div>
            <div className="mt-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-xl">{p.name}</h3>
                <span className="text-sm font-medium whitespace-nowrap">{p.price.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.material}</p>
              <button className="mt-4 w-full rounded-full border border-primary py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground">
                Ajouter au panier
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
