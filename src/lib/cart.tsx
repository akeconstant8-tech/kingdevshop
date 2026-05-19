import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products.functions";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "kds_cart_v1";

// WhatsApp number — format international, sans + ni espaces.
export const WHATSAPP_NUMBER = "2250711257655";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = (p: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, qty: 1 }];
    });
    setOpen(true);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ items, count, total, add, remove, setQty, clear, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export type CustomerInfo = { name: string; phone: string; address: string };

export function buildWhatsAppLink(items: CartItem[], total: number, customer: CustomerInfo) {
  const lines = [
    "*Nouvelle commande — King Dev Shop* 🛏️",
    "",
    "*Client :*",
    `• Nom : ${customer.name}`,
    `• Téléphone : ${customer.phone}`,
    `• Adresse de livraison : ${customer.address}`,
    "",
    "*Articles :*",
    ...items.map((i) => `• ${i.name} × ${i.qty} — ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`),
    "",
    `*Total : ${total.toLocaleString("fr-FR")} FCFA*`,
    "",
    "Merci de me confirmer la disponibilité et le mode de livraison.",
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
