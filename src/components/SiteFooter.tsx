import { Link } from "@tanstack/react-router";
import { Facebook } from "lucide-react";
import logo from "@/assets/logo-kingdevshop.png";

const FACEBOOK_URL = "https://www.facebook.com/share/1BB1KvBqSm/";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={logo} alt="King Dev Shop" className="h-12 w-12 object-contain brightness-0 invert" />
              <span className="font-display text-2xl font-extrabold tracking-[0.18em]">KING DEV SHOP</span>
            </div>
            <p className="mt-6 max-w-md text-base text-primary-foreground/85">
              Un sommeil doux et réparateur avec King Dev Shop.
            </p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivez-nous sur Facebook"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur transition hover:border-primary-foreground/70 hover:bg-primary-foreground/20"
            >
              <Facebook className="h-4 w-4" />
              Suivez-nous sur Facebook
            </a>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/70">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/" className="hover:text-primary-foreground">Accueil</Link></li>
              <li><Link to="/collection" className="hover:text-primary-foreground">Collection</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground">Contact</Link></li>
              <li><Link to="/a-propos" className="hover:text-primary-foreground">À propos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-primary-foreground/70">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>contact@kingdevshop.com</li>
              <li>WhatsApp : +225 07 11 25 76 55</li>
              <li>Bonoua, Carrefour 8 kilos</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} King Dev Shop. Tous droits réservés.</span>
          <Link to="/admin/login" className="hover:text-primary-foreground tracking-wider">ESPACE ADMIN</Link>
        </div>
      </div>
    </footer>
  );
}
