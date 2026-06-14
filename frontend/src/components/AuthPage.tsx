import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../config';


interface AuthPageProps {
  onAuthSuccess: (user: { name: string; email: string; role: 'recruiter' | 'applicant' }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'recruiter' | 'applicant'>('recruiter');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin
        ? { email, password }
        : { name, email, password, role: role === 'applicant' ? 'candidate' : 'recruiter' };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save token in localStorage
      localStorage.setItem('rms_token', data.token);

      // Trigger success callback
      onAuthSuccess({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role === 'candidate' ? 'applicant' : 'recruiter',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center align-center" style={{ minHeight: 'calc(100vh - 120px)', padding: '40px 24px' }}>
      <div className="dashboard-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '50%',
            background: 'var(--color-sky-bg)',
            color: 'var(--color-indigo)',
            marginBottom: '16px'
          }}>
            <Briefcase size={32} />
          </div>
          <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isLogin ? 'RecruitOS Login' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isLogin ? 'Access your recruitment workspace' : 'Register your profile to get started'}
          </p>
        </div>

        {/* Role Toggles */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'recruiter' ? 'active' : ''}`}
            onClick={() => setRole('recruiter')}
            disabled={loading}
          >
            Recruiter
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'applicant' ? 'active' : ''}`}
            onClick={() => setRole('applicant')}
            disabled={loading}
          >
            Applicant
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#b91c1c',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="John Doe"
                  style={{ paddingLeft: '38px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle between Register/Login */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-indigo)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                disabled={loading}
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-indigo)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                disabled={loading}
              >
                Log in
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
