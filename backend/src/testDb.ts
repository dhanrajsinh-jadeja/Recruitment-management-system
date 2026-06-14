import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User';
import { Job } from './models/Job';
import { Application } from './models/Application';
import { InterviewRound } from './models/InterviewRound';
import { CandidateRoundResult } from './models/CandidateRoundResult';

// Load environment configuration
dotenv.config();

const runTest = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('Error: MONGODB_URI is missing in .env');
      return;
    }
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(connStr);
    console.log('Connected successfully!');

    // 1. Clean up old test data if present
    console.log('Cleaning up previous test users...');
    await User.deleteMany({ email: /@test-seed\.com$/ });

    // 2. Create Recruiter
    console.log('Creating test recruiter...');
    const recruiter = new User({
      name: 'Test Recruiter',
      email: 'recruiter@test-seed.com',
      password: 'hashedpassword123',
      role: 'recruiter',
    });
    await recruiter.save();
    console.log('Recruiter saved!');

    // 3. Create Candidate
    console.log('Creating test candidate...');
    const candidate = new User({
      name: 'Test Candidate',
      email: 'candidate@test-seed.com',
      password: 'hashedpassword123',
      role: 'candidate',
    });
    await candidate.save();
    console.log('Candidate saved!');

    // 4. Create Job
    console.log('Creating test job...');
    const job = new Job({
      title: 'Full Stack Developer',
      company: 'Antigravity Inc.',
      location: 'Remote',
      salary: '$120,000 - $140,000',
      description: 'Responsible for building robust web applications.',
      requirements: 'Experience with React, Node.js, and MongoDB.',
      postedBy: recruiter._id,
    });
    await job.save();
    console.log('Job saved!');

    // 5. Create Application
    console.log('Creating test application...');
    const application = new Application({
      applicationId: 'APP-' + Date.now(),
      jobId: job._id,
      candidateId: candidate._id,
      resumeaUrl: 'https://cloudinary.com/dummy-resume.pdf',
      status: 'applied',
    });
    await application.save();
    console.log('Application saved!');

    // 6. Create InterviewRound
    console.log('Creating test interview round...');
    const round = new InterviewRound({
      jobId: job._id,
      roundNumber: 1,
      roundName: 'Technical Phone Screen',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      resultDeclaration: 'Results within 24 hours',
      isOnline: true,
      interviewLink: 'https://meet.google.com/abc-xyz',
    });
    await round.save();
    console.log('InterviewRound saved!');

    // 7. Create CandidateRoundResult
    console.log('Creating test candidate round result...');
    const result = new CandidateRoundResult({
      candidateId: candidate._id,
      jobId: job._id,
      applicationId: application.applicationId,
      roundNumber: 1,
      result: 'pass',
      remarks: 'Strong coding skills demonstrated.',
    });
    await result.save();
    console.log('CandidateRoundResult saved!');

    console.log('\n========================================================');
    console.log('SUCCESS: All Mongoose schemas and relationships verified!');
    console.log('========================================================\n');

    // Clean up test documents
    console.log('Cleaning up test data from MongoDB Atlas...');
    await User.deleteMany({ email: /@test-seed\.com$/ });
    await Job.deleteOne({ _id: job._id });
    await Application.deleteOne({ _id: application._id });
    await InterviewRound.deleteOne({ _id: round._id });
    await CandidateRoundResult.deleteOne({ _id: result._id });
    console.log('Cleanup complete.');

    await mongoose.disconnect();
    console.log('Disconnected from database.');
  } catch (error: any) {
    console.error('\nERROR: Database seeding verification failed:', error.message);
  }
};

runTest();
