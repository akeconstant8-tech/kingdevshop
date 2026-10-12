import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listProducts, createProduct, updateProduct, deleteProduct, getMyAdminStatus, type Product,
} from "@/lib/products.functions";
import {
  listMessages, markMessageRead, deleteMessage,
  listAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  listOrders, updateOrderStatus, deleteOrder,
  getSiteContent, updateSiteContent, SITE_CONTENT_KEYS,
} from "@/lib/admin.functions";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/images";
import { compressImage } from "@/lib/image-compress";
import { formatFcfa, orderReference } from "@/lib/order-logic";
import { ProductImage } from "@/components/ProductImage";
import {
  Crown, LogOut, Trash2, Upload, Plus, Package, MessageSquare, Star, ShoppingBag, Home as HomeIcon,
  Check, EyeOff, ImagePlus, ImageOff, X, Pencil, PackageX, PackageCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Administration — King Dev Shop" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  component: AdminDashboard,
});

type Tab = "products" | "home" | "messages" | "testimonials" | "orders";

function AdminDashboard() {
  const nav = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const statusFn = useServerFn(getMyAdminStatus);
  const { data: status, error: statusError, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => statusFn(),
    enabled: sessionReady,
    retry: false,
  });
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data.user) {
        nav({ to: "/admin/login" });
        return;
      }
      setSessionReady(true);
    });
    // Session ended (sign-out in another tab, expired refresh token): leave the admin.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") nav({ to: "/admin/login" });
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [nav]);

  const logout = async () => { await supabase.auth.signOut(); nav({ to: "/admin/login" }); };

  // Nothing of the dashboard is shown until the server has confirmed the admin role.
  if (!sessionReady || statusLoading) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <Crown className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl">Connexion admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vérification de votre session...</p>
      </section>
    );
  }

  if (statusError || !status?.isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <Crown className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl">{statusError ? "Vérification impossible" : "Accès refusé"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {statusError
            ? `Vos droits n'ont pas pu être vérifiés : ${(statusError as Error).message}`
            : "Ce compte n'a pas les droits d'administrateur de la boutique."}
        </p>
        {statusError && (
          <button onClick={() => refetchStatus()} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Réessayer</button>
        )}
        <button onClick={logout} className="mt-3 block mx-auto text-xs text-muted-foreground hover:text-primary">Se déconnecter</button>
      </section>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "products", label: "Produits", icon: Package },
    { id: "home", label: "Accueil", icon: HomeIcon },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "testimonials", label: "Témoignages", icon: Star },
    { id: "orders", label: "Commandes", icon: ShoppingBag },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6 flex-wrap gap-4">
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

      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm transition border-b-2 ${active ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {tab === "products" && <ProductsTab />}
        {tab === "home" && <HomeTab />}
        {tab === "messages" && <MessagesTab />}
        {tab === "testimonials" && <TestimonialsTab />}
        {tab === "orders" && <OrdersTab />}
      </div>
    </section>
  );
}

/* =================== SHARED =================== */

// Runs an admin action and always reports a failure, instead of failing silently.
function useAdminAction(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>, confirmMessage?: string) => {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setBusy(true);
    try {
      await action();
      onDone();
    } catch (e: any) {
      alert(`L'opération a échoué : ${e?.message ?? "erreur inconnue"}`);
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

function QueryError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      Chargement impossible : {(error as Error).message}
    </p>
  );
}

function TextInput({ label, value, onChange, type = "text", required, list, min, step }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
  list?: string; min?: number; step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} required={required} list={list} min={min} step={step} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
    </label>
  );
}

/* =================== PRODUCTS =================== */

type UploadedImage = { path: string; url: string };
const COLLECTIONS_LIST_ID = "admin-collections";

// Photos are resized in the browser first (max 1600 px, WebP/JPEG): phone photos of
// several MB would otherwise slow the shop down for every visitor.
async function uploadProductImage(original: File): Promise<UploadedImage> {
  if (!original.type.startsWith("image/")) throw new Error("Le fichier choisi n'est pas une image.");
  const f = await compressImage(original, 1600);
  const ext = f.name.split(".").pop() || "jpg";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, f, { upsert: false, contentType: f.type });
  if (error) throw error;
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function removeUploadedImage(path: string) {
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (error) throw error;
}

