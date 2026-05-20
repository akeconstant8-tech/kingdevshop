import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Quote, MessageCircle } from "lucide-react";
import { listPublicTestimonials } from "@/lib/admin.functions";

export const Route = createFileRoute("/temoignages")({
  head: () => ({
    meta: [
      { title: "Témoignages — King Dev Shop" },
      { name: "description", content: "Découvrez les avis de nos clients satisfaits." },
    ],
  }),
  component: TemoignagesPage,
});

type T = { id: string; name: string; location: string | null; text: string; rating: number };

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: T }) {
  return (
    <div className="min-w-[340px] sm:min-w-[400px] rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <StarRating count={t.rating} />
        <Quote className="h-5 w-5 text-primary/40" />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
      <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">Client · {t.location ?? ""}</p>
        </div>
      </div>
    </div>
  );
}

function TemoignagesPage() {
  const fn = useServerFn(listPublicTestimonials);
  const { data: testimonials = [] } = useQuery({ queryKey: ["public-testimonials"], queryFn: () => fn() });
  const list = testimonials as T[];
  const doubled = list.length ? [...list, ...list, ...list] : [];

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <header className="max-w-3xl text-center mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Témoignages</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl">Ce que nos clients disent</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Des milliers de clients nous font confiance chaque jour. Voici leurs retours authentiques sur nos draps et notre service.
          </p>
        </header>
      </section>

      {list.length > 0 && (
        <>
          <section className="relative overflow-hidden py-6">
            <div className="marquee-track flex gap-6 w-max">
              {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
            </div>
          </section>
          <section className="relative overflow-hidden py-6">
            <div className="marquee-track-reverse flex gap-6 w-max">
              {[...doubled].reverse().map((t, i) => <TestimonialCard key={i} t={t} />)}
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl">Vous aussi, faites-nous confiance</h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Rejoignez nos milliers de clients satisfaits et transformez vos nuits avec nos draps de qualité.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/collection" className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:translate-y-[-2px]">
            Voir la collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-sm font-semibold uppercase tracking-wider hover:border-primary">
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  );
}
