import { userRepository } from '../database/repositories';
import { UserStats } from '../types/user';

// Pure business layer: delegates the aggregation to the repository so the
// service stays DB-agnostic and identical across both backends.
export const getUserStats = async (): Promise<UserStats> => {
  return userRepository.getStats();
};
