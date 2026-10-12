// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
// Builds go through Nitro, which detects Vercel on its own (VERCEL=1) and otherwise
// targets Cloudflare like Lovable does: no Vercel-specific setting is needed here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Local runs: server code reads SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY from process.env,
// which only Lovable Cloud injects. Load them from .env (already-set variables win).
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
