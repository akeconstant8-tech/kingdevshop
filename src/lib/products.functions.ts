import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { storefrontDb } from "@/lib/storefront-db.server";
import { assertAdmin } from "@/lib/admin-auth.server";
import { parseInput } from "@/lib/validation";
import { PRODUCT_IMAGES_BUCKET, storagePathFromPublicUrl } from "@/lib/images";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  collection: string;
  material: string | null;
  in_stock: boolean;
};

const PRODUCT_COLUMNS = "id, name, description, price, image_url, collection, material, in_stock";

// PUBLIC: list products for the storefront
export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await storefrontDb()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
});

// PUBLIC: one product, for its own page. null when it does not exist.
export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input) => parseInput(z.object({ id: z.string().uuid() }), input))
  .handler(async ({ data }) => {
    const { data: row, error } = await storefrontDb()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as Product | null;
  });

const productInput = z.object({
  name: z.string().trim().min(1, "Le nom du produit est obligatoire.").max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number({ invalid_type_error: "Le prix doit être un nombre." }).min(0).max(100_000_000),
  image_url: z
    .string()
    .url()
    .max(1000)
    .refine(
      (url) => storagePathFromPublicUrl(url, PRODUCT_IMAGES_BUCKET) !== null,
      "L'image doit être envoyée depuis l'administration de la boutique.",
    )
    .optional()
    .nullable(),
  collection: z.string().trim().min(1, "La collection est obligatoire.").max(60),
  material: z.string().trim().max(120).optional().nullable(),
  in_stock: z.boolean().optional(),
});

// Removes a product image from storage unless another product still uses it.
// Best effort: a leftover file must not make the product change itself fail.
async function removeImageIfUnused(supabase: any, url: string | null) {
  const path = storagePathFromPublicUrl(url, PRODUCT_IMAGES_BUCKET);
  if (!path) return;
  const { count, error: countErr } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("image_url", url);
  if (countErr || (count ?? 0) > 0) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (error) console.error(`[products] Impossible de supprimer l'image ${path}: ${error.message}`);
}

// ADMIN-only
export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => parseInput(productInput, input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({ ...data })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => parseInput(z.object({ id: z.string().uuid() }), input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("products")
      .delete()
      .eq("id", data.id)
      .select("image_url")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Produit introuvable ou suppression refusée.");
    await removeImageIfUnused(context.supabase, row.image_url);
    return { ok: true };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => parseInput(productInput.partial().extend({ id: z.string().uuid() }), input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { data: before, error: readErr } = await context.supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!before) throw new Error("Produit introuvable.");
    const { data: row, error } = await context.supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (before.image_url !== row.image_url) await removeImageIfUnused(context.supabase, before.image_url);
    return row;
  });

// Admin role of the signed-in user. Admins are only granted from the database
// (Lovable Cloud): there is deliberately no way to become admin from the site.
export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data), userId: context.userId };
  });
