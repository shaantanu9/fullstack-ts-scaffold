import {
  UserRepository,
  FindUsersResult,
  CreateUserInput,
  UpdateUserData,
  FindUsersOptions,
} from './user.repository';
import { PublicUser, User, UserRole } from '../../types/user';
import { supabase, UserRow, UserUpdate } from '../supabase/client';

// Postgres unique_violation. The DB-agnostic auth service recognises Prisma's
// `P2002` (and Mongo's `11000`); we re-tag the raw Postgres code as `P2002` on
// throw so that service stays byte-identical across all three backends.
const PG_UNIQUE_VIOLATION = '23505';

// Map camelCase sort keys coming from the service/query layer to real DB
// columns. Whitelisted so a caller can never inject an arbitrary column name.
const SORT_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  isActive: 'is_active',
  email: 'email',
  name: 'name',
  role: 'role',
  id: 'id',
};

const toDomainUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  password: row.password,
  name: row.name,
  role: row.role as UserRole,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const toPublicUser = (row: UserRow): PublicUser => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role as UserRole,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

class UniqueViolationError extends Error {
  readonly code = 'P2002';
}

export class SupabaseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    // select('*') deliberately includes the password column — login needs it.
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toDomainUser(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toDomainUser(data) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email,
        password: input.password,
        name: input.name ?? null,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === PG_UNIQUE_VIOLATION) {
        throw new UniqueViolationError('Email already exists');
      }
      throw error;
    }

    return toDomainUser(data);
  }

  async findMany(options: FindUsersOptions): Promise<FindUsersResult> {
    const offset = (options.page - 1) * options.limit;
    const column = SORT_COLUMNS[options.sortBy] ?? 'created_at';

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order(column, { ascending: options.sortOrder === 'asc' })
      .range(offset, offset + options.limit - 1);

    if (error) {
      throw error;
    }

    return {
      users: (data ?? []).map(toPublicUser),
      total: count ?? 0,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const patch: UserUpdate = {};
    if (data.name !== undefined) {
      patch.name = data.name;
    }
    if (data.role !== undefined) {
      patch.role = data.role;
    }
    if (data.isActive !== undefined) {
      patch.is_active = data.isActive;
    }

    const { data: row, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Mirror Prisma/Mongoose: a missing row on update is an error, not a
    // silent no-op. The service pre-checks existence, so this only fires when
    // the repository is called directly.
    if (!row) {
      throw new Error('User not found');
    }

    return toDomainUser(row);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw error;
    }
  }
}
