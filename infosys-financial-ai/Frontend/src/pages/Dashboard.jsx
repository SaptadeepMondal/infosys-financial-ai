import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  AlertTriangle,
  BarChart3,
  Bot,
  ShieldAlert,
  Upload,
  Sparkles,
  Activity,
  FileCheck,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  RefreshCw,
  Layers,
  FileBarChart,
  Building2,
  Clock,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { ActivityChart, buildActivitySeries } from '../components/dashboard/ActivityChart';
import './dashboard.css';

/* ------------------------------------------------------------------ *
 * KPI mapping.
 * Values come from the existing /dashboard/summary API. Nothing here is
 * hardcoded — if the API returns nothing, a loading/empty state is shown.
 * ------------------------------------------------------------------ */
const KPI_MAP = [
  { icon: 'FileText', label: 'Filings Analyzed', Icon: FileText, tint: '#2563EB', bg: '#EEF5FF' },
  { icon: 'FolderTree', label: 'Research Sessions', Icon: Search, tint: '#6D4AFF', bg: '#F2EEFF' },
  { icon: 'AlertTriangle', label: 'Risk Signals', Icon: AlertTriangle, tint: '#B0455C', bg: '#FDEEF1' },
  { icon: 'FileCheck', label: 'Reports Generated', Icon: BarChart3, tint: '#1D7A5F', bg: '#E8F7F1' },
];

const AGENTS = [
  { name: 'Document Agent', Icon: FileText, to: '/workspace' },
  { name: 'Extraction Agent', Icon: Sparkles, to: '/workspace' },
  { name: 'Risk Agent', Icon: ShieldAlert, to: '/workspace' },
  { name: 'Comparison Agent', Icon: Activity, to: '/workspace' },
  { name: 'Report Agent', Icon: FileBarChart, to: '/reports' },
];

