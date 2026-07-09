import "dotenv/config";
import { PRODUCTS } from "@/lib/products";
import { db } from "@/lib/db";

async function main() {
  console.log("🌱  Seeding products...");

  for (const p of PRODUCTS) {
    await db.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        tone: p.tone,
        description: p.description,
        price: p.price,
        accent: p.accent,
        image: p.image,
        inStock: true
      },
      create: {
        id: p.id,
        name: p.name,
        tone: p.tone,
        description: p.description,
        price: p.price,
        accent: p.accent,
        image: p.image,
        inStock: true
      }
    });
    console.log(`  ✓  ${p.name}`);
  }

  console.log("✅  Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
