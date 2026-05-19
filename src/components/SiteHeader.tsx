import { Link } from "@tanstack/react-router";
import { Crown, ShoppingBag } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/collection", label: "Collection" },
  { to: "/contact", label: "Contact" },
  { to: "/a-propos", label: "À propos" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gradient-royal)] text-primary-foreground shadow-[var(--shadow-soft)]">
            <Crown className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">King Dev Shop</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Linge Royal</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary [&>span]:scale-x-100" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary transition-colors">
            <ShoppingBag className="h-4 w-4" />
            Panier
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
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-3 text-sm font-medium border-b border-border/40 last:border-0">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
