import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

let publicClient: typeof supabaseAdmin | undefined;

// Client for the public storefront server functions. Uses the service role when it is
// configured (Lovable Cloud); otherwise falls back to the publishable key so the site
// also runs locally with only the values from .env — RLS policies then apply.
export function storefrontDb(): typeof supabaseAdmin {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return supabaseAdmin;
  publicClient ??= createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}
