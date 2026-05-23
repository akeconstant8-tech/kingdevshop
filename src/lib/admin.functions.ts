import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Accès refusé : réservé aux administrateurs.");
}

/* ============== PUBLIC ============== */

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("site_content").select("key, value");
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
  return map;
});

export const listPublicTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("testimonials").select("id, name, location, text, rating, photo_url")
    .eq("published", true).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const submitTestimonialInput = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional().nullable(),
  text: z.string().trim().min(5).max(1000),
  rating: z.number().int().min(1).max(5),
  photo_url: z.string().trim().url().max(500).optional().nullable(),
});
export const submitTestimonial = createServerFn({ method: "POST" })
  .inputValidator((i) => submitTestimonialInput.parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("testimonials").insert({
      ...data,
      published: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const messageInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(1).max(2000),
});
export const createMessage = createServerFn({ method: "POST" })
  .inputValidator((i) => messageInput.parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("messages").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const orderInput = z.object({
  customer_name: z.string().trim().min(1).max(120),
  customer_phone: z.string().trim().min(1).max(40),
  customer_address: z.string().trim().min(1).max(500),
  items: z.array(z.object({
    id: z.string().uuid(), qty: z.number().int().min(1).max(50),
  })).min(1).max(100),
});
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((i) => orderInput.parse(i))
  .handler(async ({ data }) => {
    const ids = Array.from(new Set(data.items.map((i) => i.id)));
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products").select("id, name, price, in_stock").in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const byId = new Map((products ?? []).map((p: any) => [p.id, p]));
    if (byId.size !== ids.length) throw new Error("Un ou plusieurs produits sont introuvables.");

    const verifiedItems = data.items.map((i) => {
      const p: any = byId.get(i.id);
      if (!p.in_stock) throw new Error(`Produit indisponible : ${p.name}`);
      return { id: p.id, name: p.name, price: Number(p.price), qty: i.qty };
    });
    const total = verifiedItems.reduce((s, i) => s + i.price * i.qty, 0);

    const { error } = await supabaseAdmin.from("orders").insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      items: verifiedItems,
      total,
    });
    if (error) throw new Error(error.message);
    return { ok: true, total };
  });


/* ============== ADMIN ============== */

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
  .inputValidator((i) => z.object({ id: z.string().uuid(), read: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("messages").update({ read: data.read }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
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
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional().nullable(),
  text: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  published: z.boolean().default(true),
});
export const createTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => testimonialInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("testimonials").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    id: z.string().uuid(),
    published: z.boolean().optional(),
    text: z.string().trim().min(1).max(2000).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().max(120).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("testimonials").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
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
  .inputValidator((i) => z.object({
    id: z.string().uuid(),
    status: z.enum(["nouveau", "en_cours", "expedie", "livre", "annule"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    entries: z.array(z.object({
      key: z.string().min(1).max(60).regex(/^[a-z0-9_]+$/),
      value: z.string().max(2000),
    })).min(1).max(20),
  }).parse(i))
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
