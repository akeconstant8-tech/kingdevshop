import { createFileRoute } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import heroBed from "@/assets/hero-bed.jpg";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — King Dev Shop" },
      { name: "description", content: "Découvrez l'histoire et les valeurs de la maison King Dev Shop." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
        <Crown className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
        <span className="mt-6 block text-xs uppercase tracking-[0.3em] text-gold">À propos</span>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">L'héritage d'un sommeil royal</h1>
        <p className="mt-6 font-display text-xl italic text-muted-foreground">
          « Un sommeil doux et réparateur avec King Dev Shop. »
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-10">
        <img src={heroBed} alt="Atelier King Dev Shop" width={1600} height={900} loading="lazy" className="aspect-[16/9] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]" />
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2 lg:px-10">
        <div>
          <h2 className="font-display text-3xl">Notre histoire</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Née d'une passion pour le linge d'exception, King Dev Shop confectionne des
            draps pensés pour celles et ceux qui considèrent leur lit comme un sanctuaire.
            Chaque collection est inspirée par l'élégance des palaces et la douceur des nuits royales.
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl">Nos valeurs</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Excellence</strong> — Fibres nobles, finitions main, contrôles rigoureux.</li>
            <li><strong className="text-foreground">Durabilité</strong> — Des pièces faites pour traverser les années.</li>
            <li><strong className="text-foreground">Service royal</strong> — Une attention privilégiée à chaque commande.</li>
          </ul>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3 lg:px-10">
          {[
            { n: "01", t: "Sélection", d: "Nous choisissons les meilleures fibres au monde." },
            { n: "02", t: "Confection", d: "Des artisans tissent et cousent chaque pièce avec soin." },
            { n: "03", t: "Livraison", d: "Vos draps arrivent dans un écrin digne d'un présent royal." },
          ].map((s) => (
            <div key={s.n}>
              <span className="font-display text-5xl text-gold">{s.n}</span>
              <h3 className="mt-3 font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
