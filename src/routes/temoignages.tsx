import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, Star, Quote, MessageCircle, Upload, Check } from "lucide-react";
import { listPublicTestimonials, submitTestimonial } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { TESTIMONIAL_PHOTOS_BUCKET } from "@/lib/images";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/temoignages")({
  loader: async () => ({ testimonials: await listPublicTestimonials().catch(() => []) }),
  head: () => pageHead({
    title: "Avis clients et témoignages — King Dev Shop",
    description: "Découvrez les avis de nos clients satisfaits partout en Côte d'Ivoire et partagez votre propre expérience King Dev Shop.",
    path: "/temoignages",
  }),
  component: TemoignagesPage,
});

type T = { id: string; name: string; location: string | null; text: string; rating: number; photo_url: string | null };

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

function Avatar({ t }: { t: T }) {
  if (t.photo_url) {
    return <img src={t.photo_url} alt={t.name} loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30" />;
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
      {t.name.charAt(0).toUpperCase()}
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
      <p className="font-serif italic text-base leading-relaxed text-foreground/80">"{t.text}"</p>
      <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
        <Avatar t={t} />
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">Client · {t.location ?? "Côte d'Ivoire"}</p>
        </div>
      </div>
    </div>
  );
}

function SubmitForm() {
  const qc = useQueryClient();
  const submitFn = useServerFn(submitTestimonial);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const upload = async (original: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(original.type)) { setMsg({ ok: false, text: "Format non supporté (JPG, PNG, WEBP ou GIF)." }); return; }
    setUploading(true); setMsg(null);
    try {
      const f = await compressImage(original, 800);
      if (f.size > 5 * 1024 * 1024) { setMsg({ ok: false, text: "Image trop lourde (max 5 Mo)." }); return; }
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(TESTIMONIAL_PHOTOS_BUCKET).upload(path, f, { upsert: false, contentType: f.type });
      if (error) throw error;
      const { data } = supabase.storage.from(TESTIMONIAL_PHOTOS_BUCKET).getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } catch (e: any) { setMsg({ ok: false, text: e.message ?? "Échec de l'envoi." }); }
    finally { setUploading(false); }
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await submitFn({ data: { name, location: location || null, text, rating, photo_url: photoUrl || null } });
      setName(""); setLocation(""); setText(""); setRating(5); setPhotoUrl("");
      setMsg({ ok: true, text: "Merci ! Votre témoignage sera publié après validation." });
      qc.invalidateQueries({ queryKey: ["public-testimonials"] });
    } catch (e: any) { setMsg({ ok: false, text: e.message ?? "Échec de l'envoi." }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-3xl">Partagez votre expérience</h2>
      <p className="mt-2 text-sm text-muted-foreground">Votre témoignage sera publié après validation par notre équipe.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Prénom *</label>
          <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Ville</label>
          <input maxLength={120} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Abidjan, Bouaké…"
            className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Note</label>
        <div className="mt-2 flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button type="button" key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} className="p-1">
              <Star className={`h-7 w-7 transition ${(hover || rating) >= n ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Votre témoignage *</label>
        <textarea required minLength={5} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} rows={4}
          className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
      </div>

      <div className="mt-4">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Photo (facultatif)</label>
        <div className="mt-2 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm cursor-pointer hover:border-primary">
            <Upload className="h-4 w-4" />
            {photoUrl ? "Changer la photo" : "Choisir une photo"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
          </label>
          {uploading && <span className="text-xs text-muted-foreground">Envoi…</span>}
          {photoUrl && <img src={photoUrl} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/30" />}
        </div>
      </div>

      {msg && (
        <p className={`mt-4 inline-flex items-center gap-2 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>
          {msg.ok && <Check className="h-4 w-4" />} {msg.text}
        </p>
      )}

      <button disabled={saving || uploading} className="mt-6 rounded-full bg-primary px-7 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-elegant)] disabled:opacity-50 transition hover:translate-y-[-1px]">
        {saving ? "Envoi…" : "Envoyer mon témoignage"}
      </button>
    </form>
  );
}

function TemoignagesPage() {
  const initial = Route.useLoaderData();
  const fn = useServerFn(listPublicTestimonials);
  const { data: testimonials = [] } = useQuery({ queryKey: ["public-testimonials"], queryFn: () => fn(), initialData: initial.testimonials, staleTime: 30_000 });
  const list = testimonials as T[];

  const cities = useMemo(() => {
    const set = new Set<string>();
    list.forEach((t) => { if (t.location && t.location.trim()) set.add(t.location.trim()); });
    return ["Toutes", ...Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))];
  }, [list]);
  const [city, setCity] = useState("Toutes");
  const filtered = city === "Toutes" ? list : list.filter((t) => (t.location ?? "").trim() === city);
  const doubled = filtered.length ? [...filtered, ...filtered, ...filtered] : [];

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <header className="max-w-3xl text-center mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Témoignages</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl">Ce que nos clients disent</h1>
          <p className="mt-4 font-serif italic text-muted-foreground max-w-xl mx-auto">
            Des milliers de clients nous font confiance. Voici leurs retours authentiques sur nos draps et notre service.
          </p>
        </header>

        {cities.length > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {cities.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${city === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}>
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {filtered.length > 0 ? (
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
      ) : (
        <p className="text-center text-muted-foreground pb-10">Aucun témoignage pour cette ville pour le moment.</p>
      )}

      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
        <SubmitForm />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl">Vous aussi, faites-nous confiance</h2>
        <p className="mt-4 font-serif italic text-muted-foreground max-w-lg mx-auto">
          Rejoignez nos milliers de clients satisfaits et transformez vos nuits avec nos draps de qualité.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
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
