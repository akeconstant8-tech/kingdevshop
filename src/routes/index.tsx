import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import heroBed from "@/assets/hero-bed-clean.png";
import logo from "@/assets/logo-kingdevshop.png";
import { listProducts, type Product } from "@/lib/products.functions";
import { getSiteContent } from "@/lib/admin.functions";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Star } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "King Dev Shop — Linge de lit pour un sommeil réparateur" },
      { name: "description", content: "Draps haut de gamme. Un sommeil doux et réparateur avec King Dev Shop." },
    ],
  }),
  component: Home,
});

function Home() {
  const fetchFn = useServerFn(listProducts);
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchFn() });
  const { add, setOpen: setCartOpen } = useCart();
  const featured = products.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <span className="floating-emoji" style={{ top: "8%", left: "4%", ["--r" as any]: "-8deg", animationDelay: "0s" }} aria-hidden>🛏️</span>
        <span className="floating-emoji" style={{ top: "20%", right: "6%", ["--r" as any]: "10deg", animationDelay: "1.2s" }} aria-hidden>🛌</span>
        <span className="floating-emoji" style={{ bottom: "12%", left: "8%", ["--r" as any]: "6deg", animationDelay: "2.4s" }} aria-hidden>✨</span>
        <span className="floating-emoji" style={{ bottom: "20%", right: "10%", ["--r" as any]: "-6deg", animationDelay: "3s" }} aria-hidden>🌙</span>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">

          <div className="flex flex-col justify-center">
            <img src={logo} alt="King Dev Shop" className="h-20 w-20 object-contain" />
            <h1 className="brand-wordmark mt-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl xl:text-8xl">
              KING DEV SHOP
            </h1>
            <p className="slogan-animated mt-6 max-w-lg font-display text-2xl sm:text-3xl font-semibold italic">
              Un sommeil doux et réparateur avec King Dev Shop.
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Découvrez notre collection de draps confortables, pensés pour transformer
              chaque nuit en un moment de pur bien-être. 🛏️ ✨
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/collection" className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:translate-y-[-2px]">
                Explorer la collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-sm font-semibold uppercase tracking-wider hover:border-primary">
                Nous contacter
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[{ k: "12K+", v: "Clients satisfaits" }, { k: "100%", v: "Qualité garantie" }, { k: "4.9/5", v: "Avis clients" }].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl text-primary">{s.k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[var(--gradient-royal)] opacity-10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elegant)] p-6">
              <img src={heroBed} alt="Parure de lit King Dev Shop" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* PROMISES */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          {[
            { icon: Sparkles, t: "Qualité supérieure", d: "Tissus doux, résistants et confortables 🛏️" },
            { icon: ShieldCheck, t: "Satisfait ou remboursé", d: "Garantie qualité sur chaque commande ✨" },
            { icon: Truck, t: "Livraison rapide", d: "Partout en Côte d'Ivoire 🚚" },
          ].map((p) => (
            <div key={p.t} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Sélection</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Nos produits phares</h2>
          </div>
          <Link to="/collection" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-primary">
            Voir toute la collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Aucun produit pour le moment.
            </p>
          )}
          {featured.map((p: Product) => (
            <article key={p.id} className="group">
              <div className="relative overflow-hidden rounded-lg bg-white aspect-[4/5] border border-border">
                <ProductImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-wider text-primary">{p.collection}</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.material}</p>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap text-primary">{Number(p.price).toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => add(p)}
                  className="w-full rounded-full border border-primary py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  🛒 Ajouter au panier
                </button>
                <button
                  onClick={() => { add(p); setCartOpen(true); }}
                  className="w-full rounded-full bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-soft)] transition hover:translate-y-[-1px]"
                >
                  ⚡ Commander
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Témoignages</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Ils nous font confiance</h2>
          </div>
          <Link to="/temoignages" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-primary">
            Voir tous les témoignages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Peniel Djimi", text: "Shalom Homme de Dieu, j'ai reçu le colis, les couleurs sont bien jolies, je suis satisfaite." },
            { name: "Kelly Kouame", text: "...l'expédition qui est arrivé à Bouaké et tout y est à l'intérieur encore merci pour la considération et la confiance." },
            { name: "Pierre Ettien", text: "J'ai été livré. Si je rentre, je te fais un retour sur la qualité. Shalom." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
