// Single source of truth for product data.
// Used by: page.tsx, seed.ts, API routes, cart display.

export type Product = {
  id: string;       // slug — also the DB primary key
  name: string;
  tone: string;
  description: string;
  accent: string;
  image: string;
  price: number;    // INR — base single-can price
};

export type Pack = {
  label: string;    // e.g. "Pack of 6"
  cans: number;
  total: number;    // total INR for this pack
  perCan: number;   // per-can price (for display)
  badge?: string;   // optional promo badge text
};

/** All available pack sizes, ordered from smallest to largest */
export const PACKS: Pack[] = [
  { label: "1 Can",       cans: 1,  total: 149,   perCan: 149 },
  { label: "Pack of 6",   cans: 6,  total: 799,   perCan: 133, badge: "Save ₹95" },
  { label: "Pack of 8",   cans: 8,  total: 1049,  perCan: 131, badge: "Save ₹143" },
  { label: "Pack of 10",  cans: 10, total: 1299,  perCan: 129, badge: "Save ₹191" },
  { label: "Pack of 12",  cans: 12, total: 1499,  perCan: 125, badge: "Save ₹289" },
  { label: "Pack of 24",  cans: 24, total: 2699,  perCan: 112, badge: "Best Value" },
];

export const PRODUCTS: Product[] = [
  {
    id: "guava-chilli",
    name: "Guava Chilli",
    tone: "Spicy tropical",
    description:
      "Pink guava freshness with a clean chilli finish for people who like their hydration with a little spark.",
    accent: "#f05a45",
    image: "/images/guava-chilli-hero.png",
    price: 150
  },
  {
    id: "raw-mango",
    name: "Raw Mango",
    tone: "Tangy bright",
    description:
      "Sharp green mango notes, citrusy lift, and a crisp finish built for hot afternoons and post-workout resets.",
    accent: "#f2c21b",
    image: "/images/raw-mango-hero.png",
    price: 150
  },
  {
    id: "watermelon",
    name: "Watermelon",
    tone: "Juicy light",
    description:
      "A cool watermelon profile with a refreshing fruit-water feel and a clean zero-sugar finish.",
    accent: "#ff3030",
    image: "/images/watermelon-hero.png",
    price: 150
  }
];

export const PRODUCT_MAP = new Map<string, Product>(
  PRODUCTS.map((p) => [p.id, p])
);
