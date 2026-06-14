import { Schema, model, Types } from 'mongoose';

export interface IInterviewRound {
  jobId: Types.ObjectId;
  roundNumber: number; // 1, 2, 3, etc.
  roundName: string; // e.g. "Technical Interview 1"
  dateTime: Date;
  resultDeclaration: string; // details or deadline for results
  isOnline: boolean;
  interviewLink?: string; // only if isOnline is true
  createdAt?: Date;
  updatedAt?: Date;
}

const InterviewRoundSchema = new Schema<IInterviewRound>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    resultDeclaration: {
      type: String,
      required: true,
      trim: true,
    },
    isOnline: {
      type: Boolean,
      required: true,
      default: false,
    },
    interviewLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewRound = model<IInterviewRound>('InterviewRound', InterviewRoundSchema);
