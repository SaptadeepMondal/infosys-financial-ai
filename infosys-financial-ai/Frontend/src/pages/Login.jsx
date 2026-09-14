import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthShell } from '../components/common/AuthShell';
import {
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  Layers,
  FileCheck,
  LineChart,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import './auth.css';

const HIGHLIGHTS = [
  {
    num: '01',
    icon: Layers,
    title: 'Multi-Agent Research',
    desc: 'Deploy specialized AI agents to investigate filings, financial metrics and company signals.',
  },
  {
    num: '02',
    icon: ShieldCheck,
    title: 'Source-Grounded Intelligence',
    desc: 'Every important insight is connected back to its original source.',
  },
  {
    num: '03',
    icon: FileCheck,
    title: 'Executive-Ready Reports',
    desc: 'Turn complex research into concise summaries, metrics and risk signals.',
  },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, previewLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@infosys.com');
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login('demo@infosys.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      // Backend unavailable -> browse the UI in preview mode
      previewLogin();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-stage">
        {/* ---------------------------- HERO ---------------------------- */}
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
            Multi-Agent Financial Research System
          </span>

          <h1 className="auth-title auth-reveal d2">
            Research deeper.
            <br />
            Decide with <span className="accent">confidence.</span>
          </h1>

          <p className="auth-lede auth-reveal d3">
            An intelligent multi-agent research platform that turns company filings and financial
            data into grounded, actionable insights.
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

        {/* ------------------------ AUTH CARD --------------------------- */}
        <main className="auth-panel">
          <div className="auth-card">
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-sub">Sign in to your analyst research terminal.</p>

            {error && (
              <div role="alert" className="auth-error">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
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
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="auth-label-row">
                  <label htmlFor="password" className="auth-field-label">
                    Password
                  </label>
                  <Link to="/login" className="auth-link-sm">
                    Forgot password?
                  </Link>
                </div>
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
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
                aria-busy={loading || undefined}
              >
                {loading && <span className="auth-spin" />}
                Sign in
              </button>
            </form>

            <div className="auth-divider">Or continue with</div>

            <button
              type="button"
              className="auth-secondary"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spin" />
              ) : (
                <Sparkles className="w-4 h-4" style={{ color: '#3155E7' }} />
              )}
              Use demo analyst credentials
            </button>

            <p className="auth-foot">
              New to Infosys AI? <Link to="/register">Create analyst account</Link>
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
