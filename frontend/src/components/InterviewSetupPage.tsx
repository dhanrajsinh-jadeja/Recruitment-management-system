import React, { useState } from 'react';
import { Briefcase, ArrowLeft, Calendar, Plus, Trash2, Clock, Info, Pencil, X } from 'lucide-react';
import type { Job } from './RecruiterDashboard';
import type { InterviewRound } from '../App';

interface InterviewSetupPageProps {
  user: { name: string; email: string; role: string };
  job: Job | undefined;
  rounds: InterviewRound[];
  onUpdateRounds: (rounds: InterviewRound[]) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const InterviewSetupPage: React.FC<InterviewSetupPageProps> = ({
  user,
  job,
  rounds,
  onUpdateRounds,
  onBack,
  onLogout,
}) => {
  const [roundName, setRoundName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [resultDeclaration, setResultDeclaration] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [interviewLink, setInterviewLink] = useState('');
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);

  if (!job) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Job not found.</p>
        <button className="btn btn-secondary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName || !dateTime) {
      alert('Please fill out all required fields.');
      return;
    }

    if (new Date(dateTime).getTime() < Date.now() && !editingRoundId) {
      alert('Cannot schedule an interview round in the past. Please select a future date and time.');
      return;
    }

    if (isOnline && !interviewLink) {
      alert('Please provide an interview link for online rounds.');
      return;
    }

    if (editingRoundId) {
      const updatedRounds = rounds
        .map((r) =>
          r.id === editingRoundId
            ? {
                ...r,
                roundName,
                dateTime,
                resultDeclaration: resultDeclaration || 'TBD (To Be Declared)',
                isOnline,
                interviewLink: isOnline ? interviewLink : undefined,
              }
            : r
        )
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      onUpdateRounds(updatedRounds);
      setEditingRoundId(null);
      alert('Interview round updated successfully!');
    } else {
      const newRound: InterviewRound = {
        id: Date.now().toString(),
        roundNumber: rounds.length + 1,
        roundName,
        dateTime,
        resultDeclaration: resultDeclaration || 'TBD (To Be Declared)',
        isOnline,
        interviewLink: isOnline ? interviewLink : undefined,
      };

      const updatedRounds = [...rounds, newRound].sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );

      onUpdateRounds(updatedRounds);
      alert(`📧 Mock system: Automated email notification scheduled to be dispatched to all candidates 1 hour prior to the interview with link: ${isOnline ? interviewLink : 'N/A'}`);
    }

    setRoundName('');
    setDateTime('');
    setResultDeclaration('');
    setIsOnline(false);
    setInterviewLink('');
  };

  const handleEditClick = (round: InterviewRound) => {
    setRoundName(round.roundName);
    setDateTime(round.dateTime);
    setResultDeclaration(round.resultDeclaration);
    setIsOnline(round.isOnline);
    setInterviewLink(round.interviewLink || '');
    setEditingRoundId(round.id);
  };

  const handleCancelEdit = () => {
    setRoundName('');
    setDateTime('');
    setResultDeclaration('');
    setIsOnline(false);
    setInterviewLink('');
    setEditingRoundId(null);
  };

  const handleDeleteRound = (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview round?')) {
      const updatedRounds = rounds.filter((r) => r.id !== id);
      onUpdateRounds(updatedRounds);
      if (editingRoundId === id) {
        handleCancelEdit();
      }
    }
  };

  const formatDateTime = (dtStr: string) => {
    try {
      const date = new Date(dtStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

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

      <main className="container" style={{ padding: '40px 24px', maxWidth: '1000px' }}>
        {/* Back navigation */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Job Title Box */}
        <div className="dashboard-card" style={{ marginBottom: '32px', padding: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Interview Rounds Setup
          </h1>
          <div className="flex align-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', color: 'var(--color-indigo)', fontWeight: 600 }}>{job.title}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{job.company}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {job.location}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* List of rounds */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Scheduled Rounds ({rounds.length})
            </h2>

            {rounds.length === 0 ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '15px' }}>No rounds scheduled</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Use the setup form to add the first round of interviews.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rounds.map((round, index) => (
                  <div key={round.id} className="dashboard-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: editingRoundId === round.id ? '2px solid var(--color-indigo)' : undefined }}>
                    <div style={{ flex: 1 }}>
                      <div className="flex align-center" style={{ gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>Round {index + 1}</span>
                        <span className={`badge ${round.isOnline ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                          {round.isOnline ? 'Online' : 'Offline'}
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{round.roundName}</h4>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="flex align-center" style={{ gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <Clock size={13} style={{ color: 'var(--color-indigo)' }} />
                          {formatDateTime(round.dateTime)}
                        </span>
                        {round.isOnline && round.interviewLink && (
                          <span className="flex align-center" style={{ gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <strong>Link:</strong> <a href={round.interviewLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-indigo)', textDecoration: 'underline' }}>{round.interviewLink}</a>
                          </span>
                        )}
                        <span className="flex align-center" style={{ gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <Info size={13} style={{ color: 'var(--color-teal)' }} />
                          <strong>Results:</strong> {round.resultDeclaration}
                        </span>
                      </div>
                    </div>

                    <div className="flex" style={{ gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', height: 'fit-content', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleEditClick(round)}
                        title="Edit round"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', height: 'fit-content' }}
                        onClick={() => handleDeleteRound(round.id)}
                        title="Delete round"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to add a round */}
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {editingRoundId ? 'Update Interview Round' : 'Add Interview Round'}
            </h2>
            <form onSubmit={handleAddRound}>
              <div className="form-group">
                <label className="form-label">Round Name / Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Round 1: Coding Assessment"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-input"
                  min={getMinDateTime()}
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interview Mode</label>
                <div className="flex" style={{ gap: '20px', margin: '8px 0' }}>
                  <label className="flex align-center" style={{ gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input
                      type="radio"
                      name="mode"
                      checked={!isOnline}
                      onChange={() => { setIsOnline(false); setInterviewLink(''); }}
                    />
                    Offline (In-person)
                  </label>
                  <label className="flex align-center" style={{ gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input
                      type="radio"
                      name="mode"
                      checked={isOnline}
                      onChange={() => setIsOnline(true)}
                    />
                    Online
                  </label>
                </div>
              </div>

              {isOnline && (
                <div className="form-group">
                  <label className="form-label">Interview Link <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    📧 Candidate will receive a mock invitation email 1 hour prior.
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Result Declaration Date / Info</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Results declared by June 12, 2026"
                  value={resultDeclaration}
                  onChange={(e) => setResultDeclaration(e.target.value)}
                />
              </div>

              <div className="flex" style={{ gap: '10px' }}>
                {editingRoundId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <X size={14} /> Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus size={16} /> {editingRoundId ? 'Update Round' : 'Add Round'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
