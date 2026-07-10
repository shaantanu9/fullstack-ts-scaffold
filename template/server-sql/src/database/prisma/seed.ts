import { getPrisma } from './client';
import { hashPassword } from '../../utils/password';
import { ROLES } from '../../constants/roles';

async function main(): Promise<void> {
  const prisma = getPrisma();
  const adminEmail = 'admin@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await hashPassword('Admin@123456'),
        name: 'Admin User',
        role: ROLES.ADMIN,
      },
    });
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(() => {
    void getPrisma().$disconnect();
  });
