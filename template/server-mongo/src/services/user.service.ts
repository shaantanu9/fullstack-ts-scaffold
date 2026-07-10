import { userRepository } from '../database/repositories';
import { ApiError } from '../utils/ApiError';
import { MESSAGES } from '../constants/messages';
import { UpdateUserInput } from '../validations/user.schema';
import { PaginationQuery, PaginatedResult } from '../types/api';
import { PublicUser } from '../types/user';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const findAllUsers = async (
  query: PaginationQuery,
): Promise<PaginatedResult<PublicUser>> => {
  const page = Number(query.page) || DEFAULT_PAGE;
  const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  const { users, total } = await userRepository.findMany({
    page,
    limit,
    sortBy,
    sortOrder,
  });

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findUserById = async (id: string): Promise<PublicUser> => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<PublicUser> => {
  await findUserById(id);

  const user = await userRepository.update(id, input);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const deleteUser = async (id: string): Promise<void> => {
  await findUserById(id);
  await userRepository.delete(id);
};
