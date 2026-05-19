import { useState } from "react";
import { z } from "zod";
import { useCart, buildWhatsAppLink, type CustomerInfo } from "@/lib/cart";
import { X, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(80, "Nom trop long"),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro invalide")
    .max(20, "Numéro trop long")
    .regex(/^[0-9 +().-]+$/, "Numéro invalide"),
  address: z.string().trim().min(5, "Adresse trop courte").max(250, "Adresse trop longue"),
});

export function CartDrawer() {
  const { items, total, open, setOpen, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [form, setForm] = useState<CustomerInfo>({ name: "", phone: "", address: "Bonoua, Carrefour 8 kilos" });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  const close = () => { setOpen(false); setStep("cart"); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CustomerInfo, string>> = {};
      parsed.error.issues.forEach((iss) => {
        const key = iss.path[0] as keyof CustomerInfo;
        if (!fieldErrors[key]) fieldErrors[key] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const url = buildWhatsAppLink(items, total, parsed.data);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden />
      )}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} className="rounded-full p-1.5 hover:bg-secondary" aria-label="Retour">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-display text-xl">
              {step === "cart" ? "Votre panier 🛏️" : "Vos informations 📦"}
            </h2>
          </div>
          <button onClick={close} className="rounded-full p-2 hover:bg-secondary" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "cart" ? (
            items.length === 0 ? (
              <p className="mt-10 text-center text-muted-foreground">
                Votre panier est vide. ✨<br />Ajoutez de beaux draps !
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <div className="h-20 w-16 overflow-hidden rounded bg-secondary shrink-0">
                      <ProductImage src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">{i.name}</p>
                        <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Retirer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{i.price.toLocaleString("fr-FR")} FCFA</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(i.id, i.qty - 1)} className="rounded border border-border p-1 hover:bg-secondary">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} className="rounded border border-border p-1 hover:bg-secondary">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Nom complet" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={80}
                  required
                  placeholder="Ex. Aïcha Koné"
                  className="kds-field"
                />
              </Field>
              <Field label="Numéro de téléphone (WhatsApp)" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={20}
                  required
                  placeholder="Ex. 07 11 25 76 55"
                  className="kds-field"
                />
              </Field>
              <Field label="Adresse de livraison" error={errors.address}>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  maxLength={250}
                  required
                  rows={3}
                  placeholder="Quartier, ville, point de repère…"
                  className="kds-field resize-none"
                />
              </Field>
              <div className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
                📍 Notre point de retrait : <strong>Bonoua, Carrefour 8 kilos</strong>
              </div>
              <style>{`.kds-field{width:100%;border:1px solid var(--color-border);background:var(--color-background);border-radius:.5rem;padding:.65rem .85rem;font-size:.875rem;outline:none;transition:border-color .15s}.kds-field:focus{border-color:var(--color-primary)}`}</style>
            </form>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl">{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
            {step === "cart" ? (
              <>
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90"
                >
                  Continuer la commande →
                </button>
                <button onClick={clear} className="w-full text-xs text-muted-foreground hover:text-destructive">
                  Vider le panier
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Envoyer la commande sur WhatsApp
              </button>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02zM12.04 20.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.77-1.84-.2-.48-.41-.41-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.88 2.4 1 2.56c.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.16-.47-.28z"/>
    </svg>
  );
}
