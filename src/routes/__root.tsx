import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import logo from "@/assets/logo-kingdevshop.png";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@400;700;900&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;0,6..96,800;0,6..96,900;1,6..96,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Italiana&family=Pinyon+Script&family=Tenor+Sans&family=Jost:wght@300;400;500;600;700&display=swap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <p className="mt-4 text-muted-foreground">Cette page n'existe pas.</p>
        <a href="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Retour à l'accueil</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">La page n'a pas pu s'afficher. Réessayez dans un instant.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Réessayer</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "King Dev Shop — Linge de lit" },
      { name: "description", content: "Un sommeil doux et réparateur avec King Dev Shop. Parures de draps 6 pièces à 13 000 FCFA." },
      { property: "og:title", content: "King Dev Shop — Linge de lit" },
      { property: "og:description", content: "Un sommeil doux et réparateur avec King Dev Shop. Parures de draps 6 pièces à 13 000 FCFA." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "King Dev Shop — Linge de lit" },
      { name: "twitter:description", content: "Un sommeil doux et réparateur avec King Dev Shop. Parures de draps 6 pièces à 13 000 FCFA." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5a7b30f7-89d9-4a9b-a806-2d2c1f5a993b/id-preview-e6d10998--0d2e111c-1bb7-4a15-834b-e3f42fc39737.lovable.app-1779206063196.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5a7b30f7-89d9-4a9b-a806-2d2c1f5a993b/id-preview-e6d10998--0d2e111c-1bb7-4a15-834b-e3f42fc39737.lovable.app-1779206063196.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      // Google Fonts are linked here rather than @imported in styles.css: the
      // lightningcss transformer cannot inline remote @import rules.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: GOOGLE_FONTS_URL },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logo },
      { rel: "apple-touch-icon", href: logo },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1"><Outlet /></main>
          <SiteFooter />
        </div>
        <CartDrawer />
      </CartProvider>
    </QueryClientProvider>
  );
}
