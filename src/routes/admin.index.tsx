import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listProducts, createProduct, deleteProduct, getMyAdminStatus, bootstrapFirstAdmin, type Product,
} from "@/lib/products.functions";
import {
  listMessages, markMessageRead, deleteMessage,
  listAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  listOrders, updateOrderStatus, deleteOrder,
  getSiteContent, updateSiteContent,
} from "@/lib/admin.functions";
import { ProductImage } from "@/components/ProductImage";
import { Crown, LogOut, Trash2, Upload, Plus, Package, MessageSquare, Star, ShoppingBag, Home as HomeIcon, Check, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Administration — King Dev Shop" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
  },
  component: AdminDashboard,
});

type Tab = "products" | "home" | "messages" | "testimonials" | "orders";

function AdminDashboard() {
  const nav = useNavigate();
  const statusFn = useServerFn(getMyAdminStatus);
  const bootstrapFn = useServerFn(bootstrapFirstAdmin);
  const { data: status, refetch: refetchStatus } = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn() });
  const [tab, setTab] = useState<Tab>("products");

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

/* =================== PRODUCTS =================== */

function ProductsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProducts);
  const createFn = useServerFn(createProduct);
  const delFn = useServerFn(deleteProduct);
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => listFn() });

  return (
    <>
      <AddProductForm onCreate={async (p) => { await createFn({ data: p }); qc.invalidateQueries({ queryKey: ["products"] }); }} />
      <div className="mt-10">
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
    </>
  );
}

function AddProductForm({ onCreate }: { onCreate: (p: any) => Promise<void> }) {
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Six Pièces");
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
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-2xl"><Plus className="h-5 w-5" /> Nouveau produit</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextInput label="Nom" value={name} onChange={setName} required />
        <TextInput label="Collection" value={collection} onChange={setCollection} required />
        <TextInput label="Prix (FCFA)" type="number" value={price} onChange={setPrice} required />
        <TextInput label="Matière" value={material} onChange={setMaterial} />
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Photo du produit</label>
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

/* =================== HOME CONTENT =================== */

function HomeTab() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSiteContent);
  const updateFn = useServerFn(updateSiteContent);
  const { data: content } = useQuery({ queryKey: ["site-content"], queryFn: () => getFn() });
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const c = draft ?? (content as Record<string, string> | undefined) ?? {};
  const set = (k: string, v: string) => setDraft({ ...(draft ?? content ?? {}), [k]: v });

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const entries = Object.entries(c).map(([key, value]) => ({ key, value }));
      await updateFn({ data: { entries } });
      await qc.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      setMsg("Enregistré ✓");
    } catch (e: any) { setMsg(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
      <h2 className="font-display text-2xl">Contenu de la page d'accueil</h2>
      <p className="mt-1 text-sm text-muted-foreground">Modifiez le titre, le slogan et la description du hero.</p>
      <div className="mt-6 grid gap-4">
        <TextInput label="Titre principal" value={c.hero_title ?? ""} onChange={(v) => set("hero_title", v)} />
        <TextInput label="Slogan" value={c.hero_slogan ?? ""} onChange={(v) => set("hero_slogan", v)} />
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea value={c.hero_description ?? ""} onChange={(e) => set("hero_description", e.target.value)} rows={4}
            className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
        </div>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
      <button onClick={save} disabled={saving} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
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
  const { data: messages = [] } = useQuery({ queryKey: ["admin-messages"], queryFn: () => listFn() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-messages"] });

  return (
    <div>
      <h2 className="font-display text-2xl">Messages ({messages.length})</h2>
      <div className="mt-6 space-y-3">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">Aucun message pour l'instant.</p>}
        {(messages as any[]).map((m) => (
          <article key={m.id} className={`rounded-xl border p-5 ${m.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-medium">{m.name} <span className="text-xs text-muted-foreground">· {m.email}</span></h3>
                {m.subject && <p className="text-sm text-muted-foreground">Sujet : {m.subject}</p>}
                <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => { await readFn({ data: { id: m.id, read: !m.read } }); invalidate(); }}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs">
                  {m.read ? <EyeOff className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                  {m.read ? "Non lu" : "Lu"}
                </button>
                <button onClick={async () => { if (confirm("Supprimer ?")) { await delFn({ data: { id: m.id } }); invalidate(); } }}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive">
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
  const { data: testimonials = [] } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => listFn() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["public-testimonials"] });
  };

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
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
      <form onSubmit={add} className="rounded-2xl border border-border bg-card p-6 h-fit">
        <h2 className="flex items-center gap-2 font-display text-2xl"><Plus className="h-5 w-5" /> Nouveau témoignage</h2>
        <div className="mt-6 grid gap-4">
          <TextInput label="Nom du client" value={name} onChange={setName} required />
          <TextInput label="Lieu" value={location} onChange={setLocation} />
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Témoignage</label>
            <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={4}
              className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Note</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} étoile{n>1?"s":""}</option>)}
            </select>
          </div>
        </div>
        <button disabled={saving} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
          {saving ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-2xl">Témoignages ({testimonials.length})</h2>
        <div className="mt-6 space-y-3">
          {(testimonials as any[]).map((t) => (
            <article key={t.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-medium">{t.name} <span className="text-xs text-muted-foreground">· {t.location ?? "—"} · {t.rating}★</span></h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={async () => { await updateFn({ data: { id: t.id, published: !t.published } }); invalidate(); }}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs">
                    {t.published ? <><Eye className="h-3 w-3" /> Publié</> : <><EyeOff className="h-3 w-3" /> Masqué</>}
                  </button>
                  <button onClick={async () => { if (confirm("Supprimer ?")) { await delFn({ data: { id: t.id } }); invalidate(); } }}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive">
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

function OrdersTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listOrders);
  const statusFn = useServerFn(updateOrderStatus);
  const delFn = useServerFn(deleteOrder);
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });

  return (
    <div>
      <h2 className="font-display text-2xl">Commandes ({orders.length})</h2>
      <div className="mt-6 space-y-4">
        {orders.length === 0 && <p className="text-sm text-muted-foreground">Aucune commande pour l'instant.</p>}
        {(orders as any[]).map((o) => (
          <article key={o.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-medium">{o.customer_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {o.customer_phone} · {o.customer_address}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{Number(o.total).toLocaleString("fr-FR")} FCFA</span>
                <select value={o.status} onChange={async (e) => { await statusFn({ data: { id: o.id, status: e.target.value as any } }); invalidate(); }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={async () => { if (confirm("Supprimer ?")) { await delFn({ data: { id: o.id } }); invalidate(); } }}
                  className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {(o.items as any[]).map((it, i) => (
                <li key={i} className="flex justify-between border-t border-border/60 py-1">
                  <span>{it.name} × {it.qty}</span>
                  <span className="text-muted-foreground">{Number(it.price * it.qty).toLocaleString("fr-FR")} FCFA</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

/* =================== SHARED =================== */

function TextInput({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm focus:border-primary outline-none" />
    </div>
  );
}
