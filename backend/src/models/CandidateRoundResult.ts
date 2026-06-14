import { Schema, model, Types } from 'mongoose';

export interface ICandidateRoundResult {
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  applicationId: string; // Links this result to the candidate's application
  roundNumber: number; // e.g. 1, 2, 3
  result: 'pass' | 'fail';
  remarks?: string; // Optional comments or feedback
  createdAt?: Date;
  updatedAt?: Date;
}

const CandidateRoundResultSchema = new Schema<ICandidateRoundResult>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicationId: {
      type: String,
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    result: {
      type: String,
      required: true,
      enum: ['pass', 'fail'],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for each round in a candidate's application
CandidateRoundResultSchema.index({ applicationId: 1, roundNumber: 1 }, { unique: true });

export const CandidateRoundResult = model<ICandidateRoundResult>(
  'CandidateRoundResult',
  CandidateRoundResultSchema
);
