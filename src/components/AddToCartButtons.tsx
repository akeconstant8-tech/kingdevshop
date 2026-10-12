import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products.functions";

// "Ajouter au panier" adds one item and stays on the page; "Commander" makes sure the
// product is in the cart and opens it to finish the order.
export function AddToCartButtons({
  product,
  compact = false,
  className = "mt-4",
}: {
  product: Product;
  compact?: boolean;
  className?: string;
}) {
  const { add, buyNow } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  const size = compact
    ? "py-2.5 text-xs font-semibold uppercase tracking-wider"
    : "py-3 text-sm";

  if (!product.in_stock) {
    return (
      <div className={className}>
        <p className={`w-full rounded-full border border-border bg-secondary/60 text-center text-muted-foreground ${size}`}>
          Rupture de stock
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={() => { add(product); setAdded(true); }}
        aria-live="polite"
        className={`w-full rounded-full border border-primary transition-colors hover:bg-primary hover:text-primary-foreground ${size} ${compact ? "" : "font-medium"}`}
      >
        {added ? "✓ Ajouté au panier" : "🛒 Ajouter au panier"}
      </button>
      <button
        onClick={() => buyNow(product)}
        className={`w-full rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition hover:translate-y-[-1px] ${size} ${compact ? "" : "font-semibold"}`}
      >
        ⚡ Commander
      </button>
    </div>
  );
}
