import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../../pages/dashboard.css';
import '../../pages/app-pages.css';

/* Shared presentation helpers for the authenticated application pages.
   These are new, page-specific components — the approved Homepage, Login,
   Signup and Dashboard files are untouched. */

export const PageHead = ({ eyebrow, title, subtitle, actions }) => (
  <section className="dash-reveal app-head">
    <div className="min-w-0">
      {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
      <h1 className="app-title">{title}</h1>
      {subtitle && <p className="app-sub">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
  </section>
);

export const CardHead = ({ title, subtitle, right }) => (
  <div className="dash-card-head">
    <div className="min-w-0">
      <h2 className="dash-card-title">{title}</h2>
      {subtitle && <p className="dash-card-sub">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Empty = ({ Icon, title, description, actionLabel, to, onAction }) => (
  <div className="dash-empty">
    <span
      className="w-11 h-11 rounded-xl grid place-items-center mb-3"
      style={{ background: '#EEF5FF', color: '#2563EB' }}
    >
      <Icon className="w-5 h-5" />
    </span>
    <p className="text-[13.5px] font-semibold text-slate-800">{title}</p>
    <p className="mt-1.5 text-[12.5px] text-slate-500 max-w-sm leading-relaxed">{description}</p>
    {actionLabel &&
      (onAction ? (
        <button type="button" onClick={onAction} className="dash-btn dash-btn-primary mt-4 h-9 text-[12.5px]">
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link to={to || '/workspace'} className="dash-btn dash-btn-primary mt-4 h-9 text-[12.5px]">
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      ))}
  </div>
);

export const ErrorBanner = ({ children }) =>
  children ? (
    <div className="dash-reveal flex items-center gap-2.5 rounded-2xl border border-[#F3D6DD] bg-[#FDEEF1]/70 px-4 py-3 text-[12.5px] text-[#B0455C]">
      {children}
    </div>
  ) : null;

export const timeAgo = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 2880) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const statusBadge = (status = '') => {
  const s = String(status).toLowerCase();
  if (s.includes('fail') || s.includes('error') || s.includes('high')) return 'badge-risk';
  if (s.includes('process') || s.includes('pending') || s.includes('queue') || s.includes('medium')) return 'badge-warn';
  if (s.includes('index') || s.includes('complete') || s.includes('ready') || s.includes('done') || s.includes('active'))
    return 'badge-ok';
  return 'badge-info';
};
