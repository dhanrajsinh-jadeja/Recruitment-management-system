import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { configureCloudinary } from './config/cloudinary';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import resultRoutes from './routes/resultRoutes';
import { InterviewRound } from './models/InterviewRound';
import { Application } from './models/Application';
import { InterviewNotification } from './models/InterviewNotification';
import { sendUpcomingInterviewEmail } from './config/emailService';

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Configure Cloudinary
configureCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Recruitment Management System API is running...' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/results', resultRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});

// Background job scheduler to check for upcoming interviews in the next hour
const checkUpcomingInterviewsAndNotify = async () => {
  try {
    const now = new Date();
    // Time window: rounds scheduled to start in 50 minutes to 70 minutes from now
    const minTime = new Date(now.getTime() + 50 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 70 * 60 * 1000);

    const upcomingRounds = await InterviewRound.find({
      dateTime: { $gte: minTime, $lte: maxTime },
    });

    if (upcomingRounds.length === 0) {
      return;
    }

    console.log(`[Scheduler] Found ${upcomingRounds.length} upcoming interview round(s) scheduled in the next hour.`);

    for (const round of upcomingRounds) {
      // Find all candidates who applied to this job and are not rejected
      const activeApplications = await Application.find({
        jobId: round.jobId,
        status: { $ne: 'rejected' },
      }).populate('candidateId', 'name email');

      for (const app of activeApplications) {
        // Check if notification already sent for this round
        const alreadyNotified = await InterviewNotification.findOne({
          applicationId: app.applicationId,
          roundNumber: round.roundNumber,
          type: 'upcoming_1h',
        });

        if (alreadyNotified) {
          continue;
        }

        const candidate = app.candidateId as any;
        if (candidate && candidate.email) {
          console.log(`[Scheduler] Sending 1h reminder to ${candidate.email} for round ${round.roundNumber}...`);
          await sendUpcomingInterviewEmail(
            candidate.email,
            candidate.name,
            app.applicationId,
            round.roundName,
            round.dateTime,
            round.interviewLink || ''
          );

          // Save notification log
          const notificationLog = new InterviewNotification({
            applicationId: app.applicationId,
            roundNumber: round.roundNumber,
            type: 'upcoming_1h',
          });
          await notificationLog.save();
        }
      }
    }
  } catch (error: any) {
    console.error(`[Scheduler] Error in checkUpcomingInterviewsAndNotify: ${error.message}`);
  }
};

// Start initial check after 10 seconds, then repeat every 5 minutes
setTimeout(checkUpcomingInterviewsAndNotify, 10 * 1000);
setInterval(checkUpcomingInterviewsAndNotify, 5 * 60 * 1000);
console.log('Background scheduler for upcoming interview round notifications initialized.');
