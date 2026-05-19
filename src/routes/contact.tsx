import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — King Dev Shop" },
      { name: "description", content: "Contactez la maison King Dev Shop pour toute question ou commande sur-mesure." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:px-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold">Contact</span>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Écrivez à la Maison</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Notre équipe se tient à votre disposition pour vous conseiller, prendre vos commandes
          sur-mesure ou organiser une livraison express.
        </p>

        <ul className="mt-10 space-y-5">
          {[
            { icon: Mail, label: "contact@kingdevshop.com" },
            { icon: Phone, label: "+225 07 11 25 76 55 (WhatsApp commandes)" },
            { icon: MapPin, label: "Bonoua, Carrefour 8 kilos — Côte d'Ivoire" },
          ].map((i) => (
            <li key={i.label} className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold">
                <i.icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="text-sm">{i.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]"
      >
        <div className="grid gap-5">
          <Field label="Nom complet" required><input required className="field" /></Field>
          <Field label="Email" required><input type="email" required className="field" /></Field>
          <Field label="Sujet"><input className="field" /></Field>
          <Field label="Message" required><textarea required rows={5} className="field resize-none" /></Field>
          <button type="submit" className="mt-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            {sent ? "Message envoyé ✓" : "Envoyer le message"}
          </button>
        </div>
      </form>

      <style>{`.field{width:100%;border:1px solid var(--color-border);background:var(--color-background);border-radius:.5rem;padding:.75rem 1rem;font-size:.875rem;outline:none;transition:border-color .2s}.field:focus{border-color:var(--color-gold)}`}</style>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-gold"> *</span>}
      </span>
      {children}
    </label>
  );
}
