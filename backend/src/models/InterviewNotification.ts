import { Schema, model, Types } from 'mongoose';

export interface IInterviewNotification {
  applicationId: string;
  roundNumber: number;
  type: 'upcoming_1h' | 'passed';
  sentAt: Date;
}

const InterviewNotificationSchema = new Schema<IInterviewNotification>(
  {
    applicationId: {
      type: String,
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['upcoming_1h', 'passed'],
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure candidate only gets notified once per round per notification type
InterviewNotificationSchema.index({ applicationId: 1, roundNumber: 1, type: 1 }, { unique: true });

export const InterviewNotification = model<IInterviewNotification>(
  'InterviewNotification',
  InterviewNotificationSchema
);
