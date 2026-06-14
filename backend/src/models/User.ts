import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'recruiter' | 'candidate';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['recruiter', 'candidate'],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
