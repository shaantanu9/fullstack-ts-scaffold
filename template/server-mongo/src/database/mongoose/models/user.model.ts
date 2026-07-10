import { Schema, model, HydratedDocument } from 'mongoose';
import { ROLES } from '../../../constants/roles';
import { UserRole } from '../../../types/user';

// Mirrors the Prisma `User` model (server-sql schema.prisma). Field names are
// kept identical so the domain object shape produced by the repository matches.
export interface IUser {
  email: string;
  password: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    // Selectable by default so the login flow (findByEmail) can read the hash.
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR],
      default: ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<IUser>;

export const UserModel = model<IUser>('User', userSchema);
