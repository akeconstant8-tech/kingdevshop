import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DELIVERY_OPTIONS, MAX_QTY_PER_ITEM, buildWhatsAppMessage, computeOrder, deliveryAddressLine,
  newOrderId, orderInputSchema, orderReference, whatsappUrl,
} from "../src/lib/order-logic.ts";
import { parseInput } from "../src/lib/validation.ts";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const GONE = "33333333-3333-4333-8333-333333333333";
const catalog = [
  { id: A, name: "Parure 6 pièces — Royal Rouge", price: 13000, in_stock: true },
  { id: B, name: "Parure 4 pièces — Vagues", price: "8500", in_stock: true },
  { id: "44444444-4444-4444-8444-444444444444", name: "Rupture", price: 10000, in_stock: false },
];
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("prix et total viennent du catalogue, livraison selon la ville", () => {
  const order = computeOrder([{ id: A, qty: 2 }, { id: B, qty: 1 }], "Cocody", catalog);
  assert.deepEqual(order.items, [
    { id: A, name: "Parure 6 pièces — Royal Rouge", price: 13000, qty: 2 },
    { id: B, name: "Parure 4 pièces — Vagues", price: 8500, qty: 1 },
  ]);
  assert.equal(order.subtotal, 34500);
  assert.equal(order.deliveryFee, 2000);
  assert.equal(order.total, 36500);
});

test("chaque ville a ses propres frais de livraison", () => {
  for (const { city, fee } of DELIVERY_OPTIONS) {
    const order = computeOrder([{ id: B, qty: 1 }], city, catalog);
    assert.equal(order.deliveryFee, fee, city);
    assert.equal(order.total, 8500 + fee, city);
  }
});

test("les lignes en double sont fusionnées", () => {
  const order = computeOrder([{ id: A, qty: 1 }, { id: A, qty: 3 }], "Plateau", catalog);
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].qty, 4);
  assert.equal(order.subtotal, 52000);
});

test("ville inconnue refusée (frais impossibles à falsifier)", () => {
  assert.throws(() => computeOrder([{ id: A, qty: 1 }], "Paris", catalog), /Ville de livraison inconnue/);
});

test("produit supprimé ou en rupture refusé avec un message clair", () => {
  assert.throws(() => computeOrder([{ id: GONE, qty: 1 }], "Cocody", catalog), /n'existe plus/);
  assert.throws(
    () => computeOrder([{ id: "44444444-4444-4444-8444-444444444444", qty: 1 }], "Cocody", catalog),
    /« Rupture » est en rupture de stock/,
  );
});

test("quantité maximale contrôlée même après fusion", () => {
  assert.throws(
    () => computeOrder([{ id: A, qty: MAX_QTY_PER_ITEM }, { id: A, qty: 1 }], "Cocody", catalog),
    /Quantité maximale/,
  );
});

test("validation de la commande : données valides acceptées", () => {
  const input = {
    id: newOrderId(),
    customer: { name: "Aïcha Koné", phone: "07 11 25 76 55", address: "Cocody, près de la pharmacie" },
    delivery_city: "Cocody",
    items: [{ id: A, qty: 2 }],
  };
  assert.deepEqual(orderInputSchema.parse(input), input);
});

test("validation de la commande : messages en français pour les erreurs", () => {
  const base = {
    id: newOrderId(),
    customer: { name: "Aïcha", phone: "0711257655", address: "Cocody Angré" },
    delivery_city: "Cocody",
    items: [{ id: A, qty: 1 }],
  };
  assert.throws(() => parseInput(orderInputSchema, { ...base, customer: { ...base.customer, phone: "abc" } }), /Numéro invalide/);
  assert.throws(() => parseInput(orderInputSchema, { ...base, items: [] }), /Votre panier est vide/);
  assert.throws(() => parseInput(orderInputSchema, { ...base, items: [{ id: A, qty: 0 }] }), /Quantité invalide/);
  assert.throws(() => parseInput(orderInputSchema, { ...base, items: [{ id: A, qty: 51 }] }), /Quantité maximale/);
  assert.throws(() => parseInput(orderInputSchema, { ...base, id: "pas-un-uuid" }), /Identifiant de commande invalide/);
  assert.throws(() => parseInput(orderInputSchema, { ...base, items: [{ id: A, qty: 1.5 }] }), /items\.0\.qty/);
});

test("message WhatsApp : référence, articles, livraison et total du serveur", () => {
  const id = "abcdef12-3456-4789-8abc-def012345678";
  const order = computeOrder([{ id: A, qty: 2 }], "Grand-Bassam", catalog);
  const text = buildWhatsAppMessage(id, order, { name: "Aïcha", phone: "0711257655", address: "Rue 12" });
  assert.equal(orderReference(id), "ABCDEF12");
  assert.match(text, /Réf\. commande : ABCDEF12/);
  assert.match(text, /Parure 6 pièces — Royal Rouge × 2 — 26\s000 FCFA/);
  assert.match(text, /Livraison \(Grand-Bassam\) : 3\s000 FCFA/);
  assert.match(text, /\*Total TTC : 29\s000 FCFA\*/);
  const url = whatsappUrl(text);
  assert.ok(url.startsWith("https://wa.me/2250711257655?text="));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), text);
  assert.equal(deliveryAddressLine("Rue 12", order), "Rue 12 — Livraison Grand-Bassam (3 000 FCFA)");
});

test("identifiant de commande : UUID v4, aussi sans crypto.randomUUID (http local)", () => {
  assert.match(newOrderId(), UUID_V4);
  const original = crypto.randomUUID;
  try {
    // @ts-expect-error simulate an insecure context (http://192.168…)
    crypto.randomUUID = undefined;
    const ids = new Set(Array.from({ length: 200 }, () => newOrderId()));
    assert.equal(ids.size, 200);
    for (const id of ids) assert.match(id, UUID_V4);
  } finally {
    crypto.randomUUID = original;
  }
});
