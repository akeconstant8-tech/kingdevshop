import { createFileRoute } from "@tanstack/react-router";
import aboutHero from "@/assets/about-hero.jpg";
import logo from "@/assets/logo-kingdevshop.png";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — King Dev Shop" },
      { name: "description", content: "King Dev Shop, boutique en ligne à Bonoua, parures de draps 6 et 4 pièces livrées partout en Côte d'Ivoire." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <img src={logo} alt="King Dev Shop" className="mx-auto h-20 w-20 object-contain" />
        <span className="mt-6 block text-xs uppercase tracking-[0.3em] text-primary">À propos</span>
        <h1 className="brand-wordmark mt-3 text-4xl sm:text-5xl lg:text-6xl">KING DEV SHOP</h1>
        <p className="mt-6 font-serif italic text-lg text-foreground/80">
          Un sommeil doux et réparateur, signé King Dev Shop. 🛏️
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-10">
        <img src={aboutHero} alt="Parure de draps King Dev Shop" width={1600} height={900} loading="lazy" className="aspect-[16/9] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]" />
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2 lg:px-10">
        <div>
          <h2 className="font-display text-3xl">Qui sommes-nous</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            King Dev Shop est une boutique en ligne basée à <strong className="text-foreground">Bonoua</strong>,
            spécialisée dans la vente de draps confortables et abordables. Nous sélectionnons
            pour vous des parures complètes de <strong className="text-foreground">6 pièces</strong> et
            de <strong className="text-foreground">4 pièces</strong>, livrées partout en Côte d'Ivoire.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl">Nos engagements</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Qualité</strong> — Des tissus doux et résistants.</li>
            <li><strong className="text-foreground">Prix juste</strong> — Parures 6 pièces à 13 000 FCFA.</li>
            <li><strong className="text-foreground">Prix juste</strong> — Parures 4 pièces à 10 000 FCFA.</li>
            
            <li><strong className="text-foreground">Prix juste</strong> — Livraison rapide à prix doux dans toute la Côte d'Ivoire.</li>
            <li><strong className="text-foreground">Service client</strong> — Commande simple via WhatsApp.</li>
          </ul>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3 lg:px-10">
          {[
            { n: "01", t: "Choisissez", d: "Parcourez notre collection en ligne." },
            { n: "02", t: "Commandez", d: "Validez votre panier et envoyez-le par WhatsApp." },
            { n: "03", t: "Recevez", d: "Livraison rapide à l'adresse de votre choix." },
          ].map((s) => (
            <div key={s.n}>
              <span className="font-display text-5xl text-primary">{s.n}</span>
              <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
