import cream from "@/assets/sheet-cream.jpg";
import navy from "@/assets/sheet-navy.jpg";
import blush from "@/assets/sheet-blush.jpg";
import emerald from "@/assets/sheet-emerald.jpg";

export type Product = {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  material: string;
};

export const products: Product[] = [
  { id: "ivory-gold", name: "Ivoire Royal", collection: "Signature", price: 89000, image: cream, material: "Coton égyptien 600 fils" },
  { id: "midnight", name: "Nuit de Minuit", collection: "Signature", price: 95000, image: navy, material: "Satin de coton 800 fils" },
  { id: "blush", name: "Aube Tendre", collection: "Romance", price: 72000, image: blush, material: "Percale lavée 400 fils" },
  { id: "emerald", name: "Émeraude Couronne", collection: "Héritage", price: 110000, image: emerald, material: "Coton broderie d'or" },
];