type ProductFields = {
  name: string; collection: string; price: number; material: string | null; description: string | null; in_stock: boolean;
};

function ProductsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProducts);
  const createFn = useServerFn(createProduct);
  const { data: products = [], error } = useQuery({ queryKey: ["products"], queryFn: () => listFn() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });
  const collections = Array.from(new Set(products.map((p: Product) => p.collection))).sort((a, b) => a.localeCompare(b, "fr"));
  const outOfStock = products.filter((p: Product) => !p.in_stock).length;

  return (
    <>
      {/* Suggests existing collection names to avoid near-duplicates ("Six Pièces" / "6 pièces"). */}
      <datalist id={COLLECTIONS_LIST_ID}>
        {collections.map((c) => <option key={c} value={c} />)}
      </datalist>
      <AddProductForm onCreate={async (p) => { await createFn({ data: p }); refresh(); }} />
      <div className="mt-10">
        <h2 className="font-display text-2xl">
          Produits ({products.length}){outOfStock > 0 && <span className="ml-2 text-sm text-destructive">· {outOfStock} en rupture</span>}
        </h2>
        <QueryError error={error} />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: Product) => <ProductCard key={p.id} product={p} onChanged={refresh} />)}
        </div>
      </div>
    </>
  );
}

function ProductCard({ product: p, onChanged }: { product: Product; onChanged: () => void }) {
  const updateFn = useServerFn(updateProduct);
  const delFn = useServerFn(deleteProduct);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const run = async (label: string, action: () => Promise<unknown>) => {
    setBusy(label);
    try { await action(); onChanged(); }
    catch (e: any) { alert(`L'opération a échoué : ${e?.message ?? "erreur inconnue"}`); }
    finally { setBusy(null); }
  };

  const replaceImage = (f: File) => run("Envoi de l'image…", async () => {
    const uploaded = await uploadProductImage(f);
    try { await updateFn({ data: { id: p.id, image_url: uploaded.url } }); }
    catch (e) { await removeUploadedImage(uploaded.path).catch(() => {}); throw e; }
  });

  const removeImage = () => {
    if (!confirm("Retirer l'image de ce produit ?")) return;
    run("Suppression de l'image…", () => updateFn({ data: { id: p.id, image_url: null } }));
  };

  const toggleStock = () =>
    run(p.in_stock ? "Mise en rupture…" : "Remise en stock…", () => updateFn({ data: { id: p.id, in_stock: !p.in_stock } }));

  const removeProduct = () => {
    if (!confirm("Supprimer ce produit et son image ?")) return;
    run("Suppression…", () => delFn({ data: { id: p.id } }));
  };

  return (
    <article className={`rounded-xl border bg-card overflow-hidden ${p.in_stock ? "border-border" : "border-destructive/40"}`}>
      <div className="relative aspect-[4/3] bg-secondary">
        <ProductImage src={p.image_url} alt={p.name} sizes="(min-width: 1024px) 33vw, 100vw" className="h-full w-full object-cover" />
        {!p.in_stock && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-[10px] uppercase tracking-wider text-white">Rupture de stock</span>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs">{busy}</div>
        )}
      </div>
      <div className="p-4">
        {editing ? (
          <ProductEditForm
            product={p}
            onCancel={() => setEditing(false)}
            onSave={(fields) => run("Enregistrement…", async () => {
              await updateFn({ data: { id: p.id, ...fields } });
              setEditing(false);
            })}
            disabled={!!busy}
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.collection}{p.material ? ` • ${p.material}` : ""}</p>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{formatFcfa(p.price)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setEditing(true)} disabled={!!busy}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary disabled:opacity-50">
                <Pencil className="h-3 w-3" /> Modifier
              </button>
              <button onClick={toggleStock} disabled={!!busy}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary disabled:opacity-50">
                {p.in_stock ? <><PackageX className="h-3 w-3" /> Mettre en rupture</> : <><PackageCheck className="h-3 w-3" /> Remettre en stock</>}
              </button>
              <label className={`inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs ${busy ? "opacity-50" : "cursor-pointer hover:border-primary"}`}>
                <ImagePlus className="h-3 w-3" /> {p.image_url ? "Changer l'image" : "Ajouter une image"}
                <input type="file" accept="image/*" className="hidden" disabled={!!busy}
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) replaceImage(f); }} />
              </label>
              {p.image_url && (
                <button onClick={removeImage} disabled={!!busy}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary disabled:opacity-50">
                  <ImageOff className="h-3 w-3" /> Retirer l'image
                </button>
              )}
              <button onClick={removeProduct} disabled={!!busy}
                className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50">
                <Trash2 className="h-3 w-3" /> Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function ProductEditForm({ product, onCancel, onSave, disabled }: {
  product: Product; onCancel: () => void; onSave: (fields: ProductFields) => void; disabled: boolean;
}) {
  const [name, setName] = useState(product.name);
  const [collection, setCollection] = useState(product.collection);
  const [price, setPrice] = useState(String(Number(product.price)));
  const [material, setMaterial] = useState(product.material ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [inStock, setInStock] = useState(product.in_stock);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(), collection: collection.trim(), price: Number(price),
      material: material.trim() || null, description: description.trim() || null, in_stock: inStock,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <TextInput label="Nom" value={name} onChange={setName} required />
      <TextInput label="Collection" value={collection} onChange={setCollection} required list={COLLECTIONS_LIST_ID} />
      <TextInput label="Prix (FCFA)" type="number" min={0} step={1} value={price} onChange={setPrice} required />
      <TextInput label="Matière" value={material} onChange={setMaterial} />
      <TextArea label="Description" value={description} onChange={setDescription} />
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> En stock
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={disabled} className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50">Enregistrer</button>
        <button type="button" onClick={onCancel} disabled={disabled} className="rounded-full border border-border px-4 py-2 text-xs">Annuler</button>
      </div>
    </form>
  );
}

