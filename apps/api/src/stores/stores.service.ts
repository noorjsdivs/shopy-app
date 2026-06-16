import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude } from '../common/prisma-args';
import { paginated, resolvePaging } from '../common/pagination';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { DepartmentQueryDto, DepartmentSort } from './dto/department-query.dto';

const SHELF_LIMIT = 12;

const categorySelect = {
  category: { select: { id: true, slug: true, name: true, icon: true } },
} satisfies Prisma.StoreInclude;

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListStoresQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const where: Prisma.StoreWhereInput = {
      isActive: true,
      ...(query.category ? { category: { slug: query.category } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: categorySelect,
        orderBy: { boughtRecently: 'desc' },
        skip,
        take,
      }),
      this.prisma.store.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async detail(slug: string) {
    const store = await this.prisma.store.findFirst({
      where: { slug, isActive: true },
      include: {
        ...categorySelect,
        departments: { orderBy: { sort: 'asc' } },
      },
    });
    if (!store) throw new NotFoundException('Store not found.');

    const shelves = await Promise.all(
      store.departments.map(async (dept) => ({
        departmentSlug: dept.slug,
        title: dept.name,
        products: await this.prisma.product.findMany({
          where: { storeId: store.id, departmentId: dept.id, isActive: true },
          include: productInclude,
          orderBy: { boughtRecently: 'desc' },
          take: SHELF_LIMIT,
        }),
      })),
    );

    return { ...store, shelves };
  }

  async departmentListing(
    slug: string,
    deptSlug: string,
    query: DepartmentQueryDto,
  ) {
    const store = await this.prisma.store.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!store) throw new NotFoundException('Store not found.');

    const department = await this.prisma.department.findUnique({
      where: { storeId_slug: { storeId: store.id, slug: deptSlug } },
    });
    if (!department) throw new NotFoundException('Department not found.');

    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
      departmentId: department.id,
      isActive: true,
      ...(query.dietary && query.dietary.length
        ? { tags: { hasEvery: query.dietary } }
        : {}),
      ...(query.maxPriceMinor != null
        ? { priceMinor: { lte: query.maxPriceMinor } }
        : {}),
      ...(query.onDealOnly ? { compareAtMinor: { not: null } } : {}),
    };

    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: this.orderForSort(query.sort),
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  private orderForSort(
    sort?: DepartmentSort,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case DepartmentSort.PRICE_ASC:
        return { priceMinor: 'asc' };
      case DepartmentSort.PRICE_DESC:
        return { priceMinor: 'desc' };
      case DepartmentSort.NAME:
        return { name: 'asc' };
      case DepartmentSort.POPULAR:
      default:
        return { boughtRecently: 'desc' };
    }
  }
}
