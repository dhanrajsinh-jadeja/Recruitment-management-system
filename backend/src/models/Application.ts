import { Schema, model, Types } from 'mongoose';

export interface IApplication {
  applicationId: string;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  resumeaUrl: string; // Cloudinary URL for the resume file
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected' | 'underprocess';
  createdAt?: Date;
  updatedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: {
      type: String,
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeaUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['applied', 'shortlisted', 'hired', 'rejected', 'underprocess'],
      default: 'applied',
    },
  },
  {
    timestamps: true,
  }
);

export const Application = model<IApplication>('Application', ApplicationSchema);
