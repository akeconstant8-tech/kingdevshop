import { createFileRoute } from "@tanstack/react-router";
import { Crown, Gift, Sparkles, Truck, Headphones, Star } from "lucide-react";

export const Route = createFileRoute("/privileges")({
  head: () => ({
    meta: [
      { title: "Gestions Privilégiées — King Dev Shop" },
      { name: "description", content: "Le club privé King Dev Shop : avantages exclusifs, services sur-mesure et privilèges royaux." },
    ],
  }),
  component: Privileges,
});

const tiers = [
  {
    name: "Noble",
    price: "Gratuit",
    perks: ["−5% dès la 2ᵉ commande", "Newsletter privée", "Accès aux ventes flash"],
    featured: false,
  },
  {
    name: "Royal",
    price: "25 000 FCFA / an",
    perks: ["−15% à vie", "Livraison express offerte", "Accès anticipé aux collections", "Emballage cadeau premium"],
    featured: true,
  },
  {
    name: "Couronne",
    price: "Sur invitation",
    perks: ["Confection sur-mesure", "Conseiller dédié 24/7", "Pièces uniques numérotées", "Service de blanchisserie royale"],
    featured: false,
  },
];

function Privileges() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold-foreground">
          <Crown className="h-3.5 w-3.5" /> Cercle Privé
        </span>
        <h1 className="mt-6 font-display text-5xl sm:text-6xl">Gestions Privilégiées</h1>
        <p className="mt-5 text-muted-foreground">
          Rejoignez le cercle des clients royaux et accédez à un univers d'avantages exclusifs,
          conçus pour celles et ceux qui n'acceptent que l'excellence.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-3 lg:px-10">
        {tiers.map((t) => (
          <article
            key={t.name}
            className={`relative rounded-2xl border p-8 ${
              t.featured
                ? "border-gold bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                : "border-border bg-card"
            }`}
          >
            {t.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gradient-gold)] px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-foreground">
                Le plus choisi
              </span>
            )}
            <h3 className="font-display text-3xl">{t.name}</h3>
            <p className={`mt-2 text-sm ${t.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t.price}</p>
            <ul className="mt-8 space-y-3 text-sm">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Star className={`mt-0.5 h-4 w-4 shrink-0 ${t.featured ? "text-gold" : "text-gold"}`} strokeWidth={1.5} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <button className={`mt-10 w-full rounded-full py-3 text-sm font-medium ${
              t.featured
                ? "bg-gold text-gold-foreground hover:opacity-90"
                : "border border-primary hover:bg-primary hover:text-primary-foreground"
            }`}>
              Choisir {t.name}
            </button>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-6 lg:px-10">
        <h2 className="font-display text-4xl text-center">Vos privilèges en un coup d'œil</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gift, t: "Cadeaux exclusifs", d: "Présents royaux à chaque anniversaire" },
            { icon: Truck, t: "Livraison royale", d: "Express et offerte dès le rang Royal" },
            { icon: Sparkles, t: "Accès anticipé", d: "Découvrez les collections en avant-première" },
            { icon: Headphones, t: "Conseiller dédié", d: "Un interlocuteur unique à votre service" },
          ].map((p) => (
            <div key={p.t} className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold">
                <p.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 font-display text-lg">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