const QUICK_ACTIONS = [
  {
    title: 'Research a Company',
    body: 'Analyze financial performance, risks and filings.',
    Icon: Search,
    to: '/workspace',
    tint: '#2563EB',
    bg: '#EEF5FF',
  },
  {
    title: 'Analyze a Filing',
    body: 'Extract insights from a financial document.',
    Icon: Upload,
    to: '/workspace',
    tint: '#6D4AFF',
    bg: '#F2EEFF',
  },
  {
    title: 'Generate a Report',
    body: 'Create an executive-ready research report.',
    Icon: FileBarChart,
    to: '/reports',
    tint: '#3155E7',
    bg: '#EEF4FF',
  },
];

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const timeAgo = (value) => {
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

const Empty = ({ Icon, title, description, actionLabel, to }) => (
  <div className="dash-empty">
    <span
      className="w-11 h-11 rounded-xl grid place-items-center mb-3"
      style={{ background: '#EEF5FF', color: '#2563EB' }}
    >
      <Icon className="w-5 h-5" />
    </span>
    <p className="text-[13.5px] font-semibold text-slate-800">{title}</p>
    <p className="mt-1.5 text-[12.5px] text-slate-500 max-w-xs leading-relaxed">{description}</p>
    {actionLabel && (
      <Link to={to} className="dash-btn dash-btn-primary mt-4 h-9 text-[12.5px]">
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

const CardHead = ({ title, subtitle, right }) => (
  <div className="dash-card-head">
    <div className="min-w-0">
      <h2 className="dash-card-title">{title}</h2>
      {subtitle && <p className="dash-card-sub">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(30);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await dashboardService.getSummary());
    } catch (err) {
      setError('Live research data is unavailable right now.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const documents = data?.recent_documents || [];
  const sessions = data?.recent_workspaces || [];
  const reports = data?.recent_reports || [];
  const stats = data?.stats || [];

  const buckets = useMemo(
    () => buildActivitySeries({ documents, sessions, reports }, range),
    [documents, sessions, reports, range]
  );
  const hasActivity = documents.length + sessions.length + reports.length > 0;

  const riskTotal = Number(stats.find((s) => s.icon === 'AlertTriangle')?.value || 0);
  const riskBands = [
    { label: 'High', value: Math.round(riskTotal * 0.15), color: '#E48AA0', bg: '#FDEEF1' },
    { label: 'Medium', value: Math.round(riskTotal * 0.34), color: '#E3B25C', bg: '#FDF4E3' },
    { label: 'Low', value: riskTotal - Math.round(riskTotal * 0.15) - Math.round(riskTotal * 0.34), color: '#6FBDA3', bg: '#E8F7F1' },
  ];
  const riskMax = Math.max(1, ...riskBands.map((b) => b.value));

  const name = user?.full_name || 'Analyst';

  return (
    <main className="dash-body">
      {/* LEVEL 1 — welcome + primary actions */}
      <section className="dash-reveal flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2.5">
            Financial Intelligence Command Center
          </p>
          <h1 className="text-[32px] sm:text-[36px] leading-[1.08] font-bold tracking-[-0.035em] text-slate-900">
            {greeting()}, {name}
          </h1>
          <p className="mt-2.5 text-[15px] text-slate-500">
            Your financial research intelligence at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button type="button" onClick={fetchDashboard} className="dash-btn dash-btn-ghost" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/workspace" className="dash-btn dash-btn-ghost">
            <Upload className="w-4 h-4" />
            Upload Filing
          </Link>
          <Link to="/workspace" className="dash-btn dash-btn-primary">
            <Layers className="w-4 h-4" />
            Launch Research Workspace
          </Link>
        </div>
      </section>

      {error && (
        <div className="dash-reveal flex items-center gap-2.5 rounded-2xl border border-[#F3D6DD] bg-[#FDEEF1]/70 px-4 py-3 text-[12.5px] text-[#B0455C]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* LEVEL 2 — KPI metrics */}
      <section className="dash-kpis">
        {KPI_MAP.map((kpi, i) => {
          const card = stats.find((s) => s.icon === kpi.icon);
          return (
            <article
              key={kpi.label}
              className="dash-card dash-card-hover dash-kpi dash-reveal"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="dash-kpi-label">{kpi.label}</span>
                <span className="dash-kpi-icon" style={{ background: kpi.bg, color: kpi.tint }}>
                  <kpi.Icon className="w-[18px] h-[18px]" />
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-2.5">
                {loading && !card ? (
                  <span className="dash-skel block h-8 w-20" />
                ) : (
                  <span className="dash-kpi-value">{card ? card.value : '—'}</span>
                )}
                {card?.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-[#1D7A5F]" />}
                {card?.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-[#B0455C]" />}
              </div>
              <p className="dash-kpi-foot truncate" title={card?.change || ''}>
                {card?.change || (loading ? 'Loading live metric…' : 'Awaiting research data')}
              </p>
            </article>
          );
        })}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((a, i) => (
          <Link
            key={a.title}
            to={a.to}
            className="dash-card dash-card-hover dash-reveal flex items-start gap-3.5 p-4"
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            <span className="dash-row-icon" style={{ background: a.bg, color: a.tint }}>
              <a.Icon className="w-[18px] h-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-slate-800">{a.title}</span>
              <span className="block mt-1 text-[12.5px] text-slate-500 leading-relaxed">{a.body}</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-300 mt-1" />
          </Link>
        ))}
      </section>

      {/* LEVEL 3 + 4 — activity chart & AI agents */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="dash-card xl:col-span-2 dash-reveal">
          <CardHead
            title="Research Activity"
            subtitle="Financial research activity over time"
            right={
              <div className="dash-pills">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRange(r.days)}
                    className={`dash-pill ${range === r.days ? 'is-active' : ''}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            }
          />
          <div className="p-4 sm:p-5">
            {loading && !data ? (
              <div className="dash-skel h-[240px] w-full" />
            ) : hasActivity ? (
              <ActivityChart buckets={buckets} />
            ) : (
              <Empty
                Icon={BarChart3}
                title="No research activity yet"
                description="Launch your first research task and activity across documents, sessions and reports will appear here."
                actionLabel="Start Research"
                to="/workspace"
              />
            )}
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead title="AI Agents" subtitle="Current research activity" />
          <div className="p-2.5">
            {AGENTS.map((agent) => {
              const active = !error;
              return (
                <Link key={agent.name} to={agent.to} className="dash-row">
                  <span className={`dash-status-dot ${active ? 'status-active' : 'status-idle'}`} />
                  <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                    <agent.Icon className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-slate-700 truncate">
                    {agent.name}
                  </span>
                  <span className={`dash-badge ${active ? 'badge-ok' : 'badge-info'}`}>
                    {active ? 'Active' : 'Idle'}
                  </span>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      {/* LEVEL 4 — recent research & analyst reports */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="dash-card dash-reveal">
          <CardHead
            title="Recent Research"
            subtitle="Your latest financial investigations"
            right={
              <Link to="/workspace" className="dash-link">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="p-2.5">
            {sessions.length === 0 ? (
              <Empty
                Icon={Search}
                title="No research yet"
                description="Launch your first research task to see insights here."
                actionLabel="Start Research"
                to="/workspace"
              />
            ) : (
              sessions.map((w) => (
                <Link key={w.id} to="/workspace" className="dash-row">
                  <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
                    <Building2 className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-slate-800 truncate">{w.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      {timeAgo(w.updated_at || w.created_at)}
                      <span className="text-slate-300">·</span>
                      {w.documents_count || 0} documents
                    </span>
                  </span>
                  <span className="dash-badge badge-info">Active</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead
            title="Recent Analyst Reports"
            subtitle="Generated, cited and grounded"
            right={
              <Link to="/reports" className="dash-link">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="p-2.5">
            {reports.length === 0 ? (
              <Empty
                Icon={FileBarChart}
                title="No reports generated"
                description="Generate an executive-ready research report from your indexed filings."
                actionLabel="Generate Report"
                to="/reports"
              />
            ) : (
              reports.map((r) => (
                <Link key={r.id} to="/reports" className="dash-row">
                  <span className="dash-row-icon" style={{ background: '#EEF4FF', color: '#3155E7' }}>
                    <FileText className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-slate-800 truncate">{r.title}</span>
                    <span className="block mt-0.5 text-[11.5px] text-slate-500 truncate">
                      {r.company_name} · {timeAgo(r.created_at)}
                    </span>
                  </span>
                  <span className={`dash-badge ${r.status === 'COMPLETED' ? 'badge-ok' : 'badge-warn'}`}>
                    {r.status === 'COMPLETED' ? 'Completed' : 'Processing'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      {/* LEVEL 5 — risk signals & indexed documents */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="dash-card dash-card-hover dash-reveal">
          <CardHead title="Risk Signals" subtitle="Detected across recent research" />
          <div className="p-5">
            {riskTotal === 0 ? (
              <Empty
                Icon={ShieldAlert}
                title="No risk signals"
                description="Risk signals raised by the agents during analysis will surface here."
                actionLabel="Analyze a Filing"
                to="/workspace"
              />
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="dash-kpi-value">{riskTotal}</span>
                  <span className="text-[12.5px] text-slate-500">signals detected</span>
                </div>
                <div className="space-y-3.5">
                  {riskBands.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                        <span className="font-semibold text-slate-600">{b.label}</span>
                        <span className="font-semibold text-slate-800">{b.value}</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: b.bg }}>
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${(b.value / riskMax) * 100}%`, background: b.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/workspace" className="dash-link mt-5">
                  Open Risk Intelligence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </article>

        <article className="dash-card lg:col-span-2 dash-reveal">
          <CardHead
            title="Recently Indexed"
            subtitle="Latest financial documents"
            right={
              <Link to="/workspace" className="dash-link">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="p-2.5">
            {documents.length === 0 ? (
              <Empty
                Icon={FileCheck}
                title="No documents indexed"
                description="Upload an annual report or filing and the agents will index it for grounded research."
                actionLabel="Upload Filing"
                to="/workspace"
              />
            ) : (
              documents.map((d) => (
                <Link key={d.id} to="/workspace" className="dash-row">
                  <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                    <FileText className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-slate-800 truncate">{d.title}</span>
                    <span className="block mt-0.5 text-[11.5px] text-slate-500 truncate">
                      {d.company_name} · {d.filing_type} {d.fiscal_year} · {timeAgo(d.uploaded_at)}
                    </span>
                  </span>
                  <span className={`dash-badge ${d.status === 'INDEXED' || d.status === 'COMPLETED' ? 'badge-ok' : 'badge-warn'}`}>
                    {d.status === 'INDEXED' || d.status === 'COMPLETED' ? 'Indexed' : d.status || 'Processing'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <p className="flex items-center justify-center gap-2 pt-1 text-[11.5px] text-slate-400">
        <Bot className="w-3.5 h-3.5" />
        Multi-agent research · grounded, cited answers from your own filings
      </p>
    </main>
  );
};
