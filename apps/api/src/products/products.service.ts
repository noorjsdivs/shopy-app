import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude } from '../common/prisma-args';
import { paginated, resolvePaging } from '../common/pagination';
import { SearchProductsQueryDto } from './dto/search-products-query.dto';

const RELATED_LIMIT = 6;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Product not found.');

    const [related, oftenBoughtWith] = await Promise.all([
      // Same store + department
      this.prisma.product.findMany({
        where: {
          storeId: product.storeId,
          departmentId: product.departmentId,
          isActive: true,
          id: { not: product.id },
        },
        orderBy: { boughtRecently: 'desc' },
        take: RELATED_LIMIT,
        select: { id: true },
      }),
      // Same store, different department
      this.prisma.product.findMany({
        where: {
          storeId: product.storeId,
          departmentId: { not: product.departmentId },
          isActive: true,
        },
        orderBy: { boughtRecently: 'desc' },
        take: RELATED_LIMIT,
        select: { id: true },
      }),
    ]);

    return {
      ...product,
      relatedIds: related.map((p) => p.id),
      oftenBoughtWithIds: oftenBoughtWith.map((p) => p.id),
    };
  }

  async search(query: SearchProductsQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const term = query.search?.trim();
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { brand: { contains: term, mode: 'insensitive' } },
              { tags: { has: term } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { boughtRecently: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }
}
