import { MongooseUserRepository } from './mongoose.user.repository';

export const userRepository = new MongooseUserRepository();

export * from './user.repository';
