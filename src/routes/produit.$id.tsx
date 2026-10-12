import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { getProduct } from "@/lib/products.functions";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButtons } from "@/components/AddToCartButtons";
import { formatFcfa } from "@/lib/order-logic";
import { pageHead, productJsonLd, truncate, withJsonLd } from "@/lib/seo";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/produit/$id")({
  loader: async ({ params }) => {
    if (!UUID_RE.test(params.id)) throw notFound();
    const product = await getProduct({ data: { id: params.id } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Produit introuvable — King Dev Shop" }, { name: "robots", content: "noindex" }] };
    const head = pageHead({
      title: `${p.name} — ${formatFcfa(p.price)} | King Dev Shop`,
      description: truncate(p.description || `${p.name}, ${p.collection}${p.material ? `, ${p.material}` : ""}. ${formatFcfa(p.price)}, livraison partout en Côte d'Ivoire.`),
      path: `/produit/${params.id}`,
      image: p.image_url ?? undefined,
      type: "product",
    });
    return withJsonLd(head, productJsonLd(p));
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-20">
      <Link to="/collection" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Retour à la collection
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-2xl bg-white aspect-[4/3] shadow-[var(--shadow-elegant)]">
          <ProductImage src={p.image_url} alt={p.name} priority sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-contain p-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">{p.collection}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{p.name}</h1>
          <p className="mt-4 font-display text-3xl text-primary">{formatFcfa(p.price)}</p>
          {p.material && <p className="mt-2 text-sm text-muted-foreground">{p.material}</p>}
          {p.description && <p className="mt-6 leading-relaxed text-muted-foreground whitespace-pre-line">{p.description}</p>}
          <p className={`mt-6 text-sm font-medium ${p.in_stock ? "text-primary" : "text-destructive"}`}>
            {p.in_stock ? "✓ En stock" : "Rupture de stock"}
          </p>
          <div className="max-w-sm">
            <AddToCartButtons product={p} className="mt-6" />
          </div>
          <ul className="mt-10 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-primary" /> Livraison rapide partout en Côte d'Ivoire</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Commande confirmée sur WhatsApp</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
