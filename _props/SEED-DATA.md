# SEED-DATA.md — Shopy catalog + default accounts

The seed source for `prisma/seed.ts`. **Store-agnostic product templates** are cloned into each
store with a `priceMultiplier` (and a believable `.x9` rounding), exactly like the reference app, so
every store has a full, varied catalog. Money is integer minor units (cents). Images are
royalty-free Unsplash photos; pair each with a blurhash placeholder so cards look right offline.

> Claude Code: load this verbatim into typed seed arrays, then build per-store products in code.
> Keep the cloning + price-scaling logic in `seed.ts` (don't hand-write every product row).

## 1. Categories (`Category`)
```ts
[
  { slug: 'grocery',     name: 'Grocery',     icon: 'cart' },
  { slug: 'alcohol',     name: 'Alcohol',     icon: 'wine' },
  { slug: 'convenience', name: 'Convenience', icon: 'storefront' },
  { slug: 'pharmacy',    name: 'Pharmacy',    icon: 'medkit' },
  { slug: 'retail',      name: 'Retail',      icon: 'bag-handle' },
]
```

## 2. Departments (master list — each store carries a subset, in shelf order)
```ts
{
  produce:   { slug: 'produce',   name: 'Fresh Produce',  icon: 'leaf' },
  dairy:     { slug: 'dairy',     name: 'Dairy & Eggs',   icon: 'egg' },
  bakery:    { slug: 'bakery',    name: 'Bakery',         icon: 'cafe' },
  meat:      { slug: 'meat',      name: 'Meat & Seafood', icon: 'fish' },
  pantry:    { slug: 'pantry',    name: 'Pantry',         icon: 'fast-food' },
  snacks:    { slug: 'snacks',    name: 'Snacks',         icon: 'nutrition' },
  beverages: { slug: 'beverages', name: 'Beverages',      icon: 'beer' },
  frozen:    { slug: 'frozen',    name: 'Frozen',         icon: 'snow' },
  household: { slug: 'household', name: 'Household',       icon: 'home' },
}
```
Dietary / facet tags (for product filters): `['Organic','Vegan','Gluten-free','Keto','Low-sugar','High-protein']`

## 3. Stores (`Store`) — `departments` are slugs in shelf order; `priceMultiplier` scales the catalog
```ts
[
  { slug:'greenleaf',   name:'Greenleaf Market',    logo:'🥬', category:'grocery',     etaMinutes:35, deliveryFeeMinor:0,   dealBadge:'20% off your first order', pricesNote:'In-store prices',     rating:4.8, boughtRecently:5200, departments:['produce','dairy','bakery','meat','pantry','snacks','beverages','frozen','household'], priceMultiplier:1.00 },
  { slug:'cornerstone', name:'Cornerstone Grocers', logo:'🛒', category:'grocery',     etaMinutes:45, deliveryFeeMinor:399,                                       pricesNote:'In-store prices',     rating:4.6, boughtRecently:3100, departments:['produce','dairy','bakery','pantry','snacks','beverages','frozen','household'], priceMultiplier:0.94 },
  { slug:'freshco',     name:'Fresh & Co',          logo:'🌿', category:'grocery',     etaMinutes:30, deliveryFeeMinor:0,   dealBadge:'Free delivery over $35',   pricesNote:'Organic specialists', rating:4.9, boughtRecently:4400, departments:['produce','dairy','bakery','meat','pantry','beverages'], priceMultiplier:1.12 },
  { slug:'quickstop',   name:'QuickStop',           logo:'🏪', category:'convenience', etaMinutes:15, deliveryFeeMinor:299, dealBadge:'Open 24 hours',                                              rating:4.4, boughtRecently:2700, departments:['snacks','beverages','frozen','household'], priceMultiplier:1.18 },
  { slug:'vinebarrel',  name:'Vine & Barrel',       logo:'🍷', category:'alcohol',     etaMinutes:40, deliveryFeeMinor:499, dealBadge:'ID required on delivery',                                     rating:4.7, boughtRecently:1500, departments:['beverages','snacks'], priceMultiplier:1.05 },
  { slug:'citymeds',    name:'CityMeds Pharmacy',   logo:'⚕️', category:'pharmacy',    etaMinutes:25, deliveryFeeMinor:0,   dealBadge:'Free delivery on Rx',                                        rating:4.5, boughtRecently:980,  departments:['household','snacks','beverages'], priceMultiplier:1.08 },
  { slug:'bulkbazaar',  name:'Bulk Bazaar',         logo:'📦', category:'retail',      etaMinutes:60, deliveryFeeMinor:599, dealBadge:'Buy in bulk & save',       pricesNote:'Warehouse prices',    rating:4.3, boughtRecently:2200, departments:['pantry','household','snacks','beverages','frozen'], priceMultiplier:0.82 },
]
```

## 4. Product templates (`CATALOG`) — keyed by department slug
`img(id)` = `https://images.unsplash.com/photo-${id}?w=500&q=80&auto=format&fit=crop`.
Per-store product `id`/slug = `${store.slug}__${template.id}`. Scaled price:
`max(49, round((round(base*mult) - 1)/10)*10 + 9)`; `compareAt = max(price+20, scaled(compareAt))`.

```ts
const CATALOG = {
  produce: [
    { id:'strawberries', name:'Organic Strawberries', brand:'Sunny Farms', size:'1 lb',  priceMinor:599, compareAtMinor:799, boughtRecently:1200, image:img('1518635017498-87f514b751ba'), tags:['Organic'], description:'Sweet, juicy strawberries picked at peak ripeness.' },
    { id:'bananas',      name:'Bananas',                                    size:'per lb', priceMinor:69,  byWeight:true, weightUnit:'lb', boughtRecently:3400, image:img('1571771894821-ce9b6c11b08e'), tags:['Vegan'], description:'Everyday bananas, great for snacking and smoothies.' },
    { id:'avocado',      name:'Hass Avocados',                              size:'each',   priceMinor:129, boughtRecently:2100, image:img('1523049673857-eb18f1d7b578'), tags:['Vegan','Keto'], description:'Creamy Hass avocados, ripe and ready.' },
    { id:'spinach',      name:'Organic Baby Spinach', brand:'Greenleaf',    size:'5 oz',   priceMinor:399, boughtRecently:560,  image:img('1576045057995-568f588f82fb'), tags:['Organic','Vegan','Gluten-free'] },
    { id:'tomatoes',     name:'Vine Tomatoes',                              size:'per lb', priceMinor:249, compareAtMinor:329, byWeight:true, weightUnit:'lb', boughtRecently:880, image:img('1592924357228-91a4daadcfad'), tags:['Vegan'] },
    { id:'blueberries',  name:'Blueberries',                                size:'6 oz',   priceMinor:449, boughtRecently:920,  image:img('1498557850523-fd3d118b962e'), tags:['Organic'] },
    { id:'broccoli',     name:'Broccoli Crowns',                            size:'per lb', priceMinor:199, byWeight:true, weightUnit:'lb', boughtRecently:410, image:img('1459411621453-7b03977f4bfc'), tags:['Vegan','Keto'] },
    { id:'apples',       name:'Honeycrisp Apples',                          size:'per lb', priceMinor:289, byWeight:true, weightUnit:'lb', boughtRecently:1500, image:img('1568702846914-96b305d2aaeb'), tags:['Vegan'] },
  ],
  dairy: [
    { id:'milk',    name:'Whole Milk',       brand:'Meadow Gold', size:'1 gal', priceMinor:429, boughtRecently:2600, image:img('1550583724-b2692b85b150'), description:'Grade A whole milk.' },
    { id:'eggs',    name:'Large Brown Eggs', brand:'Happy Hen',   size:'12 ct', priceMinor:499, compareAtMinor:599, boughtRecently:3100, image:img('1582722872445-44dc5f7e3c8f'), tags:['High-protein'] },
    { id:'butter',  name:'Unsalted Butter',  brand:'Golden Churn',size:'1 lb',  priceMinor:549, boughtRecently:740,  image:img('1589985270826-4b7bb135bc9d'), tags:['Keto'] },
    { id:'yogurt',  name:'Greek Yogurt',     brand:'Olympus',     size:'32 oz', priceMinor:599, boughtRecently:1300, image:img('1488477181946-6428a0291777'), tags:['High-protein','Low-sugar'] },
    { id:'cheddar', name:'Sharp Cheddar',    brand:'Tillamoor',   size:'8 oz',  priceMinor:449, compareAtMinor:549, boughtRecently:680, image:img('1486297678162-eb2a19b0a32d'), tags:['Keto'] },
    { id:'oatmilk', name:'Oat Milk',         brand:'Oatly Day',   size:'64 oz', priceMinor:499, boughtRecently:990,  image:img('1600788886242-5c96aabe3757'), tags:['Vegan','Gluten-free'] },
  ],
  bakery: [
    { id:'sourdough', name:'Artisan Sourdough', brand:'Hearth & Crumb', size:'24 oz', priceMinor:549, boughtRecently:820, image:img('1585478259715-3c2a55e34e84'), description:'Slow-fermented sourdough with a crackly crust.' },
    { id:'bagels',    name:'Everything Bagels',                         size:'6 ct',  priceMinor:399, boughtRecently:610, image:img('1585445490387-f47934b73b54'), tags:['Vegan'] },
    { id:'croissant', name:'Butter Croissants',                         size:'4 ct',  priceMinor:499, compareAtMinor:599, boughtRecently:540, image:img('1555507036-ab1f4038808a') },
    { id:'muffins',   name:'Blueberry Muffins',                         size:'4 ct',  priceMinor:459, boughtRecently:320, image:img('1607958996333-41aef7caefaa') },
    { id:'tortilla',  name:'Flour Tortillas',  brand:'La Cocina',       size:'10 ct', priceMinor:329, boughtRecently:700, image:img('1565299624946-b28f40a0ae38') },
  ],
  meat: [
    { id:'chicken', name:'Chicken Breast',          size:'per lb', priceMinor:599,  byWeight:true, weightUnit:'lb', boughtRecently:1900, image:img('1604503468506-a8da13d82791'), tags:['High-protein','Keto'], description:'Boneless, skinless chicken breast.' },
    { id:'salmon',  name:'Atlantic Salmon Fillet',  size:'per lb', priceMinor:1299, compareAtMinor:1499, byWeight:true, weightUnit:'lb', boughtRecently:760, image:img('1574781330855-d0db8cc6a79c'), tags:['High-protein','Keto'] },
    { id:'beef',    name:'Ground Beef 85/15',       size:'per lb', priceMinor:699,  byWeight:true, weightUnit:'lb', boughtRecently:1400, image:img('1603048719539-9ecb4aa395e3'), tags:['High-protein'] },
    { id:'bacon',   name:'Applewood Bacon', brand:'Smokehouse', size:'12 oz', priceMinor:749, boughtRecently:880, image:img('1528607929212-2636ec44253e'), tags:['Keto'] },
    { id:'shrimp',  name:'Jumbo Shrimp',                        size:'12 oz', priceMinor:1099, boughtRecently:430, image:img('1565680018434-b513d5e5fd47'), tags:['High-protein','Keto'] },
  ],
  pantry: [
    { id:'pasta',        name:'Spaghetti',              brand:'Bella Vita', size:'16 oz',  priceMinor:199, boughtRecently:1700, image:img('1551462147-ff29053bfc14'), tags:['Vegan'] },
    { id:'oliveoil',     name:'Extra Virgin Olive Oil', brand:'Terra Oro',  size:'500 ml', priceMinor:999, compareAtMinor:1199, boughtRecently:520, image:img('1474979266404-7eaacbcd87c5'), tags:['Vegan','Keto'] },
    { id:'rice',         name:'Jasmine Rice',           brand:'Golden Grain',size:'5 lb',  priceMinor:799, boughtRecently:1100, image:img('1586201375761-83865001e31c'), tags:['Vegan','Gluten-free'] },
    { id:'beans',        name:'Black Beans',            brand:'Casa',       size:'15 oz',  priceMinor:129, boughtRecently:940,  image:img('1515543904379-3d757afe72e4'), tags:['Vegan','High-protein'] },
    { id:'peanutbutter', name:'Creamy Peanut Butter',   brand:'Nutwell',    size:'16 oz',  priceMinor:399, boughtRecently:1300, image:img('1501012515817-93b76b67e3da'), tags:['Vegan','High-protein'] },
    { id:'cereal',       name:'Honey Oat Cereal',       brand:'Morning Co', size:'18 oz',  priceMinor:459, compareAtMinor:549, boughtRecently:870, image:img('1521483451569-e33803c0330c') },
  ],
  snacks: [
    { id:'chips',     name:'Kettle Potato Chips', brand:'Crisp Co',  size:'8 oz',   priceMinor:399, boughtRecently:1600, image:img('1566478989037-eec170784d0b'), tags:['Vegan','Gluten-free'] },
    { id:'chocolate', name:'Dark Chocolate Bar',  brand:'Cacao Lab', size:'3.5 oz', priceMinor:349, boughtRecently:720,  image:img('1511381939415-e44015466834'), tags:['Vegan'] },
    { id:'almonds',   name:'Roasted Almonds',     brand:'Nutwell',   size:'12 oz',  priceMinor:699, compareAtMinor:849, boughtRecently:610, image:img('1508061253366-f7da158b6d46'), tags:['Keto','High-protein','Vegan'] },
    { id:'popcorn',   name:'Sea Salt Popcorn',    brand:'Poppd',     size:'5 oz',   priceMinor:329, boughtRecently:480,  image:img('1578849278619-e73505e9610f'), tags:['Vegan','Gluten-free'] },
    { id:'granola',   name:'Granola Bars',        brand:'Trail Co',  size:'8 ct',   priceMinor:449, boughtRecently:990,  image:img('1490567674331-72de84d22933') },
  ],
  beverages: [
    { id:'coldbrew',    name:'Cold Brew Coffee',         brand:'Dark Star', size:'32 oz', priceMinor:549, boughtRecently:1200, image:img('1517701550927-30cf4ba1dba5') },
    { id:'sparkling',   name:'Sparkling Water Variety',  brand:'Fizz',      size:'12 ct', priceMinor:599, compareAtMinor:699, boughtRecently:1500, image:img('1603569283847-aa295f0d016a'), tags:['Vegan'] },
    { id:'orangejuice', name:'Orange Juice',             brand:'Sunrise',   size:'52 oz', priceMinor:449, boughtRecently:880,  image:img('1600271886742-f049cd451bba') },
    { id:'greentea',    name:'Green Tea',                brand:'Leaf & Co', size:'20 ct', priceMinor:399, boughtRecently:420,  image:img('1556679343-c7306c1976bc'), tags:['Vegan','Low-sugar'] },
    { id:'kombucha',    name:'Ginger Kombucha',          brand:'Culture',   size:'16 oz', priceMinor:379, boughtRecently:560,  image:img('1596803244618-8dc9a26e9d39'), tags:['Vegan','Low-sugar'] },
  ],
  frozen: [
    { id:'pizza',     name:'Margherita Pizza',       brand:'Forno',    size:'14 oz', priceMinor:699, boughtRecently:1300, image:img('1513104890138-7c749659a591') },
    { id:'icecream',  name:'Vanilla Bean Ice Cream', brand:'Creamery', size:'1 pt',  priceMinor:549, compareAtMinor:649, boughtRecently:990, image:img('1497034825429-c343d7c6a68f') },
    { id:'berries',   name:'Frozen Mixed Berries',                     size:'16 oz', priceMinor:499, boughtRecently:620,  image:img('1488900128323-21503983a07e'), tags:['Vegan','Gluten-free'] },
    { id:'dumplings', name:'Veggie Dumplings',       brand:'Wok St',   size:'18 ct', priceMinor:599, boughtRecently:540,  image:img('1496116218417-1a781b1c416c'), tags:['Vegan'] },
  ],
  household: [
    { id:'paper',     name:'Paper Towels',      brand:'Bounce',       size:'6 rolls',  priceMinor:899,  boughtRecently:1400, image:img('1583947215259-38e31be8751f') },
    { id:'dishsoap',  name:'Dish Soap',         brand:'Citrus Clean', size:'24 oz',    priceMinor:399,  boughtRecently:760,  image:img('1585421514738-01798e348b17') },
    { id:'detergent', name:'Laundry Detergent', brand:'FreshWave',    size:'92 oz',    priceMinor:1299, compareAtMinor:1499, boughtRecently:680, image:img('1610557892470-55d9e80c0bce') },
    { id:'foil',      name:'Aluminum Foil',     brand:'WrapIt',       size:'75 sq ft', priceMinor:449,  boughtRecently:320,  image:img('1584556812952-905ffd0c611a') },
  ],
};
```

## 5. Nutrition (derive per product)
Products tagged `High-protein` → `[{Calories,180},{Protein,24g},{Carbs,2g},{Fat,8g}]`; otherwise
`[{Calories,120},{Protein,3g},{Carbs,22g},{Fat,2g}]`. Store as `Product.nutrition` JSON.

## 6. Cross-links (compute in seed or at query time)
- **Related:** up to 6 products in the same store + department.
- **Often bought with:** up to 6 products in the same store, different department.

## 7. Default accounts (seed with bcrypt-hashed passwords)
```ts
[
  { email: 'admin@shopy.dev',    name: 'Shopy Admin', role: 'ADMIN',    password: 'admin1234' },
  { email: 'customer@shopy.dev', name: 'Sam Shopper', role: 'CUSTOMER', password: 'shop1234' },
]
```
> Document these credentials in the root README so the app is testable immediately. They are **demo
> only** — note that production must change them.

## 8. Demo orders (optional, for non-empty admin metrics)
Seed 2–3 orders for the customer across a couple of stores, with a mix of statuses
(`DELIVERED`, `SHIPPED`, `PROCESSING`) and a few `OrderStatusEvent`s, so the Admin dashboard and
order history render real data on first launch.

## 9. Cart economics (mirror in `apps/mobile/src/lib/cart.ts` AND server order pricing)
```
FREE_DELIVERY_THRESHOLD_MINOR = 3500   // $35
SERVICE_FEE_RATE              = 0.05    // 5% of subtotal
SERVICE_FEE_MIN_MINOR         = 199     // $1.99 floor
BASE_DELIVERY_FEE_MINOR       = 399     // $3.99 below threshold (0 at/above)
serviceFee = subtotal === 0 ? 0 : max(199, round(subtotal * 0.05))
delivery   = subtotal === 0 ? 0 : (subtotal >= 3500 ? 0 : 399) + slotFee
total      = subtotal + serviceFee + delivery + tip
```
