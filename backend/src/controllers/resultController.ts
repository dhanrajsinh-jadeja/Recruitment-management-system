import { Response } from 'express';
import { CandidateRoundResult } from '../models/CandidateRoundResult';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { InterviewRound } from '../models/InterviewRound';
import { InterviewNotification } from '../models/InterviewNotification';
import { sendRoundPassedEmail } from '../config/emailService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const submitRoundResult = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { applicationId, roundNumber, result, remarks } = req.body;

    if (!applicationId || roundNumber === undefined || !result) {
      return res.status(400).json({ message: 'applicationId, roundNumber, and result are required.' });
    }

    if (!['pass', 'fail'].includes(result)) {
      return res.status(400).json({ message: 'Result must be either "pass" or "fail".' });
    }

    // Try finding the application by _id or custom applicationId
    const isObjectId = applicationId.match(/^[0-9a-fA-F]{24}$/);
    const application = await Application.findOne({
      $or: [
        { applicationId: applicationId },
        { _id: isObjectId ? applicationId : null }
      ]
    }).populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Verify recruiter ownership of the associated job
    const job = application.jobId as any;
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only evaluate candidates for your own job postings.' });
    }

    // Create or update result (upsert)
    const updatedResult = await CandidateRoundResult.findOneAndUpdate(
      { applicationId: application.applicationId, roundNumber },
      {
        candidateId: application.candidateId,
        jobId: job._id,
        applicationId: application.applicationId,
        roundNumber,
        result,
        remarks: remarks || '',
      },
      { new: true, upsert: true }
    );

    // Automatically set application status to rejected if candidate failed the round
    if (result === 'fail') {
      application.status = 'rejected';
      await application.save();
    }

    return res.status(200).json({
      message: 'Candidate round result submitted successfully.',
      result: updatedResult,
    });
  } catch (error: any) {
    console.error(`SubmitRoundResult error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while submitting round result.' });
  }
};

export const getJobRoundResults = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobId } = req.params;

    // Verify job exists and recruiter owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view results for your own job postings.' });
    }

    const results = await CandidateRoundResult.find({ jobId });
    return res.status(200).json({ results });
  } catch (error: any) {
    console.error(`GetJobRoundResults error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching round results.' });
  }
};

export const getMyRoundResults = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const results = await CandidateRoundResult.find({ candidateId: req.user.id });
    return res.status(200).json({ results });
  } catch (error: any) {
    console.error(`GetMyRoundResults error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching your results.' });
  }
};

export const uploadResultsCSV = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { jobId, roundNumber } = req.body;
    if (!jobId || roundNumber === undefined) {
      return res.status(400).json({ message: 'jobId and roundNumber are required.' });
    }

    const parsedRoundNumber = parseInt(roundNumber, 10);
    if (isNaN(parsedRoundNumber)) {
      return res.status(400).json({ message: 'roundNumber must be a valid number.' });
    }

    // Verify job exists and recruiter owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only evaluate candidates for your own job postings.' });
    }

    // Check if CSV file is attached
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    // Parse CSV file content from buffer
    const fileContent = req.file.buffer.toString('utf-8');
    
    // Split by newlines, trim, and filter out empty lines
    const lines = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
      return res.status(400).json({ message: 'The uploaded CSV file is empty.' });
    }

    const applicationIds: string[] = [];

    // Parse each line. We look for cells starting with "APP-"
    for (const line of lines) {
      const cells = line.split(',').map(cell => cell.trim());
      for (const cell of cells) {
        if (cell.toUpperCase().startsWith('APP-')) {
          const formattedId = cell.toUpperCase();
          if (!applicationIds.includes(formattedId)) {
            applicationIds.push(formattedId);
          }
        }
      }
    }

    if (applicationIds.length === 0) {
      return res.status(400).json({ message: 'No valid applicationId starting with "APP-" found in the CSV file.' });
    }

    console.log(`Processing bulk round ${parsedRoundNumber} result upload for job ${jobId}. Found ${applicationIds.length} candidate IDs.`);

    const successfulUpdates: any[] = [];
    const invalidIds: string[] = [];

    for (const appId of applicationIds) {
      // Find application matching appId and jobId
      const application = await Application.findOne({ applicationId: appId, jobId: job._id });
      if (!application) {
        invalidIds.push(appId);
        continue;
      }

      // Create or update Mongoose CandidateRoundResult
      const resultDoc = await CandidateRoundResult.findOneAndUpdate(
        { applicationId: appId, roundNumber: parsedRoundNumber },
        {
          candidateId: application.candidateId,
          jobId: job._id,
          applicationId: appId,
          roundNumber: parsedRoundNumber,
          result: 'pass',
          remarks: 'Passed via bulk CSV upload.',
        },
        { new: true, upsert: true }
      );
      successfulUpdates.push(resultDoc);
    }

    return res.status(200).json({
      message: `Successfully evaluated ${successfulUpdates.length} candidates.`,
      updatedCount: successfulUpdates.length,
      invalidIds,
      results: successfulUpdates,
    });
  } catch (error: any) {
    console.error(`UploadResultsCSV error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while processing CSV upload.' });
  }
};

