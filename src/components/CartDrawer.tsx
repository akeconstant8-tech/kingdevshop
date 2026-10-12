import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/admin.functions";
import {
  DELIVERY_OPTIONS, MAX_QTY_PER_ITEM, buildWhatsAppMessage, customerSchema, findDelivery, formatFcfa,
  newOrderId, orderReference, whatsappUrl, type CustomerInfo,
} from "@/lib/order-logic";
import { X, Minus, Plus, Trash2, ArrowLeft, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

type Step = "cart" | "checkout" | "done";
type Confirmation = { reference: string; total: number; url: string; alreadyRecorded: boolean };

// Opens WhatsApp once the order is saved. Browsers (Safari on iPhone in particular)
// block window.open after an async call; navigating the current tab is never blocked.
function openWhatsApp(url: string) {
  const win = window.open(url, "_blank");
  if (win) {
    try { win.opener = null; } catch {}
    return;
  }
  window.location.href = url;
}

function friendlyOrderError(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  if (err instanceof TypeError || /fetch|network|réseau|load failed/i.test(message)) {
    return "Connexion impossible : vérifiez votre connexion Internet puis réessayez. Votre commande ne sera pas enregistrée deux fois.";
  }
  return message || "Votre commande n'a pas pu être enregistrée. Réessayez dans un instant.";
}

export function CartDrawer() {
  const { items, count, total, hasUnavailable, open, setOpen, setQty, remove, clear } = useCart();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState<CustomerInfo>({ name: "", phone: "", address: "" });
  const [city, setCity] = useState<string>(DELIVERY_OPTIONS[0].city);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const submittingRef = useRef(false);
  const orderIdRef = useRef<{ key: string; id: string } | null>(null);
  const orderFn = useServerFn(createOrder);

  const delivery = findDelivery(city) ?? DELIVERY_OPTIONS[0];
  const grandTotal = total + delivery.fee;

  // Same cart + same city = same order id, so retries after an error never create a
  // second order. Any change to the cart starts a new order.
  const orderKey = `${items.map((i) => `${i.id}:${i.qty}`).join(",")}|${city}`;
  const currentOrderId = () => {
    if (orderIdRef.current?.key !== orderKey) orderIdRef.current = { key: orderKey, id: newOrderId() };
    return orderIdRef.current.id;
  };

  const close = () => {
    setOpen(false);
    setStep("cart");
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
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
    if (hasUnavailable) {
      setSubmitError("Certains articles ne sont plus disponibles : retirez-les du panier avant de commander.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await orderFn({ data: {
        id: currentOrderId(),
        customer: parsed.data,
        delivery_city: delivery.city,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      }});
      // The WhatsApp message uses the prices and total confirmed by the server.
      const url = whatsappUrl(buildWhatsAppMessage(order.orderId, order, parsed.data));
      setConfirmation({ reference: orderReference(order.orderId), total: order.total, url, alreadyRecorded: order.alreadyRecorded });
      orderIdRef.current = null;
      clear();
      setStep("done");
      openWhatsApp(url);
    } catch (err) {
      setSubmitError(friendlyOrderError(err));
      // Prices or stock may have changed: refresh the catalog so the cart shows it.
      qc.invalidateQueries({ queryKey: ["products"] });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const title =
    step === "cart" ? `Votre panier 🛏️ (${count} article${count > 1 ? "s" : ""})`
    : step === "checkout" ? "Vos informations 📦"
    : "Commande enregistrée ✅";

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
        inert={!open}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} disabled={submitting} className="rounded-full p-1.5 hover:bg-secondary" aria-label="Retour">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-display text-xl">{title}</h2>
          </div>
          <button onClick={close} className="rounded-full p-2 hover:bg-secondary" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "done" && confirmation ? (
            <div className="mt-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 font-display text-2xl">Merci pour votre commande !</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Référence <strong className="text-foreground">{confirmation.reference}</strong> — total {formatFcfa(confirmation.total)}.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Envoyez maintenant le récapitulatif sur WhatsApp pour que nous confirmions la livraison.
                Si WhatsApp ne s'est pas ouvert, utilisez le bouton ci-dessous.
              </p>
              <a
                href={confirmation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Ouvrir WhatsApp
              </a>
              <button onClick={close} className="mt-4 w-full text-xs text-muted-foreground hover:text-primary">
                Continuer mes achats
              </button>
            </div>
          ) : step === "cart" ? (
            items.length === 0 ? (
              <p className="mt-10 text-center text-muted-foreground">
                Votre panier est vide. ✨<br />Ajoutez de beaux draps !
              </p>
            ) : (
              <>
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.id} className={`flex gap-3 rounded-lg border p-3 ${i.unavailable ? "border-destructive/50 bg-destructive/5" : "border-border"}`}>
                      <div className="h-20 w-16 overflow-hidden rounded bg-secondary shrink-0">
                        <ProductImage src={i.image_url} alt={i.name} sizes="64px" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm truncate">{i.name}</p>
                          <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Retirer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {i.unavailable ? (
                          <p className="mt-1 text-xs font-medium text-destructive">Plus disponible — retirez cet article pour commander.</p>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground">{formatFcfa(i.price)} · Sous-total {formatFcfa(i.price * i.qty)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <button onClick={() => setQty(i.id, i.qty - 1)} className="rounded border border-border p-1 hover:bg-secondary" aria-label="Diminuer">
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={MAX_QTY_PER_ITEM}
                                value={i.qty}
                                aria-label="Quantité"
                                onChange={(e) => {
                                  const n = parseInt(e.target.value, 10);
                                  if (!Number.isNaN(n)) setQty(i.id, Math.min(MAX_QTY_PER_ITEM, Math.max(1, n)));
                                }}
                                className="w-12 rounded border border-border bg-background px-1 py-0.5 text-center text-sm"
                              />
                              <button
                                onClick={() => setQty(i.id, Math.min(MAX_QTY_PER_ITEM, i.qty + 1))}
                                disabled={i.qty >= MAX_QTY_PER_ITEM}
                                className="rounded border border-border p-1 hover:bg-secondary disabled:opacity-40"
                                aria-label="Augmenter"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-lg border border-border bg-card p-4">
                  <label htmlFor="delivery-city" className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" /> Ville de livraison
                  </label>
                  <select
                    id="delivery-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {DELIVERY_OPTIONS.map((o) => (
                      <option key={o.city} value={o.city}>
                        {o.city} — {formatFcfa(o.fee)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
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
                  autoComplete="name"
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
                  autoComplete="tel"
                  inputMode="tel"
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
                  autoComplete="street-address"
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

        {step !== "done" && items.length > 0 && (
          <footer className="border-t border-border px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{count} article{count > 1 ? "s" : ""}</span>
                <span>{formatFcfa(total)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Livraison ({delivery.city})</span>
                <span>{formatFcfa(delivery.fee)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-medium">Total TTC</span>
                <span className="font-display text-2xl">{formatFcfa(grandTotal)}</span>
              </div>
            </div>
            {submitError && (
              <p role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
              </p>
            )}
            {step === "cart" ? (
              <>
                <button
                  onClick={() => { setSubmitError(null); setStep("checkout"); }}
                  disabled={hasUnavailable}
                  className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50"
                >
                  {hasUnavailable ? "Retirez les articles indisponibles" : "Continuer la commande →"}
                </button>
                <button onClick={clear} className="w-full text-xs text-muted-foreground hover:text-destructive">
                  Vider le panier
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                aria-busy={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {submitting ? "Enregistrement de la commande…" : submitError ? "Réessayer l'envoi" : "Envoyer la commande sur WhatsApp"}
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
