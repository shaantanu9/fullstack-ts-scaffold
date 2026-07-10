import { supabase } from './supabase/client';
import { connectDatabase } from './index';
import { hashPassword } from '../utils/password';
import { ROLES } from '../constants/roles';

async function main(): Promise<void> {
  await connectDatabase();

  const adminEmail = 'admin@example.com';

  // Idempotent: upsert on the unique email column so re-running the seed leaves
  // exactly one admin row regardless of how many times it is executed.
  const { error } = await supabase.from('users').upsert(
    {
      email: adminEmail,
      password: await hashPassword('Admin@123456'),
      name: 'Admin User',
      role: ROLES.ADMIN,
    },
    { onConflict: 'email' },
  );

  if (error) {
    throw error;
  }

  console.log('Admin user seeded:', adminEmail);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  });
