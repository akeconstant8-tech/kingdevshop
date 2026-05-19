import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Crown className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="font-display text-xl font-semibold">King Dev Shop</span>
            </div>
            <p className="mt-6 max-w-md font-display italic text-lg text-primary-foreground/80">
              « Un sommeil doux et réparateur avec King Dev Shop. »
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              <li><Link to="/" className="hover:text-gold">Accueil</Link></li>
              <li><Link to="/collection" className="hover:text-gold">Collection</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
              <li><Link to="/a-propos" className="hover:text-gold">À propos</Link></li>
              <li><Link to="/privileges" className="hover:text-gold">Privilèges</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              <li>contact@kingdevshop.com</li>
              <li>+225 07 00 00 00 00</li>
              <li>Abidjan, Côte d'Ivoire</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} King Dev Shop. Tous droits réservés.</span>
          <span className="tracking-wider">CONFECTIONNÉ AVEC SOIN</span>
        </div>
      </div>
    </footer>
  );
}
