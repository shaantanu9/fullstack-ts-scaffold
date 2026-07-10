import { SupabaseUserRepository } from './supabase.user.repository';

export const userRepository = new SupabaseUserRepository();

export * from './user.repository';
