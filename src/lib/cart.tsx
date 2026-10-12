import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts, type Product } from "@/lib/products.functions";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
  // Deleted from the catalog or out of stock: shown but cannot be ordered.
  unavailable?: boolean;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  hasUnavailable: boolean;
  add: (p: Product) => void;
  buyNow: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "kds_cart_v1";

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
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  // The cart is stored in the browser and can be days old: keep each line in sync with
  // the live catalog (current price, name and image) and flag products that were
  // deleted or went out of stock.
  const listFn = useServerFn(listProducts);
  const { data: catalog } = useQuery({
    queryKey: ["products"],
    queryFn: () => listFn(),
    enabled: hydrated && items.length > 0,
    staleTime: 30_000,
  });
  useEffect(() => {
    if (!catalog) return;
    const byId = new Map(catalog.map((p) => [p.id, p]));
    setItems((prev) => {
      let changed = false;
      const next = prev.map((i) => {
        const p = byId.get(i.id);
        const synced: CartItem = p
          ? { ...i, name: p.name, price: Number(p.price), image_url: p.image_url, unavailable: !p.in_stock }
          : { ...i, unavailable: true };
        if (synced.name !== i.name || synced.price !== i.price || synced.image_url !== i.image_url || synced.unavailable !== i.unavailable) {
          changed = true;
        }
        return synced;
      });
      return changed ? next : prev;
    });
  }, [catalog]);

  const add = (p: Product) => {
    if (!p.in_stock) return;
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, qty: 1 }];
    });
  };
  // "Commander": make sure the product is in the cart (without adding a second one)
  // and open the cart to finish the order.
  const buyNow = (p: Product) => {
    if (!p.in_stock) return;
    setItems((prev) =>
      prev.some((i) => i.id === p.id)
        ? prev
        : [...prev, { id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, qty: 1 }],
    );
    setOpen(true);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => (qty <= 0 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const available = items.filter((i) => !i.unavailable);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = available.reduce((s, i) => s + i.qty * i.price, 0);
  const hasUnavailable = available.length !== items.length;

  return (
    <Ctx.Provider value={{ items, count, total, hasUnavailable, add, buyNow, remove, setQty, clear, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
