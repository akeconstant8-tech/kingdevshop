import { createFileRoute, Link } from "@tanstack/react-router";
import heroBed from "@/assets/hero-bed.jpg";
import { products } from "@/lib/products";
import { ArrowRight, Crown, Sparkles, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "King Dev Shop — Linge de lit royal pour un sommeil réparateur" },
      { name: "description", content: "Draps de luxe en coton égyptien, satin et percale. Un sommeil doux et réparateur avec King Dev Shop." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold-foreground">
              <Crown className="h-3.5 w-3.5" /> Maison de Linge Royal
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Le confort d'un<br />
              <span className="italic text-primary">palace</span>, <span className="bg-[var(--gradient-gold)] bg-clip-text text-transparent">chez vous.</span>
            </h1>
            <p className="mt-6 max-w-lg font-display text-xl italic text-muted-foreground">
              « Un sommeil doux et réparateur avec King Dev Shop. »
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Découvrez notre collection de draps d'exception, tissés dans les plus nobles fibres
              et finis à la main pour transformer chaque nuit en un instant royal.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/collection" className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:translate-y-[-2px]">
                Explorer la collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/a-propos" className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-sm font-medium hover:border-gold">
                Notre histoire
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { k: "12K+", v: "Clients royaux" },
                { k: "100%", v: "Coton noble" },
                { k: "4.9/5", v: "Satisfaction" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl">{s.k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[var(--gradient-gold)] opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)]">
              <img src={heroBed} alt="Lit royal habillé de draps King Dev Shop" width={1600} height={1000} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden sm:flex flex-col gap-1 rounded-xl border border-border bg-card px-6 py-4 shadow-lg">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Édition Signature</span>
              <span className="font-display text-lg">Coton 800 fils</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISES */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          {[
            { icon: Sparkles, t: "Fibres nobles", d: "Coton égyptien, satin et percale longue fibre" },
            { icon: ShieldCheck, t: "Qualité certifiée", d: "Tissages contrôlés et finitions main" },
            { icon: Truck, t: "Livraison soignée", d: "Emballage cadeau offert dès 50 000 FCFA" },
          ].map((p) => (
            <div key={p.t} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
                <p.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-display text-lg">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Sélection</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Pièces emblématiques</h2>
          </div>
          <Link to="/collection" className="inline-flex items-center gap-2 text-sm font-medium hover:text-gold">
            Voir toute la collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <article key={p.id} className="group">
              <div className="relative overflow-hidden rounded-lg bg-secondary">
                <img src={p.image} alt={p.name} loading="lazy" width={800} height={1000} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{p.collection}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.material}</p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{p.price.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-10">
          <Crown className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <blockquote className="mt-8 font-display text-3xl italic leading-snug sm:text-4xl">
            « Depuis que je dors dans les draps King Dev Shop, j'ai l'impression de m'endormir dans un palais. »
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gold">— Aïcha K., Abidjan</p>
        </div>
      </section>
    </>
  );
}
