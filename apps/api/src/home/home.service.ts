import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude } from '../common/prisma-args';

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const HERO_BANNERS = [
  {
    id: 'hero-fresh',
    title: 'Fresh groceries,\ndelivered in minutes',
    subtitle: 'Free delivery on your first order over $35',
    image: img('1542838132-92c53300491e'),
    cta: 'Shop now',
    tone: 'accent' as const,
  },
  {
    id: 'hero-deals',
    title: 'Weekend deals\nare here',
    subtitle: 'Save up to 30% across your favorite stores',
    image: img('1607082348824-0a96f2a4b9da'),
    cta: 'See deals',
    tone: 'deal' as const,
  },
  {
    id: 'hero-organic',
    title: 'Organic picks\nyou will love',
    subtitle: 'Hand-selected from local specialists',
    image: img('1610832958506-aa56368176cf'),
    cta: 'Explore',
    tone: 'accent' as const,
  },
];

const PROMOS = [
  {
    id: 'promo-credit',
    title: '$15 in credits',
    subtitle: 'On your first 3 orders',
    tone: 'accent' as const,
  },
  {
    id: 'promo-deal',
    title: 'Deals up to 30% off',
    subtitle: 'Limited-time savings',
    tone: 'deal' as const,
  },
  {
    id: 'promo-delivery',
    title: 'Free delivery week',
    subtitle: 'Spend $35+ to unlock',
    tone: 'warning' as const,
  },
];

type ProductWithStore = Product & {
  store: { id: string; slug: string; name: string; logo: string; brandColor: string | null };
};

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome() {
    const [categories, stores, dealProducts, popularProducts, produceProducts, storeCount] =
      await Promise.all([
        this.prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, slug: true, name: true, icon: true },
        }),
        this.prisma.store.findMany({
          where: { isActive: true },
          orderBy: { boughtRecently: 'desc' },
          select: {
            id: true,
            etaMinutes: true,
            dealBadge: true,
            boughtRecently: true,
          },
        }),
        this.prisma.product.findMany({
          where: { isActive: true, compareAtMinor: { not: null } },
          include: productInclude,
          orderBy: { boughtRecently: 'desc' },
          take: 60,
        }),
        this.prisma.product.findMany({
          where: { isActive: true },
          include: productInclude,
          orderBy: { boughtRecently: 'desc' },
          take: 60,
        }),
        this.prisma.product.findMany({
          where: { isActive: true, department: { slug: 'produce' } },
          include: productInclude,
          orderBy: { boughtRecently: 'desc' },
          take: 60,
        }),
        this.prisma.store.count({ where: { isActive: true } }),
      ]);

    const nearbyIds = [...stores]
      .sort((a, b) => a.etaMinutes - b.etaMinutes)
      .map((s) => s.id);
    const popularStoreIds = stores.map((s) => s.id); // already by boughtRecently desc
    const dealStoreIds = stores.filter((s) => s.dealBadge).map((s) => s.id);

    const sections = [
      { title: 'Stores near you', storeIds: nearbyIds },
      { title: 'Popular', storeIds: popularStoreIds.slice(0, 8) },
      { title: 'Deals', storeIds: dealStoreIds },
    ];

    const bestDeals = dedupeByName(
      [...(dealProducts as ProductWithStore[])].sort(
        (a, b) =>
          (b.compareAtMinor! - b.priceMinor) - (a.compareAtMinor! - a.priceMinor),
      ),
    ).slice(0, 12);

    const productShelves = [
      {
        id: 'shelf-deals',
        title: "Deals you'll love",
        subtitle: 'Big savings, limited time',
        products: bestDeals,
      },
      {
        id: 'shelf-popular',
        title: 'Popular right now',
        subtitle: 'What everyone is buying',
        products: dedupeByName(popularProducts as ProductWithStore[]).slice(0, 12),
      },
      {
        id: 'shelf-fresh',
        title: 'Fresh picks',
        subtitle: 'Straight from the farm',
        products: dedupeByName(produceProducts as ProductWithStore[]).slice(0, 12),
      },
    ];

    return {
      categories,
      promos: PROMOS,
      heroBanners: HERO_BANNERS,
      sections,
      productShelves,
      storeCount,
    };
  }
}

/** Keep the first product for each distinct name (catalog is cloned across stores). */
function dedupeByName(products: ProductWithStore[]): ProductWithStore[] {
  const seen = new Set<string>();
  const out: ProductWithStore[] = [];
  for (const p of products) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    out.push(p);
  }
  return out;
}
