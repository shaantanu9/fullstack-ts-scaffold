import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectDatabase } from '../src/database';
import { supabase } from '../src/database/supabase/client';
import { redis } from '../src/database/redis';

// A UUID that can never collide with a real row — `.neq` on it deletes every
// user, giving each test a clean slate (Supabase has no `deleteMany()`).
const IMPOSSIBLE_ID = '00000000-0000-0000-0000-000000000000';

beforeAll(async () => {
  await connectDatabase();
  await redis.ping();
});

afterEach(async () => {
  await supabase.from('users').delete().neq('id', IMPOSSIBLE_ID);
  await redis.flushdb();
});

afterAll(async () => {
  await redis.quit();
});
