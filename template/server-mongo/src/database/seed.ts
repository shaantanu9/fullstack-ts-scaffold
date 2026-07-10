import 'dotenv/config';
import mongoose from './mongoose/connection';
import { appConfig } from '../config/app.config';
import { UserModel } from './mongoose/models/user.model';
import { hashPassword } from '../utils/password';
import { ROLES } from '../constants/roles';

async function main(): Promise<void> {
  await mongoose.connect(appConfig.db.url);

  const adminEmail = 'admin@example.com';

  const existingAdmin = await UserModel.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await UserModel.create({
      email: adminEmail,
      password: await hashPassword('Admin@123456'),
      name: 'Admin User',
      role: ROLES.ADMIN,
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
    void mongoose.disconnect();
  });
