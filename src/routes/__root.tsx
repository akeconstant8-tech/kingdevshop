import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Une erreur est survenue</h1>
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
      { title: "King Dev Shop — Linge de lit royal" },
      { name: "description", content: "Un sommeil doux et réparateur avec King Dev Shop. Draps haut de gamme en coton égyptien, satin et percale." },
      { property: "og:title", content: "King Dev Shop — Linge de lit royal" },
      { property: "og:description", content: "Un sommeil doux et réparateur avec King Dev Shop. Draps haut de gamme en coton égyptien, satin et percale." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "King Dev Shop — Linge de lit royal" },
      { name: "twitter:description", content: "Un sommeil doux et réparateur avec King Dev Shop. Draps haut de gamme en coton égyptien, satin et percale." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5a7b30f7-89d9-4a9b-a806-2d2c1f5a993b/id-preview-e6d10998--0d2e111c-1bb7-4a15-834b-e3f42fc39737.lovable.app-1779206063196.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5a7b30f7-89d9-4a9b-a806-2d2c1f5a993b/id-preview-e6d10998--0d2e111c-1bb7-4a15-834b-e3f42fc39737.lovable.app-1779206063196.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1"><Outlet /></main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
