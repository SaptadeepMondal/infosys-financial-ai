import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthShell } from '../components/common/AuthShell';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Workflow,
  Brain,
  Link2,
  LineChart,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import './auth.css';

const HIGHLIGHTS = [
  {
    num: '01',
    icon: Workflow,
    title: 'One Research Workspace',
    desc: 'Organize company research, filings and agent conversations in one place.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'Intelligent Analysis',
    desc: 'Let specialized agents investigate financial signals and risks.',
  },
  {
    num: '03',
    icon: Link2,
    title: 'Grounded Results',
    desc: 'Trace important answers back to their original source.',
  },
];

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Senior Financial Analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-stage">
        <section className="auth-hero">
          <span className="auth-chip c1" aria-hidden="true">
            <span className="chip-icon">
              <LineChart className="w-[14px] h-[14px]" />
            </span>
            <span>
              <span className="auth-chip-label">Revenue growth</span>
              <span className="auth-chip-value" style={{ display: 'block' }}>+18.6%</span>
            </span>
          </span>
          <span className="auth-chip c2" aria-hidden="true">
            <span className="chip-icon">
              <FileText className="w-[14px] h-[14px]" />
            </span>
            <span>
              <span className="auth-chip-label">Filings analyzed</span>
              <span className="auth-chip-value" style={{ display: 'block' }}>24,568</span>
            </span>
          </span>
          <span className="auth-chip c3" aria-hidden="true">
            <span className="chip-icon">
              <AlertTriangle className="w-[14px] h-[14px]" />
            </span>
            <span>
              <span className="auth-chip-label">Risk signals</span>
              <span className="auth-chip-value" style={{ display: 'block' }}>312</span>
            </span>
          </span>

          <span className="auth-eyebrow auth-reveal d1">
            <span className="dot" />
            Analyst workspace onboarding
          </span>

          <h1 className="auth-title auth-reveal d2">
            Build your
            <br />
            <span className="accent">research workspace.</span>
          </h1>

          <p className="auth-lede auth-reveal d3">
            Bring filings, financial intelligence and multi-agent analysis together in one grounded
            research environment.
          </p>

          <div className="auth-features">
            {HIGHLIGHTS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} className={`auth-feature auth-reveal d${i + 3}`}>
                <span className="auth-feature-icon">
                  <Icon className="w-[20px] h-[20px]" />
                </span>
                <div>
                  <span className="auth-feature-num">{num}</span>
                  <p className="auth-feature-title">{title}</p>
                  <p className="auth-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <main className="auth-panel">
          <div className="auth-card">
            <h1 className="auth-card-title">Create your analyst account</h1>
            <p className="auth-card-sub">Start building your financial research workspace.</p>

            {error && (
              <div role="alert" className="auth-error">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="auth-field-label">
                  Full name
                </label>
                <div className="auth-input-wrap">
                  <User />
                  <input
                    id="fullName"
                    className="auth-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="auth-field-label">
                  Email address
                </label>
                <div className="auth-input-wrap">
                  <Mail />
                  <input
                    id="email"
                    className="auth-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@infosys.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="auth-field-label">
                  Password
                </label>
                <div className="auth-input-wrap">
                  <Lock />
                  <input
                    id="password"
                    className="auth-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <p className="auth-hint">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>

              <div>
                <label htmlFor="role" className="auth-field-label">
                  Professional role
                </label>
                <div className="auth-input-wrap">
                  <Briefcase />
                  <select
                    id="role"
                    className="auth-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Senior Financial Analyst">Senior Financial Analyst</option>
                    <option value="Investment Banking Analyst">Investment Banking Analyst</option>
                    <option value="Equity Research Associate">Equity Research Associate</option>
                    <option value="Portfolio Manager">Portfolio Manager</option>
                    <option value="Finance Student / Intern">Finance Student / Intern</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
                aria-busy={loading || undefined}
              >
                {loading && <span className="auth-spin" />}
                Create analyst account
              </button>
            </form>

            <p className="auth-foot">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <p className="auth-legal">
              Secure analyst access · Source-grounded financial intelligence
            </p>
          </div>
        </main>
      </div>
    </AuthShell>
  );
};
