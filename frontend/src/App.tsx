import { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AddJobPage } from './components/AddJobPage';
import { ResponsesPage } from './components/ResponsesPage';
import { ApplicantDashboard } from './components/ApplicantDashboard';
import type { Job } from './components/RecruiterDashboard';
import type { Application } from './components/ResponsesPage';

type View =
  | 'auth'
  | 'recruiter-dashboard'
  | 'add-job'
  | 'responses'
  | 'applicant-dashboard';

interface User {
  name: string;
  email: string;
  role: 'recruiter' | 'applicant';
}

// Seed data — pre-loaded sample jobs so applicants see listings right away
const SEED_JOBS: Job[] = [
  {
    id: 'seed-1',
    title: 'Frontend Developer',
    company: 'TechNova Solutions',
    location: 'Remote',
    salary: '₹8–14 LPA',
    description:
      'We are looking for a skilled Frontend Developer with experience in React and TypeScript. You will work with cross-functional teams to build fast, accessible, and beautiful user interfaces.',
    requirements:
      'React, TypeScript, CSS, REST APIs, Git. 2+ years of experience preferred.',
    postedBy: 'hr@technova.com',
    postedAt: 'Jun 1, 2026',
  },
  {
    id: 'seed-2',
    title: 'Backend Engineer (Node.js)',
    company: 'CloudBase Inc.',
    location: 'Bangalore, India',
    salary: '₹12–20 LPA',
    description:
      'Join our backend team to design scalable REST APIs and microservices. You will work on high-traffic systems and collaborate with senior architects.',
    requirements:
      'Node.js, Express, MongoDB, AWS, Docker. 3+ years of experience.',
    postedBy: 'recruit@cloudbase.io',
    postedAt: 'May 28, 2026',
  },
  {
    id: 'seed-3',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    location: 'Mumbai, India',
    salary: '₹6–10 LPA',
    description:
      'Design intuitive user experiences for web and mobile applications. You will create wireframes, prototypes, and collaborate with developers to deliver polished products.',
    requirements:
      'Figma, Adobe XD, user research, prototyping. Portfolio required.',
    postedBy: 'jobs@creativestudio.in',
    postedAt: 'May 25, 2026',
  },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // ── Auth ──────────────────────────────────────────────
  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setView(u.role === 'recruiter' ? 'recruiter-dashboard' : 'applicant-dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setSelectedJobId(null);
  };

  // ── Recruiter actions ─────────────────────────────────
  const handleJobAdded = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
    setView('recruiter-dashboard');
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  const handleViewResponses = (jobId: string) => {
    setSelectedJobId(jobId);
    setView('responses');
  };

  const responseCount = (jobId: string) =>
    applications.filter((a) => a.jobId === jobId).length;

  // ── Applicant actions ─────────────────────────────────
  const handleApply = (application: Application) => {
    setApplications((prev) => [application, ...prev]);
  };

  // ── Render ────────────────────────────────────────────
  if (!user || view === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (view === 'recruiter-dashboard') {
    return (
      <RecruiterDashboard
        user={user}
        jobs={jobs}
        onAddJob={() => setView('add-job')}
        onViewResponses={handleViewResponses}
        onDeleteJob={handleDeleteJob}
        onLogout={handleLogout}
        responseCount={responseCount}
      />
    );
  }

  if (view === 'add-job') {
    return (
      <AddJobPage
        user={user}
        onJobAdded={handleJobAdded}
        onBack={() => setView('recruiter-dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'responses') {
    const job = jobs.find((j) => j.id === selectedJobId);
    const jobApplications = applications.filter((a) => a.jobId === selectedJobId);
    return (
      <ResponsesPage
        user={user}
        job={job}
        applications={jobApplications}
        onBack={() => setView('recruiter-dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'applicant-dashboard') {
    const myApplications = applications.filter(
      (a) => a.candidateEmail === user.email
    );
    return (
      <ApplicantDashboard
        user={user}
        jobs={jobs}
        myApplications={myApplications}
        onApply={handleApply}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;
