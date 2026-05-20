import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import { PasswordField } from "@/components/PasswordField";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Réinitialiser le mot de passe — King Dev Shop" }, { name: "robots", content: "noindex" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setInfo(null); setLoading(true);
    try {
      if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setInfo("Mot de passe mis à jour. Redirection...");
      setTimeout(() => navigate({ to: "/admin" }), 1200);
    } catch (e: any) {
      setErr(e.message ?? "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gradient-royal)] text-primary-foreground">
            <Crown className="h-6 w-6" />
          </span>
        </div>
        <h1 className="mt-6 text-center font-display text-3xl">Nouveau mot de passe</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {ready ? "Choisissez un nouveau mot de passe pour votre compte" : "Validation du lien en cours..."}
        </p>

        {ready && (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <PasswordField label="Nouveau mot de passe" value={password} onChange={setPassword} />
            <PasswordField label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            {info && <p className="text-sm text-primary">{info}</p>}
            <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? "..." : "Mettre à jour le mot de passe"}
            </button>
          </form>
        )}

        <Link to="/admin/login" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">← Retour à la connexion</Link>
      </div>
    </section>
  );
}