export const notifyPassedCandidates = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { jobId, roundNumber } = req.body;
    if (!jobId || roundNumber === undefined) {
      return res.status(400).json({ message: 'jobId and roundNumber are required.' });
    }

    const parsedRoundNumber = parseInt(roundNumber, 10);
    if (isNaN(parsedRoundNumber)) {
      return res.status(400).json({ message: 'roundNumber must be a valid number.' });
    }

    // Verify job exists and recruiter owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only send notifications for your own job postings.' });
    }

    // Find the interview round details to get the name
    const roundDetails = await InterviewRound.findOne({ jobId: job._id, roundNumber: parsedRoundNumber });
    const roundName = roundDetails ? roundDetails.roundName : `Round ${parsedRoundNumber}`;

    // Find all results for this job and round marked as pass
    const passedResults = await CandidateRoundResult.find({
      jobId: job._id,
      roundNumber: parsedRoundNumber,
      result: 'pass',
    }).populate('candidateId', 'name email');

    console.log(`Found ${passedResults.length} passed candidates for round ${parsedRoundNumber} of job ${jobId}. Sending notifications...`);

    let sentCount = 0;

    for (const result of passedResults) {
      // Check if notification has already been sent
      const alreadySent = await InterviewNotification.findOne({
        applicationId: result.applicationId,
        roundNumber: parsedRoundNumber,
        type: 'passed',
      });

      if (alreadySent) {
        continue;
      }

      const candidate = result.candidateId as any;
      if (candidate && candidate.email) {
        await sendRoundPassedEmail(
          candidate.email,
          candidate.name,
          roundName,
          result.applicationId,
          job.title,
          job.company
        );
        
        // Save notification log
        const notificationLog = new InterviewNotification({
          applicationId: result.applicationId,
          roundNumber: parsedRoundNumber,
          type: 'passed',
        });
        await notificationLog.save();
        sentCount++;
      }
    }

    // Automatically delete failed candidate applications and results for this round
    const failedResults = await CandidateRoundResult.find({
      jobId: job._id,
      roundNumber: parsedRoundNumber,
      result: 'fail',
    });
    const failedAppIds = failedResults.map(r => r.applicationId);

    if (failedAppIds.length > 0) {
      console.log(`Deleting ${failedAppIds.length} failed candidate applications from system/dashboard...`);
      const deleteAppResult = await Application.deleteMany({
        applicationId: { $in: failedAppIds }
      });
      console.log(`Successfully deleted ${deleteAppResult.deletedCount} application(s).`);
    }

    console.log(`Clearing up failed CandidateRoundResult records for round ${parsedRoundNumber} of job ${jobId}...`);
    const deleteResult = await CandidateRoundResult.deleteMany({
      jobId: job._id,
      roundNumber: parsedRoundNumber,
      result: 'fail',
    });
    console.log(`Cleared ${deleteResult.deletedCount} failed CandidateRoundResult document(s).`);

    return res.status(200).json({
      message: `Successfully sent notification emails to ${sentCount} passed candidates and cleaned up failed records.`,
      sentCount,
    });
  } catch (error: any) {
    console.error(`NotifyPassedCandidates error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while sending pass notifications.' });
  }
};

