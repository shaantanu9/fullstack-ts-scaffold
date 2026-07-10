import {
  User,
  PublicUser,
  CreateUserInput,
  UpdateUserData,
  FindUsersOptions,
  UserStats,
} from '../../types/user';

export {
  User,
  PublicUser,
  CreateUserInput,
  UpdateUserData,
  FindUsersOptions,
  UserStats,
} from '../../types/user';

export interface FindUsersResult {
  users: PublicUser[];
  total: number;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  findMany(options: FindUsersOptions): Promise<FindUsersResult>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  getStats(): Promise<UserStats>;
}
