import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../common/prisma-args';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  create(data: {
    email: string;
    passwordHash: string;
    name?: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data,
      select: publicUserSelect,
    });
  }

  /** Public user projection type (never includes passwordHash). */
  static publicSelect: Prisma.UserSelect = publicUserSelect;
}
