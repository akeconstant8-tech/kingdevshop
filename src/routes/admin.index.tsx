import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listProducts, createProduct, deleteProduct, getMyAdminStatus, bootstrapFirstAdmin, type Product,
} from "@/lib/products.functions";
import { ProductImage } from "@/components/ProductImage";
import { Crown, LogOut, Trash2, Upload, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Administration — King Dev Shop" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const statusFn = useServerFn(getMyAdminStatus);
  const bootstrapFn = useServerFn(bootstrapFirstAdmin);
  const listFn = useServerFn(listProducts);
  const createFn = useServerFn(createProduct);
  const delFn = useServerFn(deleteProduct);

  const { data: status, refetch: refetchStatus } = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn() });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => listFn(), enabled: !!status?.isAdmin });

  const logout = async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); };

  const claim = async () => {
    try { await bootstrapFn(); await refetchStatus(); }
    catch (e: any) { alert(e.message); }
  };

  if (status && !status.isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <Crown className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl">Activer le rôle admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre compte n'est pas encore administrateur. Si vous êtes le premier inscrit, cliquez pour devenir administrateur.
        </p>
        <button onClick={claim} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Devenir administrateur</button>
        <button onClick={logout} className="mt-3 block mx-auto text-xs text-muted-foreground hover:text-primary">Se déconnecter</button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Administration</span>
          <h1 className="mt-1 font-display text-3xl">Gestion de la boutique</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="rounded-full border border-border px-4 py-2 text-sm">Voir le site</Link>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </header>

      <AddProductForm onCreate={async (p) => { await createFn({ data: p }); qc.invalidateQueries({ queryKey: ["products"] }); }} />

      <div className="mt-12">
        <h2 className="font-display text-2xl">Produits ({products.length})</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: Product) => (
            <article key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-secondary">
                <ProductImage src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.collection} • {p.material}</p>
                  </div>
                  <span className="text-sm font-medium">{Number(p.price).toLocaleString("fr-FR")} FCFA</span>
                </div>
                <button onClick={async () => { if (confirm("Supprimer ?")) { await delFn({ data: { id: p.id } }); qc.invalidateQueries({ queryKey: ["products"] }); } }}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                  <Trash2 className="h-3 w-3" /> Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AddProductForm({ onCreate }: { onCreate: (p: any) => Promise<void> }) {
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Signature");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const upload = async (f: File) => {
    setUploading(true);
    try {
      const ext = f.name.split(".").pop() || "jpg";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, f, { upsert: false, contentType: f.type });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (e: any) { setMsg(e.message); } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await onCreate({
        name, collection, price: Number(price), material: material || null,
        description: description || null, image_url: imageUrl || null, in_stock: true,
      });
      setName(""); setPrice(""); setMaterial(""); setDescription(""); setFile(null); setImageUrl("");
      setMsg("Produit ajouté ✓");
    } catch (e: any) { setMsg(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Plus className="h-5 w-5" /> Nouveau produit</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Nom" value={name} onChange={setName} required />
        <Input label="Collection" value={collection} onChange={setCollection} required />
        <Input label="Prix (FCFA)" type="number" value={price} onChange={setPrice} required />
        <Input label="Matière" value={material} onChange={setMaterial} />
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Photo du produit (ordinateur ou téléphone)</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm cursor-pointer hover:border-primary">
              <Upload className="h-4 w-4" />
              {file ? file.name : "Choisir une image"}
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); upload(f); } }} />
            </label>
            {uploading && <span className="text-xs text-muted-foreground">Envoi…</span>}
            {imageUrl && <img src={imageUrl} alt="" className="h-12 w-12 rounded object-cover" />}
          </div>
        </div>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
      <button disabled={saving || uploading} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {saving ? "Enregistrement…" : "Ajouter le produit"}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none" />
    </div>
  );
}
