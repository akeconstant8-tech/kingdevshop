import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { storefrontDb } from "@/lib/storefront-db.server";
import { assertAdmin } from "@/lib/admin-auth.server";
import { parseInput } from "@/lib/validation";
import { TESTIMONIAL_PHOTOS_BUCKET, storagePathFromPublicUrl } from "@/lib/images";
import { computeOrder, deliveryAddressLine, orderInputSchema } from "@/lib/order-logic";

/* ============== PUBLIC ============== */

export const SITE_CONTENT_KEYS = ["hero_title", "hero_slogan", "hero_description"] as const;

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await storefrontDb().from("site_content").select("key, value");
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
  return map;
});

export const listPublicTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await storefrontDb()
    .from("testimonials").select("id, name, location, text, rating, photo_url")
    .eq("published", true).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// Only photos uploaded through the testimonial form (testimonial-photos/submissions/…).
const submittedPhotoUrl = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine(
    (url) => storagePathFromPublicUrl(url, TESTIMONIAL_PHOTOS_BUCKET)?.startsWith("submissions/") ?? false,
    "La photo doit être envoyée depuis le formulaire.",
  );

const submitTestimonialInput = z.object({
  name: z.string().trim().min(1, "Indiquez votre prénom.").max(120),
  location: z.string().trim().max(120).optional().nullable(),
  text: z.string().trim().min(5, "Votre témoignage est trop court.").max(1000),
  rating: z.number().int().min(1).max(5),
  photo_url: submittedPhotoUrl.optional().nullable(),
});
export const submitTestimonial = createServerFn({ method: "POST" })
  .inputValidator((i) => parseInput(submitTestimonialInput, i))
  .handler(async ({ data }) => {
    const { error } = await storefrontDb().from("testimonials").insert({
      ...data,
      published: false,
    });
    if (error) throw new Error("Votre témoignage n'a pas pu être envoyé. Réessayez dans un instant.");
    return { ok: true };
  });

const messageInput = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse email invalide.").max(200),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(1, "Votre message est vide.").max(2000),
});
export const createMessage = createServerFn({ method: "POST" })
  .inputValidator((i) => parseInput(messageInput, i))
  .handler(async ({ data }) => {
    const { error } = await storefrontDb().from("messages").insert(data);
    if (error) throw new Error("Votre message n'a pas pu être envoyé. Réessayez dans un instant.");
    return { ok: true };
  });

// Records the order before the customer is sent to WhatsApp. Prices, stock and the
// delivery fee come from the database and order-logic — never from the browser.
// The order id is chosen by the browser once per cart, so a re-sent order (double
// click, lost connection) is recognised by the primary key instead of duplicated.
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((i) => parseInput(orderInputSchema, i))
  .handler(async ({ data }) => {
    const db = storefrontDb();
    const ids = Array.from(new Set(data.items.map((i) => i.id)));
    const { data: products, error: pErr } = await db
      .from("products").select("id, name, price, in_stock").in("id", ids);
    if (pErr) {
      console.error("[orders] lecture des produits:", pErr.message);
      throw new Error("Impossible de vérifier les produits pour le moment. Réessayez dans un instant.");
    }
    const order = computeOrder(data.items, data.delivery_city, products ?? []);

    const { error } = await db.from("orders").insert({
      id: data.id,
      customer_name: data.customer.name,
      customer_phone: data.customer.phone,
      customer_address: deliveryAddressLine(data.customer.address, order),
      items: order.items,
      total: order.total,
    });
    const alreadyRecorded = error?.code === "23505";
    if (error && !alreadyRecorded) {
      console.error("[orders] enregistrement:", error.message);
      throw new Error("Votre commande n'a pas pu être enregistrée. Réessayez dans un instant.");
    }
    return { orderId: data.id, alreadyRecorded, ...order };
  });


/* ============== ADMIN ============== */

const idInput = z.object({ id: z.string().uuid() });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("messages").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markMessageRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(z.object({ id: z.string().uuid(), read: z.boolean() }), i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("messages").update({ read: data.read }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(idInput, i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("messages").delete().eq("id", data.id).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Message introuvable ou suppression refusée.");
    return { ok: true };
  });

export const listAllTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("testimonials").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const testimonialInput = z.object({
  name: z.string().trim().min(1, "Le nom du client est obligatoire.").max(120),
  location: z.string().trim().max(120).optional().nullable(),
  text: z.string().trim().min(1, "Le témoignage est vide.").max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  published: z.boolean().default(true),
});
export const createTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(testimonialInput, i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("testimonials").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(z.object({
    id: z.string().uuid(),
    published: z.boolean().optional(),
    text: z.string().trim().min(1).max(2000).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().max(120).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
  }), i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("testimonials").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Deletes the testimonial and the customer's photo stored with it.
export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(idInput, i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("testimonials").delete().eq("id", data.id).select("photo_url").maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Témoignage introuvable ou suppression refusée.");
    const path = storagePathFromPublicUrl(row.photo_url, TESTIMONIAL_PHOTOS_BUCKET);
    if (path) {
      const { error: rmErr } = await context.supabase.storage.from(TESTIMONIAL_PHOTOS_BUCKET).remove([path]);
      if (rmErr) console.error(`[testimonials] Impossible de supprimer la photo ${path}: ${rmErr.message}`);
    }
    return { ok: true };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(z.object({
    id: z.string().uuid(),
    status: z.enum(["nouveau", "en_cours", "expedie", "livre", "annule"]),
  }), i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(idInput, i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("orders").delete().eq("id", data.id).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Commande introuvable ou suppression refusée.");
    return { ok: true };
  });

export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => parseInput(z.object({
    entries: z.array(z.object({
      key: z.enum(SITE_CONTENT_KEYS),
      value: z.string().max(2000),
    })).min(1).max(SITE_CONTENT_KEYS.length),
  }), i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    for (const e of data.entries) {
      const { error } = await context.supabase
        .from("site_content")
        .upsert({ key: e.key, value: e.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
