import { Response } from 'express';
import { InterviewRound } from '../models/InterviewRound';
import { Job } from '../models/Job';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getJobRounds = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const rounds = await InterviewRound.find({ jobId }).sort({ roundNumber: 1 });
    return res.status(200).json({ rounds });
  } catch (error: any) {
    console.error(`GetJobRounds error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching rounds.' });
  }
};

export const updateJobRounds = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobId } = req.params;
    const { rounds } = req.body;

    if (!Array.isArray(rounds)) {
      return res.status(400).json({ message: 'Rounds must be an array.' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Verify ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only set rounds for your own jobs.' });
    }

    // Delete existing rounds
    await InterviewRound.deleteMany({ jobId });

    // Save new rounds
    const savedRounds = [];
    for (const r of rounds) {
      const { roundNumber, roundName, dateTime, resultDeclaration, isOnline, interviewLink } = r;

      if (!roundNumber || !roundName || !dateTime || !resultDeclaration) {
        return res.status(400).json({ message: 'Missing required fields in one or more rounds.' });
      }

      const newRound = new InterviewRound({
        jobId,
        roundNumber,
        roundName,
        dateTime: new Date(dateTime),
        resultDeclaration,
        isOnline: !!isOnline,
        interviewLink: isOnline ? interviewLink : undefined,
      });

      await newRound.save();
      savedRounds.push(newRound);
    }

    return res.status(200).json({
      message: 'Interview rounds updated successfully.',
      rounds: savedRounds,
    });
  } catch (error: any) {
    console.error(`UpdateJobRounds error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while saving rounds.' });
  }
};
