import React from 'react';
import { Plus, Eye, Briefcase, MapPin, DollarSign, Trash2, Calendar, Pencil } from 'lucide-react';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string;
  postedBy: string;
  postedAt: string;
}

interface RecruiterDashboardProps {
  user: { name: string; email: string; role: string };
  jobs: Job[];
  onAddJob: () => void;
  onViewResponses: (jobId: string) => void;
  onSetupInterviews: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onLogout: () => void;
  responseCount: (jobId: string) => number;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  user,
  jobs,
  onAddJob,
  onViewResponses,
  onSetupInterviews,
  onEditJob,
  onDeleteJob,
  onLogout,
  responseCount,
}) => {
  const myJobs = jobs.filter((j) => j.postedBy === user.email);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header */}
      <header className="app-header">
        <div className="container flex align-center justify-between app-navbar">
          <div className="flex align-center" style={{ gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '8px',
              background: 'var(--color-indigo)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Briefcase size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px' }}>RecruitOS</span>
          </div>
          <div className="flex align-center" style={{ gap: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Hi, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
            </span>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>Log Out</button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container" style={{ padding: '40px 24px' }}>
        <div className="flex align-center justify-between" style={{ marginBottom: '32px' }}>
          <div>
            <h1 className="page-title">Your Job Postings</h1>
            <p className="page-subtitle">Manage jobs you have posted and review candidate applications.</p>
          </div>
          <button className="btn btn-primary" onClick={onAddJob} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <Plus size={16} /> Post a New Job
          </button>
        </div>

        {myJobs.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No jobs posted yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Post your first job to start receiving candidate applications.
            </p>
            <button className="btn btn-primary" onClick={onAddJob}>Post a Job</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Posted On</th>
                  <th>Responses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.company}</div>
                    </td>
                    <td>
                      <span className="flex align-center" style={{ gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <MapPin size={13} /> {job.location}
                      </span>
                    </td>
                    <td>
                      <span className="flex align-center" style={{ gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <DollarSign size={13} /> {job.salary}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{job.postedAt}</td>
                    <td>
                      <span className={`badge ${responseCount(job.id) > 0 ? 'badge-success' : 'badge-warning'}`}>
                        {responseCount(job.id)} {responseCount(job.id) === 1 ? 'applicant' : 'applicants'}
                      </span>
                    </td>
                    <td>
                      <div className="flex" style={{ gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                          onClick={() => onViewResponses(job.id)}
                        >
                          <Eye size={13} /> Responses
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                          onClick={() => onSetupInterviews(job.id)}
                        >
                          <Calendar size={13} /> Set Rounds
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                          onClick={() => onEditJob(job)}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }}
                          onClick={() => onDeleteJob(job.id)}
                          title="Delete job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
