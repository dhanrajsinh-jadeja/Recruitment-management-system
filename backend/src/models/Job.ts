import { Schema, model, Types } from 'mongoose';

export interface IJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements?: string;
  postedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      default: 'Not specified',
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = model<IJob>('Job', JobSchema);
