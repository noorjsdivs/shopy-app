/**
 * Shopy seed — idempotent (upsert by natural keys). Mirrors _props/SEED-DATA.md.
 *
 * Order: categories -> stores -> departments -> products (catalog templates cloned
 * per store with price scaling) -> default users (admin + customer) -> demo orders.
 *
 * Images: royalty-free Unsplash photos (https://unsplash.com). Money is integer
 * minor units (cents). Run with: npm run prisma:seed -w apps/api
 */
import {
  PrismaClient,
  Prisma,
  WeightUnit,
  OrderStatus,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { computeTotals } from '../src/common/economics';

const prisma = new PrismaClient();

// A neutral blurhash so cards render nicely before the Unsplash photo loads.
const BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=500&q=80&auto=format&fit=crop`;

// ---------------------------------------------------------------------------
// 1. Categories
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { slug: 'grocery', name: 'Grocery', icon: 'cart' },
  { slug: 'alcohol', name: 'Alcohol', icon: 'wine' },
  { slug: 'convenience', name: 'Convenience', icon: 'storefront' },
  { slug: 'pharmacy', name: 'Pharmacy', icon: 'medkit' },
  { slug: 'retail', name: 'Retail', icon: 'bag-handle' },
];

// ---------------------------------------------------------------------------
// 2. Departments (master list — each store carries a subset, in shelf order)
// ---------------------------------------------------------------------------
const DEPARTMENTS: Record<string, { slug: string; name: string; icon: string }> = {
  produce: { slug: 'produce', name: 'Fresh Produce', icon: 'leaf' },
  dairy: { slug: 'dairy', name: 'Dairy & Eggs', icon: 'egg' },
  bakery: { slug: 'bakery', name: 'Bakery', icon: 'cafe' },
  meat: { slug: 'meat', name: 'Meat & Seafood', icon: 'fish' },
  pantry: { slug: 'pantry', name: 'Pantry', icon: 'fast-food' },
  snacks: { slug: 'snacks', name: 'Snacks', icon: 'nutrition' },
  beverages: { slug: 'beverages', name: 'Beverages', icon: 'beer' },
  frozen: { slug: 'frozen', name: 'Frozen', icon: 'snow' },
  household: { slug: 'household', name: 'Household', icon: 'home' },
};

// ---------------------------------------------------------------------------
// 3. Stores — `departments` are slugs in shelf order; priceMultiplier scales catalog
// ---------------------------------------------------------------------------
interface StoreSeed {
  slug: string;
  name: string;
  logo: string;
  category: string;
  etaMinutes: number;
  deliveryFeeMinor: number;
  dealBadge?: string;
  pricesNote?: string;
  rating: number;
  boughtRecently: number;
  departments: string[];
  priceMultiplier: number;
  brandColor: string;
}

const STORES: StoreSeed[] = [
  { slug: 'greenleaf', name: 'Greenleaf Market', logo: '🥬', category: 'grocery', etaMinutes: 35, deliveryFeeMinor: 0, dealBadge: '20% off your first order', pricesNote: 'In-store prices', rating: 4.8, boughtRecently: 5200, departments: ['produce', 'dairy', 'bakery', 'meat', 'pantry', 'snacks', 'beverages', 'frozen', 'household'], priceMultiplier: 1.0, brandColor: '#2E7D32' },
  { slug: 'cornerstone', name: 'Cornerstone Grocers', logo: '🛒', category: 'grocery', etaMinutes: 45, deliveryFeeMinor: 399, pricesNote: 'In-store prices', rating: 4.6, boughtRecently: 3100, departments: ['produce', 'dairy', 'bakery', 'pantry', 'snacks', 'beverages', 'frozen', 'household'], priceMultiplier: 0.94, brandColor: '#6D4C41' },
  { slug: 'freshco', name: 'Fresh & Co', logo: '🌿', category: 'grocery', etaMinutes: 30, deliveryFeeMinor: 0, dealBadge: 'Free delivery over $35', pricesNote: 'Organic specialists', rating: 4.9, boughtRecently: 4400, departments: ['produce', 'dairy', 'bakery', 'meat', 'pantry', 'beverages'], priceMultiplier: 1.12, brandColor: '#2E933C' },
  { slug: 'quickstop', name: 'QuickStop', logo: '🏪', category: 'convenience', etaMinutes: 15, deliveryFeeMinor: 299, dealBadge: 'Open 24 hours', rating: 4.4, boughtRecently: 2700, departments: ['snacks', 'beverages', 'frozen', 'household'], priceMultiplier: 1.18, brandColor: '#F57C00' },
  { slug: 'vinebarrel', name: 'Vine & Barrel', logo: '🍷', category: 'alcohol', etaMinutes: 40, deliveryFeeMinor: 499, dealBadge: 'ID required on delivery', rating: 4.7, boughtRecently: 1500, departments: ['beverages', 'snacks'], priceMultiplier: 1.05, brandColor: '#7B1FA2' },
  { slug: 'citymeds', name: 'CityMeds Pharmacy', logo: '⚕️', category: 'pharmacy', etaMinutes: 25, deliveryFeeMinor: 0, dealBadge: 'Free delivery on Rx', rating: 4.5, boughtRecently: 980, departments: ['household', 'snacks', 'beverages'], priceMultiplier: 1.08, brandColor: '#0277BD' },
  { slug: 'bulkbazaar', name: 'Bulk Bazaar', logo: '📦', category: 'retail', etaMinutes: 60, deliveryFeeMinor: 599, dealBadge: 'Buy in bulk & save', pricesNote: 'Warehouse prices', rating: 4.3, boughtRecently: 2200, departments: ['pantry', 'household', 'snacks', 'beverages', 'frozen'], priceMultiplier: 0.82, brandColor: '#455A64' },
];

// ---------------------------------------------------------------------------
// 4. Product templates (CATALOG) — keyed by department slug
// ---------------------------------------------------------------------------
interface ProductTemplate {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  description?: string;
  priceMinor: number;
  compareAtMinor?: number;
  byWeight?: boolean;
  weightUnit?: string;
  boughtRecently: number;
  image: string;
  tags?: string[];
}

const CATALOG: Record<string, ProductTemplate[]> = {
  produce: [
    { id: 'strawberries', name: 'Organic Strawberries', brand: 'Sunny Farms', size: '1 lb', priceMinor: 599, compareAtMinor: 799, boughtRecently: 1200, image: img('1518635017498-87f514b751ba'), tags: ['Organic'], description: 'Sweet, juicy strawberries picked at peak ripeness.' },
    { id: 'bananas', name: 'Bananas', size: 'per lb', priceMinor: 69, byWeight: true, weightUnit: 'lb', boughtRecently: 3400, image: img('1571771894821-ce9b6c11b08e'), tags: ['Vegan'], description: 'Everyday bananas, great for snacking and smoothies.' },
    { id: 'avocado', name: 'Hass Avocados', size: 'each', priceMinor: 129, boughtRecently: 2100, image: img('1523049673857-eb18f1d7b578'), tags: ['Vegan', 'Keto'], description: 'Creamy Hass avocados, ripe and ready.' },
    { id: 'spinach', name: 'Organic Baby Spinach', brand: 'Greenleaf', size: '5 oz', priceMinor: 399, boughtRecently: 560, image: img('1576045057995-568f588f82fb'), tags: ['Organic', 'Vegan', 'Gluten-free'] },
    { id: 'tomatoes', name: 'Vine Tomatoes', size: 'per lb', priceMinor: 249, compareAtMinor: 329, byWeight: true, weightUnit: 'lb', boughtRecently: 880, image: img('1592924357228-91a4daadcfad'), tags: ['Vegan'] },
    { id: 'blueberries', name: 'Blueberries', size: '6 oz', priceMinor: 449, boughtRecently: 920, image: img('1498557850523-fd3d118b962e'), tags: ['Organic'] },
    { id: 'broccoli', name: 'Broccoli Crowns', size: 'per lb', priceMinor: 199, byWeight: true, weightUnit: 'lb', boughtRecently: 410, image: img('1459411621453-7b03977f4bfc'), tags: ['Vegan', 'Keto'] },
    { id: 'apples', name: 'Honeycrisp Apples', size: 'per lb', priceMinor: 289, byWeight: true, weightUnit: 'lb', boughtRecently: 1500, image: img('1568702846914-96b305d2aaeb'), tags: ['Vegan'] },
  ],
  dairy: [
    { id: 'milk', name: 'Whole Milk', brand: 'Meadow Gold', size: '1 gal', priceMinor: 429, boughtRecently: 2600, image: img('1550583724-b2692b85b150'), description: 'Grade A whole milk.' },
    { id: 'eggs', name: 'Large Brown Eggs', brand: 'Happy Hen', size: '12 ct', priceMinor: 499, compareAtMinor: 599, boughtRecently: 3100, image: img('1582722872445-44dc5f7e3c8f'), tags: ['High-protein'] },
    { id: 'butter', name: 'Unsalted Butter', brand: 'Golden Churn', size: '1 lb', priceMinor: 549, boughtRecently: 740, image: img('1589985270826-4b7bb135bc9d'), tags: ['Keto'] },
    { id: 'yogurt', name: 'Greek Yogurt', brand: 'Olympus', size: '32 oz', priceMinor: 599, boughtRecently: 1300, image: img('1488477181946-6428a0291777'), tags: ['High-protein', 'Low-sugar'] },
    { id: 'cheddar', name: 'Sharp Cheddar', brand: 'Tillamoor', size: '8 oz', priceMinor: 449, compareAtMinor: 549, boughtRecently: 680, image: img('1486297678162-eb2a19b0a32d'), tags: ['Keto'] },
    { id: 'oatmilk', name: 'Oat Milk', brand: 'Oatly Day', size: '64 oz', priceMinor: 499, boughtRecently: 990, image: img('1600788886242-5c96aabe3757'), tags: ['Vegan', 'Gluten-free'] },
  ],
  bakery: [
    { id: 'sourdough', name: 'Artisan Sourdough', brand: 'Hearth & Crumb', size: '24 oz', priceMinor: 549, boughtRecently: 820, image: img('1585478259715-3c2a55e34e84'), description: 'Slow-fermented sourdough with a crackly crust.' },
    { id: 'bagels', name: 'Everything Bagels', size: '6 ct', priceMinor: 399, boughtRecently: 610, image: img('1585445490387-f47934b73b54'), tags: ['Vegan'] },
    { id: 'croissant', name: 'Butter Croissants', size: '4 ct', priceMinor: 499, compareAtMinor: 599, boughtRecently: 540, image: img('1555507036-ab1f4038808a') },
    { id: 'muffins', name: 'Blueberry Muffins', size: '4 ct', priceMinor: 459, boughtRecently: 320, image: img('1607958996333-41aef7caefaa') },
    { id: 'tortilla', name: 'Flour Tortillas', brand: 'La Cocina', size: '10 ct', priceMinor: 329, boughtRecently: 700, image: img('1565299624946-b28f40a0ae38') },
  ],
  meat: [
    { id: 'chicken', name: 'Chicken Breast', size: 'per lb', priceMinor: 599, byWeight: true, weightUnit: 'lb', boughtRecently: 1900, image: img('1604503468506-a8da13d82791'), tags: ['High-protein', 'Keto'], description: 'Boneless, skinless chicken breast.' },
    { id: 'salmon', name: 'Atlantic Salmon Fillet', size: 'per lb', priceMinor: 1299, compareAtMinor: 1499, byWeight: true, weightUnit: 'lb', boughtRecently: 760, image: img('1574781330855-d0db8cc6a79c'), tags: ['High-protein', 'Keto'] },
    { id: 'beef', name: 'Ground Beef 85/15', size: 'per lb', priceMinor: 699, byWeight: true, weightUnit: 'lb', boughtRecently: 1400, image: img('1603048719539-9ecb4aa395e3'), tags: ['High-protein'] },
    { id: 'bacon', name: 'Applewood Bacon', brand: 'Smokehouse', size: '12 oz', priceMinor: 749, boughtRecently: 880, image: img('1528607929212-2636ec44253e'), tags: ['Keto'] },
    { id: 'shrimp', name: 'Jumbo Shrimp', size: '12 oz', priceMinor: 1099, boughtRecently: 430, image: img('1565680018434-b513d5e5fd47'), tags: ['High-protein', 'Keto'] },
  ],
  pantry: [
    { id: 'pasta', name: 'Spaghetti', brand: 'Bella Vita', size: '16 oz', priceMinor: 199, boughtRecently: 1700, image: img('1551462147-ff29053bfc14'), tags: ['Vegan'] },
    { id: 'oliveoil', name: 'Extra Virgin Olive Oil', brand: 'Terra Oro', size: '500 ml', priceMinor: 999, compareAtMinor: 1199, boughtRecently: 520, image: img('1474979266404-7eaacbcd87c5'), tags: ['Vegan', 'Keto'] },
    { id: 'rice', name: 'Jasmine Rice', brand: 'Golden Grain', size: '5 lb', priceMinor: 799, boughtRecently: 1100, image: img('1586201375761-83865001e31c'), tags: ['Vegan', 'Gluten-free'] },
    { id: 'beans', name: 'Black Beans', brand: 'Casa', size: '15 oz', priceMinor: 129, boughtRecently: 940, image: img('1515543904379-3d757afe72e4'), tags: ['Vegan', 'High-protein'] },
    { id: 'peanutbutter', name: 'Creamy Peanut Butter', brand: 'Nutwell', size: '16 oz', priceMinor: 399, boughtRecently: 1300, image: img('1501012515817-93b76b67e3da'), tags: ['Vegan', 'High-protein'] },
    { id: 'cereal', name: 'Honey Oat Cereal', brand: 'Morning Co', size: '18 oz', priceMinor: 459, compareAtMinor: 549, boughtRecently: 870, image: img('1521483451569-e33803c0330c') },
  ],
  snacks: [
    { id: 'chips', name: 'Kettle Potato Chips', brand: 'Crisp Co', size: '8 oz', priceMinor: 399, boughtRecently: 1600, image: img('1566478989037-eec170784d0b'), tags: ['Vegan', 'Gluten-free'] },
    { id: 'chocolate', name: 'Dark Chocolate Bar', brand: 'Cacao Lab', size: '3.5 oz', priceMinor: 349, boughtRecently: 720, image: img('1511381939415-e44015466834'), tags: ['Vegan'] },
    { id: 'almonds', name: 'Roasted Almonds', brand: 'Nutwell', size: '12 oz', priceMinor: 699, compareAtMinor: 849, boughtRecently: 610, image: img('1508061253366-f7da158b6d46'), tags: ['Keto', 'High-protein', 'Vegan'] },
    { id: 'popcorn', name: 'Sea Salt Popcorn', brand: 'Poppd', size: '5 oz', priceMinor: 329, boughtRecently: 480, image: img('1578849278619-e73505e9610f'), tags: ['Vegan', 'Gluten-free'] },
    { id: 'granola', name: 'Granola Bars', brand: 'Trail Co', size: '8 ct', priceMinor: 449, boughtRecently: 990, image: img('1490567674331-72de84d22933') },
  ],
  beverages: [
    { id: 'coldbrew', name: 'Cold Brew Coffee', brand: 'Dark Star', size: '32 oz', priceMinor: 549, boughtRecently: 1200, image: img('1517701550927-30cf4ba1dba5') },
    { id: 'sparkling', name: 'Sparkling Water Variety', brand: 'Fizz', size: '12 ct', priceMinor: 599, compareAtMinor: 699, boughtRecently: 1500, image: img('1603569283847-aa295f0d016a'), tags: ['Vegan'] },
    { id: 'orangejuice', name: 'Orange Juice', brand: 'Sunrise', size: '52 oz', priceMinor: 449, boughtRecently: 880, image: img('1600271886742-f049cd451bba') },
    { id: 'greentea', name: 'Green Tea', brand: 'Leaf & Co', size: '20 ct', priceMinor: 399, boughtRecently: 420, image: img('1556679343-c7306c1976bc'), tags: ['Vegan', 'Low-sugar'] },
    { id: 'kombucha', name: 'Ginger Kombucha', brand: 'Culture', size: '16 oz', priceMinor: 379, boughtRecently: 560, image: img('1596803244618-8dc9a26e9d39'), tags: ['Vegan', 'Low-sugar'] },
  ],
  frozen: [
    { id: 'pizza', name: 'Margherita Pizza', brand: 'Forno', size: '14 oz', priceMinor: 699, boughtRecently: 1300, image: img('1513104890138-7c749659a591') },
    { id: 'icecream', name: 'Vanilla Bean Ice Cream', brand: 'Creamery', size: '1 pt', priceMinor: 549, compareAtMinor: 649, boughtRecently: 990, image: img('1497034825429-c343d7c6a68f') },
    { id: 'berries', name: 'Frozen Mixed Berries', size: '16 oz', priceMinor: 499, boughtRecently: 620, image: img('1488900128323-21503983a07e'), tags: ['Vegan', 'Gluten-free'] },
    { id: 'dumplings', name: 'Veggie Dumplings', brand: 'Wok St', size: '18 ct', priceMinor: 599, boughtRecently: 540, image: img('1496116218417-1a781b1c416c'), tags: ['Vegan'] },
  ],
  household: [
    { id: 'paper', name: 'Paper Towels', brand: 'Bounce', size: '6 rolls', priceMinor: 899, boughtRecently: 1400, image: img('1583947215259-38e31be8751f') },
    { id: 'dishsoap', name: 'Dish Soap', brand: 'Citrus Clean', size: '24 oz', priceMinor: 399, boughtRecently: 760, image: img('1585421514738-01798e348b17') },
    { id: 'detergent', name: 'Laundry Detergent', brand: 'FreshWave', size: '92 oz', priceMinor: 1299, compareAtMinor: 1499, boughtRecently: 680, image: img('1610557892470-55d9e80c0bce') },
    { id: 'foil', name: 'Aluminum Foil', brand: 'WrapIt', size: '75 sq ft', priceMinor: 449, boughtRecently: 320, image: img('1584556812952-905ffd0c611a') },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Scaled price per SEED-DATA §4: max(49, round((round(base*mult) - 1)/10)*10 + 9). */
function scaled(base: number, mult: number): number {
  return Math.max(49, Math.round((Math.round(base * mult) - 1) / 10) * 10 + 9);
}

function weightUnitEnum(unit?: string): WeightUnit | null {
  if (!unit) return null;
  const up = unit.toUpperCase();
  return (Object.values(WeightUnit) as string[]).includes(up)
    ? (up as WeightUnit)
    : null;
}

/** Nutrition derived from tags (SEED-DATA §5). */
function nutritionFor(tags: string[]): Prisma.InputJsonValue {
  return tags.includes('High-protein')
    ? [
        { label: 'Calories', value: '180' },
        { label: 'Protein', value: '24g' },
        { label: 'Carbs', value: '2g' },
        { label: 'Fat', value: '8g' },
      ]
    : [
        { label: 'Calories', value: '120' },
        { label: 'Protein', value: '3g' },
        { label: 'Carbs', value: '22g' },
        { label: 'Fat', value: '2g' },
      ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Seeding Shopy…');

  // 1. Categories
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    categoryIdBySlug.set(c.slug, row.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  // 2 + 3. Stores + their departments + products
  let productCount = 0;
  let deptCount = 0;
  for (const store of STORES) {
    const categoryId = categoryIdBySlug.get(store.category);
    if (!categoryId) throw new Error(`Unknown category: ${store.category}`);

    const storeRow = await prisma.store.upsert({
      where: { slug: store.slug },
      update: {
        name: store.name,
        logo: store.logo,
        categoryId,
        etaMinutes: store.etaMinutes,
        deliveryFeeMinor: store.deliveryFeeMinor,
        dealBadge: store.dealBadge ?? null,
        pricesNote: store.pricesNote ?? null,
        rating: store.rating,
        boughtRecently: store.boughtRecently,
        brandColor: store.brandColor,
        isActive: true,
      },
      create: {
        slug: store.slug,
        name: store.name,
        logo: store.logo,
        categoryId,
        etaMinutes: store.etaMinutes,
        deliveryFeeMinor: store.deliveryFeeMinor,
        dealBadge: store.dealBadge ?? null,
        pricesNote: store.pricesNote ?? null,
        rating: store.rating,
        boughtRecently: store.boughtRecently,
        brandColor: store.brandColor,
      },
    });

    // Departments in shelf order
    const deptIdBySlug = new Map<string, string>();
    for (let i = 0; i < store.departments.length; i++) {
      const slug = store.departments[i];
      const def = DEPARTMENTS[slug];
      if (!def) throw new Error(`Unknown department: ${slug}`);
      const deptRow = await prisma.department.upsert({
        where: { storeId_slug: { storeId: storeRow.id, slug } },
        update: { name: def.name, icon: def.icon, sort: i },
        create: {
          storeId: storeRow.id,
          slug,
          name: def.name,
          icon: def.icon,
          sort: i,
        },
      });
      deptIdBySlug.set(slug, deptRow.id);
      deptCount++;
    }

    // Products: clone catalog templates for each department this store carries
    for (const slug of store.departments) {
      const templates = CATALOG[slug] ?? [];
      const departmentId = deptIdBySlug.get(slug)!;
      for (const t of templates) {
        const priceMinor = scaled(t.priceMinor, store.priceMultiplier);
        const compareAtMinor =
          t.compareAtMinor != null
            ? Math.max(priceMinor + 20, scaled(t.compareAtMinor, store.priceMultiplier))
            : null;
        const tags = t.tags ?? [];
        const id = `${store.slug}__${t.id}`;

        const data = {
          storeId: storeRow.id,
          departmentId,
          name: t.name,
          brand: t.brand ?? null,
          size: t.size ?? null,
          description: t.description ?? null,
          priceMinor,
          compareAtMinor,
          byWeight: t.byWeight ?? false,
          weightUnit: weightUnitEnum(t.weightUnit),
          boughtRecently: t.boughtRecently,
          image: t.image,
          blurhash: BLURHASH,
          tags,
          nutrition: nutritionFor(tags),
          isActive: true,
        };

        await prisma.product.upsert({
          where: { id },
          update: data,
          create: { id, ...data },
        });
        productCount++;
      }
    }
    console.log(`  ✓ store ${store.name}`);
  }
  console.log(`  ✓ ${deptCount} departments, ${productCount} products`);

  // 4. Default accounts (bcrypt-hashed)
  const accounts = [
    { email: 'admin@shopy.dev', name: 'Shopy Admin', role: Role.ADMIN, password: 'admin1234' },
    { email: 'customer@shopy.dev', name: 'Sam Shopper', role: Role.CUSTOMER, password: 'shop1234' },
  ];
  const userIdByEmail = new Map<string, string>();
  for (const a of accounts) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    const row = await prisma.user.upsert({
      where: { email: a.email },
      update: { name: a.name, role: a.role, passwordHash },
      create: { email: a.email, name: a.name, role: a.role, passwordHash },
    });
    userIdByEmail.set(a.email, row.id);
  }
  console.log(`  ✓ ${accounts.length} users (admin@shopy.dev / customer@shopy.dev)`);

  // A saved address for the customer (idempotent by a fixed id)
  const customerId = userIdByEmail.get('customer@shopy.dev')!;
  await prisma.address.upsert({
    where: { id: 'demo-address-home' },
    update: {},
    create: {
      id: 'demo-address-home',
      userId: customerId,
      label: 'Home',
      line1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zip: '97403',
    },
  });

  // 5. Demo orders — recreated each run for idempotency (cascade clears lines/events)
  interface DemoOrder {
    id: string;
    storeSlug: string;
    status: OrderStatus;
    slotLabel: string;
    tipMinor: number;
    daysAgo: number;
    items: { productKey: string; qty: number }[];
    statusFlow: OrderStatus[];
  }

  const demoOrders: DemoOrder[] = [
    {
      id: 'demo-order-1',
      storeSlug: 'greenleaf',
      status: OrderStatus.DELIVERED,
      slotLabel: 'Today, 10–11am',
      tipMinor: 300,
      daysAgo: 5,
      items: [
        { productKey: 'greenleaf__bananas', qty: 3 },
        { productKey: 'greenleaf__milk', qty: 1 },
        { productKey: 'greenleaf__eggs', qty: 2 },
      ],
      statusFlow: [
        OrderStatus.RECEIVED,
        OrderStatus.PROCESSING,
        OrderStatus.PACKED,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ],
    },
    {
      id: 'demo-order-2',
      storeSlug: 'freshco',
      status: OrderStatus.SHIPPED,
      slotLabel: 'Today, 4–5pm',
      tipMinor: 500,
      daysAgo: 1,
      items: [
        { productKey: 'freshco__salmon', qty: 1 },
        { productKey: 'freshco__spinach', qty: 2 },
        { productKey: 'freshco__sourdough', qty: 1 },
      ],
      statusFlow: [
        OrderStatus.RECEIVED,
        OrderStatus.PROCESSING,
        OrderStatus.PACKED,
        OrderStatus.SHIPPED,
      ],
    },
    {
      id: 'demo-order-3',
      storeSlug: 'cornerstone',
      status: OrderStatus.PROCESSING,
      slotLabel: 'Tomorrow, 9–10am',
      tipMinor: 0,
      daysAgo: 0,
      items: [
        { productKey: 'cornerstone__pasta', qty: 2 },
        { productKey: 'cornerstone__oliveoil', qty: 1 },
        { productKey: 'cornerstone__cereal', qty: 1 },
      ],
      statusFlow: [OrderStatus.RECEIVED, OrderStatus.PROCESSING],
    },
  ];

  for (const o of demoOrders) {
    const store = await prisma.store.findUniqueOrThrow({
      where: { slug: o.storeSlug },
    });
    const products = await prisma.product.findMany({
      where: { id: { in: o.items.map((i) => i.productKey) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const lines = o.items.map((i) => {
      const p = productById.get(i.productKey);
      if (!p) throw new Error(`Demo order product not found: ${i.productKey}`);
      return {
        productId: p.id,
        nameSnap: p.name,
        qty: i.qty,
        unitMinor: p.priceMinor,
        lineMinor: p.priceMinor * i.qty,
        byWeight: p.byWeight,
      };
    });

    const subtotalMinor = lines.reduce((s, l) => s + l.lineMinor, 0);
    const totals = computeTotals(subtotalMinor, o.tipMinor);
    const placedAt = new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000);

    // events spread across the time between placement and now
    const span = Math.max(1, Date.now() - placedAt.getTime());
    const events = o.statusFlow.map((status, idx) => ({
      status,
      note: null as string | null,
      createdAt: new Date(
        placedAt.getTime() +
          Math.round((span * idx) / Math.max(1, o.statusFlow.length - 1)),
      ),
    }));

    // Idempotent: delete + recreate (OrderLine/OrderStatusEvent cascade on delete)
    await prisma.order.deleteMany({ where: { id: o.id } });
    await prisma.order.create({
      data: {
        id: o.id,
        userId: customerId,
        storeId: store.id,
        status: o.status,
        mode: 'DELIVERY',
        slotLabel: o.slotLabel,
        addressLabel: 'Home',
        subtotalMinor: totals.subtotalMinor,
        serviceFeeMinor: totals.serviceFeeMinor,
        deliveryFeeMinor: totals.deliveryFeeMinor,
        tipMinor: totals.tipMinor,
        totalMinor: totals.totalMinor,
        currency: 'USD',
        etaMinutes: store.etaMinutes,
        paymentAuthId: `demo_seed_auth_${o.id}`,
        createdAt: placedAt,
        lines: { create: lines },
        events: { create: events },
      },
    });
  }
  console.log(`  ✓ ${demoOrders.length} demo orders`);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
