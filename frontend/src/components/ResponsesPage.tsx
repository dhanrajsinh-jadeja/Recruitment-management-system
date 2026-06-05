import React from 'react';
import { ArrowLeft, Briefcase, FileText, User, Mail, Calendar, Download } from 'lucide-react';
import type { Job } from './RecruiterDashboard';

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  resumeName: string;
  appliedAt: string;
}

interface ResponsesPageProps {
  user: { name: string; email: string; role: string };
  job: Job | undefined;
  applications: Application[];
  onBack: () => void;
  onLogout: () => void;
}

export const ResponsesPage: React.FC<ResponsesPageProps> = ({
  user,
  job,
  applications,
  onBack,
  onLogout,
}) => {
  if (!job) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Job not found.</p>
        <button className="btn btn-secondary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

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

      <main className="container" style={{ padding: '40px 24px' }}>
        {/* Back + Title */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Job Summary Card */}
        <div className="dashboard-card" style={{ marginBottom: '32px', padding: '24px' }}>
          <div className="flex align-center justify-between">
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {job.title}
              </h1>
              <div className="flex align-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{job.company}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {job.location}</span>
                {job.salary !== 'Not specified' && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>💰 {job.salary}</span>
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📅 Posted {job.postedAt}</span>
              </div>
            </div>
            <span className={`badge ${applications.length > 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
              {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Candidate Applications
        </h2>

        {applications.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No applications yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Candidates haven't applied to this job yet. Check back later.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app, idx) => (
              <div key={app.id} className="dashboard-card" style={{ padding: '24px' }}>
                <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  {/* Candidate Info */}
                  <div className="flex align-center" style={{ gap: '16px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--color-sky-bg)', color: 'var(--color-indigo)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '16px', flexShrink: 0
                    }}>
                      {app.candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {app.candidateName}
                      </div>
                      <div className="flex align-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
                        <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <Mail size={12} /> {app.candidateEmail}
                        </span>
                        <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <Calendar size={12} /> Applied on {app.appliedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resume */}
                  <div className="flex align-center" style={{ gap: '12px' }}>
                    <div className="flex align-center" style={{
                      gap: '8px', padding: '10px 16px',
                      background: '#f0f4ff', border: '1px solid #c7d2fe',
                      borderRadius: '6px'
                    }}>
                      <FileText size={16} style={{ color: 'var(--color-indigo)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-indigo)' }}>
                        {app.resumeName}
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => alert(`Downloading resume: ${app.resumeName}\n(Backend integration required for real file downloads)`)}
                      title="Download resume"
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                </div>

                {/* Applicant number label */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <span className="badge badge-info">Applicant #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
