import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import { PasswordField } from "@/components/PasswordField";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Espace Admin — King Dev Shop" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => { setErr(null); setInfo(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      if (mode === "signup") {
        if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setInfo("Email de réinitialisation envoyé. Vérifiez votre boîte de réception.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("Session non créée. Réessayez.");
        window.location.assign("/admin");
      }
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
        <h1 className="mt-6 text-center font-display text-3xl">
          {mode === "forgot" ? "Mot de passe oublié" : "Espace Administrateur"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "login" && "Connectez-vous pour gérer la boutique"}
          {mode === "signup" && "Créer le compte administrateur"}
          {mode === "forgot" && "Entrez votre email pour recevoir un lien de réinitialisation"}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>

          {mode !== "forgot" && (
            <>
              <PasswordField
                label="Mot de passe"
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              {mode === "signup" && (
                <PasswordField
                  label="Confirmer le mot de passe"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
              )}
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); reset(); }}
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </>
          )}

          {err && <p className="text-sm text-destructive">{err}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {loading ? "..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer le compte" : "Envoyer le lien"}
          </button>
        </form>

        {mode === "forgot" ? (
          <button onClick={() => { setMode("login"); reset(); }} className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-primary">
            ← Retour à la connexion
          </button>
        ) : (
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); reset(); setConfirm(""); }} className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-primary">
            {mode === "login" ? "Première fois ? Créer le compte admin" : "Déjà un compte ? Se connecter"}
          </button>
        )}

        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary">← Retour au site</Link>
      </div>
    </section>
  );
}
