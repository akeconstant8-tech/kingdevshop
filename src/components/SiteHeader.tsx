import { Link } from "@tanstack/react-router";
import { ShoppingBag, Facebook, Music2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/logo-kingdevshop.png";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/collection", label: "Collection" },
  { to: "/contact", label: "Contact" },
  { to: "/a-propos", label: "À propos" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="King Dev Shop" className="h-12 w-12 object-contain" />
          <span className="brand-wordmark text-xl sm:text-2xl">KING DEV SHOP</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-sm font-semibold uppercase tracking-wider text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://www.facebook.com/share/1BB1KvBqSm/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Page Facebook King Dev Shop"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://www.tiktok.com/@king.dav.shop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compte TikTok King Dev Shop"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary"
          >
            <Music2 className="h-4 w-4" />
          </a>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary transition-colors"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button onClick={() => setOpen(!open)} className="lg:hidden text-sm font-medium">
            {open ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-4">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-wider border-b border-border/40 last:border-0">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
