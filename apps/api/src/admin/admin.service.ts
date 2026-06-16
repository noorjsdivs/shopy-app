import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, resolvePaging } from '../common/pagination';
import { productInclude, publicUserSelect } from '../common/prisma-args';
import {
  orderDetailInclude,
  orderSummaryInclude,
  toOrderDetail,
  toOrderSummary,
} from '../common/order-mapper';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateDepartmentDto,
  CreateStoreDto,
  UpdateStoreDto,
} from './dto/store.dto';
import {
  AdminOrdersQueryDto,
  AdminProductsQueryDto,
  AdminUsersQueryDto,
  UpdateOrderStatusDto,
  UpdateUserRoleDto,
} from './dto/admin-queries.dto';

const adminProductInclude = {
  ...productInclude,
  department: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Products (includes inactive) ----------------------------------------

  async listProducts(query: AdminProductsQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const term = query.search?.trim();
    const where: Prisma.ProductWhereInput = {
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
        include: adminProductInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: adminProductInclude,
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department || department.storeId !== dto.storeId) {
      throw new BadRequestException(
        'Department not found or does not belong to the store.',
      );
    }
    return this.prisma.product.create({
      data: {
        storeId: dto.storeId,
        departmentId: dto.departmentId,
        name: dto.name,
        priceMinor: dto.priceMinor,
        compareAtMinor: dto.compareAtMinor ?? null,
        size: dto.size ?? null,
        brand: dto.brand ?? null,
        description: dto.description ?? null,
        byWeight: dto.byWeight ?? false,
        weightUnit: dto.weightUnit ?? null,
        image: dto.image,
        blurhash: dto.blurhash ?? null,
        tags: dto.tags ?? [],
        boughtRecently: dto.boughtRecently ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: adminProductInclude,
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProduct(id);
    if (dto.departmentId || dto.storeId) {
      const product = await this.prisma.product.findUniqueOrThrow({
        where: { id },
      });
      const departmentId = dto.departmentId ?? product.departmentId;
      const storeId = dto.storeId ?? product.storeId;
      const department = await this.prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department || department.storeId !== storeId) {
        throw new BadRequestException(
          'Department not found or does not belong to the store.',
        );
      }
    }
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: adminProductInclude,
    });
  }

  async softDeleteProduct(id: string) {
    await this.getProduct(id);
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ---- Stores --------------------------------------------------------------

  async listStores() {
    const data = await this.prisma.store.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: { select: { id: true, slug: true, name: true, icon: true } },
        _count: { select: { products: true, departments: true, orders: true } },
      },
    });
    return { data };
  }

  async createStore(dto: CreateStoreDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found.');
    return this.prisma.store.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        logo: dto.logo,
        categoryId: dto.categoryId,
        etaMinutes: dto.etaMinutes,
        deliveryFeeMinor: dto.deliveryFeeMinor ?? 0,
        dealBadge: dto.dealBadge ?? null,
        pricesNote: dto.pricesNote ?? null,
        rating: dto.rating ?? 0,
        boughtRecently: dto.boughtRecently ?? 0,
        brandColor: dto.brandColor ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    await this.ensureStore(id);
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async softDeleteStore(id: string) {
    await this.ensureStore(id);
    await this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addDepartment(storeId: string, dto: CreateDepartmentDto) {
    await this.ensureStore(storeId);
    return this.prisma.department.create({
      data: {
        storeId,
        slug: dto.slug,
        name: dto.name,
        icon: dto.icon,
        sort: dto.sort ?? 0,
      },
    });
  }

  private async ensureStore(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Store not found.');
    return store;
  }

  // ---- Orders --------------------------------------------------------------

  async listOrders(query: AdminOrdersQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.storeId ? { storeId: query.storeId } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderSummaryInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginated(rows.map(toOrderSummary), total, page, pageSize);
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException('Order not found.');
    return toOrderDetail(order);
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Order not found.');

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        events: {
          create: [{ status: dto.status, note: dto.note ?? null }],
        },
      },
      include: orderDetailInclude,
    });
    return toOrderDetail(order);
  }

  // ---- Users ---------------------------------------------------------------

  async listUsers(query: AdminUsersQueryDto) {
    const { page, pageSize, skip, take } = resolvePaging(
      query.page,
      query.pageSize,
    );
    const term = query.search?.trim();
    const where: Prisma.UserWhereInput = term
      ? {
          OR: [
            { email: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    // Guard against removing the last admin.
    if (user.role === Role.ADMIN && dto.role !== Role.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last remaining admin.');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: publicUserSelect,
    });
  }

  /** Used by metrics for a complete status breakdown. */
  static readonly ALL_STATUSES: OrderStatus[] = Object.values(OrderStatus);
}
