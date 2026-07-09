// Single source of truth for product data.
// Used by: page.tsx, seed.ts, API routes, cart display.

export type Product = {
  id: string;       // slug — also the DB primary key
  name: string;
  tone: string;
  description: string;
  accent: string;
  image: string;
  price: number;    // INR
};

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
