import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageHead, CardHead } from '../components/app/ui';
import { User, Shield, Key, Cpu, RefreshCw, Database, LogOut, Bell, Mail } from 'lucide-react';
import './dashboard.css';
import './app-pages.css';

export const Profile = () => {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState({ digest: true, riskAlerts: true, reportReady: false });

  const handleResetDemo = () => {
    if (window.confirm('Reset active session and reload demo credentials?')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const name = user?.full_name || 'Demo Analyst';
  const initial = name.charAt(0).toUpperCase();

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <main className="dash-body">
      <PageHead
        eyebrow="Account"
        title="Profile & Settings"
        subtitle="Manage your analyst profile, workspace preferences and session."
        actions={
          <button type="button" className="dash-btn dash-btn-ghost" onClick={handleResetDemo}>
            <RefreshCw className="w-4 h-4" />
            Reset session
          </button>
        }
      />

      <section className="dash-card dash-reveal p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <span className="app-avatar-lg">{initial}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-bold text-slate-900 tracking-tight truncate">{name}</h2>
          <p className="app-meta truncate">{user?.email || 'analyst@infosys.ai'}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="dash-badge badge-info">{user?.role || 'Analyst'}</span>
            <span className="dash-badge badge-ok">Session active</span>
          </div>
        </div>
        <button
          type="button"
          className="dash-btn dash-btn-ghost shrink-0"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="dash-card dash-reveal">
          <CardHead title="Account Details" subtitle="Identity used across research sessions" />
          <div className="p-4">
            <div className="app-kv">
              <span>
                <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Full name
              </span>
              <span>{name}</span>
            </div>
            <div className="app-kv">
              <span>
                <Mail className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Email
              </span>
              <span>{user?.email || 'analyst@infosys.ai'}</span>
            </div>
            <div className="app-kv">
              <span>
                <Shield className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Role
              </span>
              <span>{user?.role || 'Analyst'}</span>
            </div>
            <div className="app-kv">
              <span>
                <Key className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Account ID
              </span>
              <span className="truncate max-w-[200px]">{user?.id || '—'}</span>
            </div>
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead title="Notification Preferences" subtitle="Control what the agents alert you about" />
          <div className="p-4">
            {[
              { key: 'digest', label: 'Daily research digest', desc: 'Summary of new filings and insights' },
              { key: 'riskAlerts', label: 'Risk signal alerts', desc: 'Notify when the Risk Agent flags an issue' },
              { key: 'reportReady', label: 'Report ready alerts', desc: 'Notify when a report finishes generating' },
            ].map((row) => (
              <div key={row.key} className="app-setting">
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-slate-700">{row.label}</span>
                  <span className="block app-meta">{row.desc}</span>
                </span>
                <button
                  type="button"
                  aria-pressed={prefs[row.key]}
                  onClick={() => toggle(row.key)}
                  className={`app-toggle ${prefs[row.key] ? 'is-on' : ''}`}
                />
              </div>
            ))}
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead title="Research Engine" subtitle="Multi-agent stack powering your workspace" />
          <div className="p-4">
            <div className="app-kv">
              <span>
                <Cpu className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Agent pipeline
              </span>
              <span>5 agents active</span>
            </div>
            <div className="app-kv">
              <span>
                <Database className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Vector index
              </span>
              <span>Connected</span>
            </div>
            <div className="app-kv">
              <span>
                <Bell className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Grounded citations
              </span>
              <span>Enabled</span>
            </div>
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead title="Session & Security" subtitle="Manage local session data" />
          <div className="p-4 space-y-3">
            <p className="text-[13.5px] text-slate-600 leading-relaxed">
              Resetting clears local session data and returns you to the sign-in screen. Your indexed filings and
              reports remain untouched.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={handleResetDemo}>
                <RefreshCw className="w-4 h-4" />
                Reset session
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};
