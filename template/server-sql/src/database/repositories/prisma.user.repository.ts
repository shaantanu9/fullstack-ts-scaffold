import { PrismaClient, User as PrismaUser } from '@prisma/client';
import {
  UserRepository,
  FindUsersResult,
  CreateUserInput,
  UpdateUserData,
  FindUsersOptions,
} from './user.repository';
import { PublicUser, User, UserRole, UserStats } from '../../types/user';

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const toDomainUser = (user: PrismaUser): User => ({
  id: user.id,
  email: user.email,
  password: user.password,
  name: user.name,
  role: user.role as UserRole,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as UserRole,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomainUser(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: input,
    });
    return toDomainUser(user);
  }

  async findMany(options: FindUsersOptions): Promise<FindUsersResult> {
    const skip = (options.page - 1) * options.limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: options.limit,
        orderBy: { [options.sortBy]: options.sortOrder },
        select: publicUserSelect,
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users.map(toPublicUser),
      total,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return toDomainUser(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Aggregated counts computed in the database (not in app code): `groupBy`
  // buckets by role and filtered `count`s roll up totals/active/recent in a
  // single round-trip each, run concurrently.
  async getStats(): Promise<UserStats> {
    const since = new Date(Date.now() - RECENT_WINDOW_MS);

    const [total, active, roleGroups, recentSignups] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
    ]);

    const byRole: Record<UserRole, number> = { USER: 0, ADMIN: 0, MODERATOR: 0 };
    for (const group of roleGroups) {
      byRole[group.role as UserRole] = group._count._all;
    }

    return {
      total,
      active,
      inactive: total - active,
      byRole,
      recentSignups,
    };
  }
}