function AddProductForm({ onCreate }: { onCreate: (p: any) => Promise<void> }) {
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Six Pièces");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Uploading a new image replaces (and deletes) the one picked before.
  const upload = async (f: File) => {
    setUploading(true); setMsg(null);
    try {
      const previous = image;
      const uploaded = await uploadProductImage(f);
      setFile(f); setImage(uploaded);
      if (previous) await removeUploadedImage(previous.path);
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setUploading(false); }
  };

  const discardImage = async () => {
    if (!image) return;
    setUploading(true); setMsg(null);
    try {
      await removeUploadedImage(image.path);
      setFile(null); setImage(null);
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await onCreate({
        name: name.trim(), collection: collection.trim(), price: Number(price), material: material.trim() || null,
        description: description.trim() || null, image_url: image?.url ?? null, in_stock: true,
      });
      setName(""); setPrice(""); setMaterial(""); setDescription(""); setFile(null); setImage(null);
      setMsg({ ok: true, text: "Produit ajouté ✓" });
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Plus className="h-5 w-5" /> Nouveau produit</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextInput label="Nom" value={name} onChange={setName} required />
        <TextInput label="Collection" value={collection} onChange={setCollection} required list={COLLECTIONS_LIST_ID} />
        <TextInput label="Prix (FCFA)" type="number" min={0} step={1} value={price} onChange={setPrice} required />
        <TextInput label="Matière" value={material} onChange={setMaterial} />
        <div className="sm:col-span-2">
          <TextArea label="Description" value={description} onChange={setDescription} />
        </div>
        <div className="sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Photo du produit</span>
          <div className="mt-1 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm cursor-pointer hover:border-primary">
              <Upload className="h-4 w-4" />
              {file ? file.name : "Choisir une image"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
            </label>
            {uploading && <span className="text-xs text-muted-foreground">Envoi…</span>}
            {image && (
              <div className="relative">
                <img src={image.url} alt="" className="h-12 w-12 rounded object-cover" />
                <button type="button" onClick={discardImage} disabled={uploading} aria-label="Retirer l'image"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white disabled:opacity-50">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {msg && <p role={msg.ok ? undefined : "alert"} className={`mt-4 text-sm ${msg.ok ? "" : "text-destructive"}`}>{msg.text}</p>}
      <button disabled={saving || uploading} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {saving ? "Enregistrement…" : "Ajouter le produit"}
      </button>
    </form>
  );
}

/* =================== HOME CONTENT =================== */

function HomeTab() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSiteContent);
  const updateFn = useServerFn(updateSiteContent);
  const { data: content, error } = useQuery({ queryKey: ["site-content"], queryFn: () => getFn() });
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const c = draft ?? (content as Record<string, string> | undefined) ?? {};
  const set = (k: string, v: string) => setDraft({ ...(draft ?? content ?? {}), [k]: v });

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const entries = SITE_CONTENT_KEYS.filter((key) => key in c).map((key) => ({ key, value: c[key] }));
      await updateFn({ data: { entries } });
      await qc.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      setMsg({ ok: true, text: "Enregistré ✓" });
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
      <h2 className="font-display text-2xl">Contenu de la page d'accueil</h2>
      <p className="mt-1 text-sm text-muted-foreground">Modifiez le titre, le slogan et la description du hero.</p>
      <QueryError error={error} />
      <div className="mt-6 grid gap-4">
        <TextInput label="Titre principal" value={c.hero_title ?? ""} onChange={(v) => set("hero_title", v)} />
        <TextInput label="Slogan" value={c.hero_slogan ?? ""} onChange={(v) => set("hero_slogan", v)} />
        <TextArea label="Description" value={c.hero_description ?? ""} onChange={(v) => set("hero_description", v)} rows={4} />
      </div>
      {msg && <p role={msg.ok ? undefined : "alert"} className={`mt-4 text-sm ${msg.ok ? "" : "text-destructive"}`}>{msg.text}</p>}
      <button onClick={save} disabled={saving || !content} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}

/* =================== MESSAGES =================== */

function MessagesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMessages);
  const readFn = useServerFn(markMessageRead);
  const delFn = useServerFn(deleteMessage);
  const { data: messages = [], error } = useQuery({ queryKey: ["admin-messages"], queryFn: () => listFn() });
  const { busy, run } = useAdminAction(() => qc.invalidateQueries({ queryKey: ["admin-messages"] }));

  return (
    <div>
      <h2 className="font-display text-2xl">Messages ({messages.length})</h2>
      <QueryError error={error} />
      <div className="mt-6 space-y-3">
        {!error && messages.length === 0 && <p className="text-sm text-muted-foreground">Aucun message pour l'instant.</p>}
        {(messages as any[]).map((m) => (
          <article key={m.id} className={`rounded-xl border p-5 ${m.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-medium">{m.name} <span className="text-xs text-muted-foreground">· {m.email}</span></h3>
                {m.subject && <p className="text-sm text-muted-foreground">Sujet : {m.subject}</p>}
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => run(() => readFn({ data: { id: m.id, read: !m.read } }))}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-50">
                  {m.read ? <EyeOff className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                  {m.read ? "Non lu" : "Lu"}
                </button>
                <button disabled={busy} onClick={() => run(() => delFn({ data: { id: m.id } }), "Supprimer ce message ?")}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50">
                  <Trash2 className="h-3 w-3" /> Supprimer
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* =================== TESTIMONIALS =================== */

function TestimonialsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllTestimonials);
  const createFn = useServerFn(createTestimonial);
  const updateFn = useServerFn(updateTestimonial);
  const delFn = useServerFn(deleteTestimonial);
  const { data: testimonials = [], error } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => listFn() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["public-testimonials"] });
  };
  const { busy, run } = useAdminAction(invalidate);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createFn({ data: { name, location: location || null, text, rating, published: true } });
      setName(""); setLocation(""); setText(""); setRating(5);
      invalidate();
    } catch (e: any) { alert(`L'opération a échoué : ${e.message}`); } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
      <form onSubmit={add} className="rounded-2xl border border-border bg-card p-6 h-fit">
        <h2 className="flex items-center gap-2 font-display text-2xl"><Plus className="h-5 w-5" /> Nouveau témoignage</h2>
        <div className="mt-6 grid gap-4">
          <TextInput label="Nom du client" value={name} onChange={setName} required />
          <TextInput label="Lieu" value={location} onChange={setLocation} />
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Témoignage</span>
            <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={4}
              className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Note</span>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} étoile{n>1?"s":""}</option>)}
            </select>
          </label>
        </div>
        <button disabled={saving} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
          {saving ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-2xl">Témoignages ({testimonials.length})</h2>
        <QueryError error={error} />
        <div className="mt-6 space-y-3">
          {(testimonials as any[]).map((t) => (
            <article key={t.id} className={`rounded-xl border p-5 ${t.published ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/30" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{t.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <h3 className="font-medium">{t.name} <span className="text-xs text-muted-foreground">· {t.location ?? "—"} · {t.rating}★</span></h3>
                    {!t.published && <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">En attente de validation</span>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => run(() => updateFn({ data: { id: t.id, published: !t.published } }))}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs disabled:opacity-50 ${t.published ? "border border-border" : "bg-primary text-primary-foreground"}`}>
                    {t.published ? <><EyeOff className="h-3 w-3" /> Masquer</> : <><Check className="h-3 w-3" /> Approuver</>}
                  </button>
                  <button disabled={busy} onClick={() => run(() => delFn({ data: { id: t.id } }), "Supprimer ce témoignage et sa photo ?")}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50">
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm italic">"{t.text}"</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =================== ORDERS =================== */

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau", en_cours: "En cours", expedie: "Expédié", livre: "Livré", annule: "Annulé",
};

// Orders store the items and the total paid (delivery included since the server
// computes it); the delivery fee is the difference. Older orders have no fee here.
function orderAmounts(o: { items: any[]; total: number | string }) {
  const subtotal = (o.items ?? []).reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const total = Number(o.total);
  return { subtotal, delivery: Math.max(0, total - subtotal), total };
}

function OrdersTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listOrders);
  const statusFn = useServerFn(updateOrderStatus);
  const delFn = useServerFn(deleteOrder);
  const { data: orders = [], error } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn() });
  const { busy, run } = useAdminAction(() => qc.invalidateQueries({ queryKey: ["admin-orders"] }));

  return (
    <div>
      <h2 className="font-display text-2xl">Commandes ({orders.length})</h2>
      <QueryError error={error} />
      <div className="mt-6 space-y-4">
        {!error && orders.length === 0 && <p className="text-sm text-muted-foreground">Aucune commande pour l'instant.</p>}
        {(orders as any[]).map((o) => {
          const amounts = orderAmounts(o);
          return (
            <article key={o.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-medium">{o.customer_name} <span className="text-xs text-muted-foreground">· Réf. {orderReference(o.id)}</span></h3>
                  <p className="text-xs text-muted-foreground">
                    {o.customer_phone} · {o.customer_address}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{formatFcfa(amounts.total)}</span>
                  <select value={o.status} disabled={busy} aria-label="Statut de la commande"
                    onChange={(e) => run(() => statusFn({ data: { id: o.id, status: e.target.value as any } }))}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-50">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button disabled={busy} onClick={() => run(() => delFn({ data: { id: o.id } }), "Supprimer cette commande ?")}
                    aria-label="Supprimer la commande"
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {(o.items as any[]).map((it, i) => (
                  <li key={i} className="flex justify-between border-t border-border/60 py-1">
                    <span>{it.name} × {it.qty}</span>
                    <span className="text-muted-foreground">{formatFcfa(Number(it.price) * Number(it.qty))}</span>
                  </li>
                ))}
                {amounts.delivery > 0 && (
                  <li className="flex justify-between border-t border-border/60 py-1">
                    <span>Livraison</span>
                    <span className="text-muted-foreground">{formatFcfa(amounts.delivery)}</span>
                  </li>
                )}
                <li className="flex justify-between border-t border-border py-1 font-medium">
                  <span>{amounts.delivery > 0 ? "Total TTC" : "Total"}</span>
                  <span>{formatFcfa(amounts.total)}</span>
                </li>
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
