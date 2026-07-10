import { supabase } from './supabase/client';
import logger from '../utils/logger';

export { userRepository } from './repositories';

// Lightweight reachability check against the `users` table. `head: true` sends
// no rows back (just a count), so this is a cheap round-trip that proves the
// Supabase REST endpoint and schema are actually reachable.
const pingDatabase = async (): Promise<void> => {
  const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
  if (error) {
    throw error;
  }
};

export const connectDatabase = async (): Promise<void> => {
  await pingDatabase();
  logger.info('Supabase connected successfully');
};

// The Supabase JS client is stateless HTTP — there is no persistent connection
// to tear down, so disconnect is a no-op that resolves immediately.
export const disconnectDatabase = async (): Promise<void> => {
  return Promise.resolve();
};

// Readiness probe: verifies the database is actually reachable, not just that
// the process is up. Kept DB-agnostic at the call site (see /ready in app.ts).
export const checkDatabaseHealth = async (): Promise<boolean> => {
  const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
  return !error;
};
