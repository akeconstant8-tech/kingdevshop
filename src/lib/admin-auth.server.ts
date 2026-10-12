// Server-side admin check used by every admin server function. It queries with the
// caller's own Supabase client, so the database RLS policies are enforced as well.
export async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Vérification des droits impossible : ${error.message}`);
  if (!data) throw new Error("Accès refusé : réservé aux administrateurs.");
}
