import { isValidObjectId } from 'mongoose';
import {
  UserRepository,
  FindUsersResult,
  CreateUserInput,
  UpdateUserData,
  FindUsersOptions,
} from './user.repository';
import { PublicUser, User, UserRole, UserStats } from '../../types/user';
import { UserModel, UserDocument } from '../mongoose/models/user.model';

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Typed shape of the `$facet` aggregation result below.
interface StatsFacet {
  totals: { total: number; active: number }[];
  roles: { _id: UserRole; count: number }[];
  recent: { count: number }[];
}

export class MongooseUserRepository implements UserRepository {
  private toDomain(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name ?? null,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private toPublic(doc: UserDocument): PublicUser {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name ?? null,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    // A non-ObjectId id (e.g. a UUID) can never match — treat as "not found"
    // instead of letting Mongoose throw a CastError, matching Prisma semantics.
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await UserModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create(input);
    return this.toDomain(doc);
  }

  async findMany(options: FindUsersOptions): Promise<FindUsersResult> {
    const skip = (options.page - 1) * options.limit;

    const [docs, total] = await Promise.all([
      UserModel.find()
        .sort({ [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(options.limit)
        .exec(),
      UserModel.countDocuments().exec(),
    ]);

    return {
      users: docs.map((doc) => this.toPublic(doc)),
      total,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!doc) {
      throw new Error('User not found');
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id).exec();
  }

  // A single aggregation pipeline computes every bucket in one round-trip:
  // `$facet` fans out into parallel sub-pipelines — totals/active via a
  // conditional `$sum`, per-role counts via `$group`, and recent signups via
  // `$match` + `$count`. Mirrors the Prisma repository's `getStats` output.
  async getStats(): Promise<UserStats> {
    const since = new Date(Date.now() - RECENT_WINDOW_MS);

    const [result] = await UserModel.aggregate<StatsFacet>([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: ['$isActive', 1, 0] } },
              },
            },
          ],
          roles: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          recent: [{ $match: { createdAt: { $gte: since } } }, { $count: 'count' }],
        },
      },
    ]);

    const totals = result.totals[0] ?? { total: 0, active: 0 };
    const byRole: Record<UserRole, number> = { USER: 0, ADMIN: 0, MODERATOR: 0 };
    for (const role of result.roles) {
      byRole[role._id] = role.count;
    }

    return {
      total: totals.total,
      active: totals.active,
      inactive: totals.total - totals.active,
      byRole,
      recentSignups: result.recent[0]?.count ?? 0,
    };
  }
}
