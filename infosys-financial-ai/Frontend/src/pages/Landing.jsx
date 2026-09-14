import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Cpu,
  AlertTriangle,
  GitCompare,
  Search,
  FileCheck,
  ArrowRight,
  Quote,
  ShieldCheck,
  TrendingUp,
  LineChart,
  Layers,
  Sparkles,
  BadgeCheck,
  BookOpen,
  Fingerprint,
  Scale,
} from 'lucide-react';
import './landing.css';

/* ------------------------------------------------------------------ */
/* Content model — mirrors the real agents in the platform             */
/* ------------------------------------------------------------------ */

const AGENTS = [
  {
    id: 'document',
    step: '01',
    name: 'Document Agent',
    icon: FileText,
    color: '#4f46e5',
    tint: 'rgba(79,70,229,0.10)',
    short: 'Reads & indexes filings',
    desc: 'Reads and indexes annual reports, 10-Ks, 20-Fs and financial documents.',
  },
  {
    id: 'extraction',
    step: '02',
    name: 'Extraction Agent',
    icon: Cpu,
    color: '#0d9488',
    tint: 'rgba(13,148,136,0.10)',
    short: 'Pulls the numbers that matter',
    desc: 'Extracts revenue, margins, cash flow, ratios and other critical financial metrics.',
  },
  {
    id: 'redflag',
    step: '03',
    name: 'Red Flag Agent',
    icon: AlertTriangle,
    color: '#d97706',
    tint: 'rgba(217,119,6,0.12)',
    short: 'Surfaces risk early',
    desc: 'Identifies financial risks, anomalies and potential warning signals.',
  },
  {
    id: 'comparison',
    step: '04',
    name: 'Comparison Agent',
    icon: GitCompare,
    color: '#7c3aed',
    tint: 'rgba(124,58,237,0.10)',
    short: 'Benchmarks against peers',
    desc: 'Benchmarks companies across financial and operational metrics.',
  },
  {
    id: 'research',
    step: '05',
    name: 'Research Agent',
    icon: Search,
    color: '#2e62f5',
    tint: 'rgba(46,98,245,0.10)',
    short: 'Answers complex questions',
    desc: 'Answers complex financial questions using the indexed source documents.',
  },
  {
    id: 'report',
    step: '06',
    name: 'Analyst Report Agent',
    icon: FileCheck,
    color: '#059669',
    tint: 'rgba(5,150,105,0.10)',
    short: 'Writes the grounded report',
    desc: 'Produces structured, source-grounded analyst reports.',
  },
];

const METRICS = [
  { label: 'Revenue', value: '$18.56B', accent: '#0d9488' },
  { label: 'Operating margin', value: '20.7%', accent: '#16a085' },
  { label: 'Free cash flow', value: '$2.89B', accent: '#0f9d8a' },
  { label: 'Growth', value: '+11.4%', accent: '#059669' },
];

const RISKS = [
  { title: 'Margin pressure', level: 'Medium', w: 52, c: '#f0b429', detail: 'Operating margin contracted across three consecutive periods.' },
  { title: 'Debt signals', level: 'Elevated', w: 68, c: '#f97316', detail: 'Short-term borrowings rising faster than operating cash flow.' },
  { title: 'Financial anomalies', level: 'Watch', w: 41, c: '#f0b429', detail: 'Receivables growth outpacing reported revenue growth.' },
  { title: 'Audit concerns', level: 'High', w: 84, c: '#e45757', detail: 'Emphasis-of-matter language flagged in the auditor’s report.' },
];

const COMPARE = [
  { label: 'Revenue growth', a: 72, b: 54, av: '+11.4%', bv: '+7.8%', color: '#4f46e5' },
  { label: 'Operating margin', a: 66, b: 78, av: '20.7%', bv: '24.1%', color: '#7c3aed' },
  { label: 'Free cash flow', a: 81, b: 62, av: '$2.89B', bv: '$2.10B', color: '#8b5cf6' },
  { label: 'Risk exposure', a: 38, b: 57, av: 'Medium', bv: 'Elevated', color: '#a855f7' },
];

const CHART_BARS = [34, 46, 40, 55, 52, 64, 58, 72, 69, 82, 78, 92];

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */

const useReveal = () => {
  const root = useRef(null);
  useEffect(() => {
    const nodes = root.current?.querySelectorAll('.lp-reveal');
    if (!nodes?.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-8% 0px -6% 0px', threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return root;
};

const Reveal = ({ delay = 0, className = '', as: Tag = 'div', children, ...rest }) => (
  <Tag className={`lp-reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
    {children}
  </Tag>
);

/* ------------------------------------------------------------------ */
/* Hero ecosystem visualization                                        */
/* ------------------------------------------------------------------ */

const Node = ({ agent, sub }) => {
  const Icon = agent.icon;
  return (
    <div className="lp-node">
      <span className="lp-node-ico" style={{ background: agent.tint, color: agent.color }}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="lp-node-t block">{agent.name}</span>
        <span className="lp-node-s block">{sub || agent.short}</span>
      </span>
    </div>
  );
};

const Flow = ({ h = 26 }) => (
  <svg width="100%" height={h} viewBox={`0 0 200 ${h}`} preserveAspectRatio="none" aria-hidden="true">
    <line
      x1="100"
      y1="0"
      x2="100"
      y2={h}
      stroke="rgba(79,70,229,0.45)"
      strokeWidth="1.5"
      className="lp-flow"
    />
  </svg>
);

const Ecosystem = () => (
  <div className="lp-glass relative overflow-hidden p-5 sm:p-6 lp-float">
    <div
      className="lp-blob"
      style={{ background: 'rgba(124,58,237,0.28)', width: 260, height: 260, top: -90, right: -70 }}
    />
    <div
      className="lp-blob"
      style={{ background: 'rgba(13,148,136,0.22)', width: 220, height: 220, bottom: -80, left: -60 }}
    />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8590ad]">
          Research ecosystem
        </p>
        <p className="mt-1 text-[13.5px] font-bold text-[#0b1020]">Filing → analyst report</p>
      </div>
      <span className="lp-chip" style={{ background: 'rgba(5,150,105,0.10)', color: '#047857' }}>
        <span
          className="lp-pulse inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: '#059669' }}
        />
        Pipeline live
      </span>
    </div>

    <div className="relative mt-5 space-y-0">
      <div
        className="lp-node"
        style={{ background: 'rgba(11,16,32,0.92)', borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <span
          className="lp-node-ico"
          style={{ background: 'rgba(199,189,247,0.18)', color: '#c7bdf7' }}
        >
          <Layers className="h-4 w-4" />
        </span>
        <span>
          <span className="lp-node-t block" style={{ color: '#f5f6ff' }}>
            Financial filings
          </span>
          <span className="lp-node-s block" style={{ color: 'rgba(226,232,255,0.6)' }}>
            10-K · 20-F · annual reports
          </span>
        </span>
      </div>

      <Flow />
      <Node agent={AGENTS[0]} />
      <Flow />
      <Node agent={AGENTS[1]} />

      <div className="grid grid-cols-2 items-center gap-3">
        <Flow />
        <Flow />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Node agent={AGENTS[2]} sub="Risk signals" />
        <Node agent={AGENTS[3]} sub="Peer benchmarks" />
      </div>
      <div className="grid grid-cols-2 items-center gap-3">
        <Flow />
        <Flow />
      </div>

      <Node agent={AGENTS[4]} />
      <Flow />
      <div
        className="lp-node"
        style={{
          background: 'linear-gradient(120deg, rgba(5,150,105,0.10), rgba(13,148,136,0.08))',
          borderColor: 'rgba(5,150,105,0.28)',
        }}
      >
        <span className="lp-node-ico" style={{ background: 'rgba(5,150,105,0.14)', color: '#059669' }}>
          <FileCheck className="h-4 w-4" />
        </span>
        <span>
          <span className="lp-node-t block">Analyst report</span>
          <span className="lp-node-s block">Structured · cited · traceable</span>
        </span>
        <BadgeCheck className="ml-auto h-4 w-4" style={{ color: '#059669' }} />
      </div>
    </div>

    <div
      className="relative mt-4 flex items-start gap-2.5 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.16)' }}
    >
      <Quote className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: '#4f46e5' }} />
      <p className="text-[11.5px] leading-relaxed" style={{ color: '#3c4666' }}>
        Every generated insight carries an inline citation back to the exact page of the source
        filing.
      </p>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Section header helper                                               */
/* ------------------------------------------------------------------ */

const SectionHead = ({ eyebrow, color, title, lead, center = false }) => (
  <Reveal className={center ? 'text-center' : ''}>
    <span className={`lp-eyebrow ${center ? 'justify-center' : ''}`} style={color ? { color } : undefined}>
      {eyebrow}
    </span>
    <h2 className={`lp-h2 ${center ? 'mx-auto max-w-3xl' : ''}`}>{title}</h2>
    {lead && <p className={`lp-lead ${center ? 'mx-auto text-center' : ''}`}>{lead}</p>}
  </Reveal>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const Landing = () => {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const root = useReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const go = (path) => {
    setLeaving(true);
    setTimeout(() => navigate(path), 200);
  };

  return (
    <div
      ref={root}
      className="lp min-h-screen"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateY(4px)' : 'none',
        transition: 'opacity 200ms ease, transform 200ms ease',
      }}
    >
      {/* ---------------- Navigation ---------------- */}
      <div className="lp-wrap">
        <nav className="lp-nav">
          <div className="flex items-center gap-2.5">
            <span className="lp-mark">
              <TrendingUp className="h-[17px] w-[17px]" />
            </span>
            <span className="leading-none">
              <span className="block text-[14px] font-extrabold tracking-tight text-[#0b1020]">
                Infosys AI
              </span>
              <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#8590ad]">
                Financial Intelligence
              </span>
            </span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <a className="lp-navlink" href="#product">
              Product
            </a>
            <a className="lp-navlink" href="#research">
              Research
            </a>
            <a className="lp-navlink" href="#platform">
              Platform
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lp-btn lp-btn-ghost lp-btn-sm hidden sm:inline-flex"
              onClick={() => go('/login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-primary lp-btn-sm"
              onClick={() => go('/register')}
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>

      {/* ---------------- Hero · ivory ---------------- */}
      <section className="lp-section lp-bg-ivory overflow-hidden pt-10 sm:pt-14">
        <div className="lp-grid-lines" />
        <div
          className="lp-blob"
          style={{ background: 'rgba(79,70,229,0.24)', width: 520, height: 520, top: -180, left: -120 }}
        />
        <div
          className="lp-blob"
          style={{ background: 'rgba(124,58,237,0.18)', width: 460, height: 460, top: 120, right: -160 }}
        />

        <div className="lp-wrap relative grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">
          <div>
            <Reveal>
              <span className="lp-eyebrow">Multi-agent financial intelligence</span>
            </Reveal>
            <Reveal delay={80}>
              <h1
                className="mt-5 font-extrabold leading-[1.03]"
                style={{ fontSize: 'clamp(38px, 5.6vw, 68px)' }}
              >
                Financial research,
                <br />
                grounded in <span className="lp-grad">intelligence.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="lp-lead" style={{ fontSize: 17 }}>
                One intelligent research system that reads financial filings, extracts critical
                metrics, identifies risks, compares companies and produces source-grounded analyst
                reports.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="lp-btn lp-btn-primary lp-btn-lg"
                  onClick={() => go('/login')}
                >
                  Sign In <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="lp-btn lp-btn-ghost lp-btn-lg"
                  onClick={() => go('/register')}
                >
                  Get Started
                </button>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-11 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, t: 'Source grounded', d: 'Every answer cites the filing passage.', c: '#059669' },
                  { icon: Sparkles, t: 'Six agents', d: 'Specialised roles, one pipeline.', c: '#7c3aed' },
                  { icon: LineChart, t: 'Audit ready', d: 'Traceable question-to-source reasoning.', c: '#0f9d8a' },
                ].map(({ icon: Icon, t, d, c }) => (
                  <div key={t} className="lp-card p-4">
                    <Icon className="h-[18px] w-[18px]" style={{ color: c }} />
                    <p className="mt-2.5 text-[13.5px] font-bold text-[#0b1020]">{t}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={140} id="platform">
            <Ecosystem />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Document Agent · soft lavender ---------------- */}
      <section id="product" className="lp-section lp-bg-lilac overflow-hidden">
        <div
          className="lp-blob"
          style={{ background: 'rgba(99,102,241,0.18)', width: 460, height: 460, top: -140, right: -140 }}
        />
        <div className="lp-wrap relative grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHead
              eyebrow="Document Agent"
              color="#4f46e5"
              title="Start with the source."
              lead="Reads and indexes annual reports, 10-Ks, 20-Fs and other financial documents — every page parsed, every passage retrievable."
            />
            <Reveal delay={140}>
              <div className="mt-8 space-y-3">
                {[
                  { icon: BookOpen, t: 'Full-filing coverage', d: 'Annual reports, 10-K and 20-F filings ingested end to end.' },
                  { icon: Fingerprint, t: 'Page-level indexing', d: 'Every passage addressable by document, page and section.' },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-3.5">
                    <span
                      className="grid h-9 w-9 flex-none place-items-center rounded-xl"
                      style={{ background: 'rgba(79,70,229,0.10)', color: '#4f46e5' }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[#0b1020]">{t}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="relative">
              <div
                className="lp-blob"
                style={{ background: 'rgba(124,58,237,0.22)', width: 300, height: 300, top: -70, left: -60 }}
              />
              <div className="lp-glass relative p-5 sm:p-6 lp-float">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg"
                      style={{ background: 'rgba(79,70,229,0.12)', color: '#4f46e5' }}
                    >
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-extrabold text-[#0b1020]">Annual Report</p>
                      <p className="text-[10.5px] font-semibold text-[#8590ad]">Page 14 · Financial Highlights</p>
                    </div>
                  </div>
                  <span className="lp-chip" style={{ background: 'rgba(79,70,229,0.10)', color: '#4338ca' }}>
                    <span className="lp-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#4f46e5' }} />
                    Indexed
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[94, 100, 82].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: 'rgba(13,20,44,0.07)' }} />
                  ))}
                  <div
                    className="rounded-lg px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed"
                    style={{
                      background: 'rgba(79,70,229,0.08)',
                      border: '1px solid rgba(79,70,229,0.26)',
                      color: '#0b1020',
                      boxShadow: '0 0 24px -6px rgba(124,58,237,0.35)',
                    }}
                  >
                    “Operating margin for the year stood at 20.7%, compared with 21.9% in the prior
                    period.”
                  </div>
                  {[88, 96, 70].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: 'rgba(13,20,44,0.07)' }} />
                  ))}
                </div>

                <div className="lp-hair my-4" />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10.5px] font-semibold text-[#8590ad]">
                  <span>248 pages</span>
                  <span>1,912 passages</span>
                  <span style={{ color: '#4338ca' }}>Indexed in 41s</span>
                  <span className="ml-auto font-mono">p. 014</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Extraction Agent · ivory ---------------- */}
      <section className="lp-section lp-bg-ivory overflow-hidden">
        <div
          className="lp-blob"
          style={{ background: 'rgba(15,157,138,0.16)', width: 480, height: 480, bottom: -180, left: -140 }}
        />
        <div className="lp-wrap relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead
            eyebrow="Extraction Agent"
            color="#0f9d8a"
            title="Turn complex filings into actionable intelligence."
            lead="Revenue, margins, cash flow and growth — pulled from dense disclosure into clean, comparable financial metrics."
          />

          <Reveal delay={120}>
            <div className="lp-glass relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8590ad]">
                  Extracted metrics · FY24
                </p>
                <span className="lp-chip" style={{ background: 'rgba(15,157,138,0.10)', color: '#0b7c6c' }}>
                  Verified
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {METRICS.map((m) => (
                  <div key={m.label} className="lp-metric">
                    <p className="lp-metric-l">{m.label}</p>
                    <p className="lp-metric-v" style={{ color: m.accent }}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="lp-metric mt-3">
                <div className="flex items-center justify-between">
                  <p className="lp-metric-l">Revenue trend · quarterly</p>
                  <p className="text-[11px] font-bold" style={{ color: '#0f9d8a' }}>+11.4% YoY</p>
                </div>
                <div className="mt-3 flex h-[84px] items-end gap-1.5">
                  {CHART_BARS.map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t-[4px]"
                      style={{
                        height: `${h}%`,
                        background:
                          i === CHART_BARS.length - 1
                            ? 'linear-gradient(180deg,#16a085,#0f9d8a)'
                            : 'rgba(15,157,138,0.22)',
                        transition: 'height 900ms cubic-bezier(0.22,1,0.36,1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Red Flag Agent · dark dramatic ---------------- */}
      <section className="lp-section lp-bg-ember overflow-hidden">
        <div className="lp-grid-lines" />
        <div className="lp-wrap relative grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <span className="lp-eyebrow">Red Flag Agent</span>
            <h2 className="lp-h2">
              Find the risks
              <br />
              before they become surprises.
            </h2>
            <p className="lp-lead">
              Anomalies, deteriorating ratios and disclosure language are scanned continuously as
              documents are indexed.
            </p>
            <div className="mt-8 flex items-center gap-2.5">
              <span
                className="lp-chip"
                style={{ background: 'rgba(240,180,41,0.14)', color: '#f0b429' }}
              >
                <AlertTriangle className="h-3 w-3" /> Continuous monitoring
              </span>
              <span
                className="lp-chip"
                style={{ background: 'rgba(228,87,87,0.14)', color: '#ff8f8f' }}
              >
                Severity ranked
              </span>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {RISKS.map((r, i) => (
              <Reveal key={r.title} delay={i * 70}>
                <div className="lp-card h-full p-5">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-4 w-4" style={{ color: r.c }} />
                      <p className="text-[14px] font-bold" style={{ color: '#fff6ec' }}>
                        {r.title}
                      </p>
                    </div>
                    <span
                      className="lp-chip"
                      style={{ background: `${r.c}26`, color: r.c }}
                    >
                      {r.level}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed">{r.detail}</p>
                  <div className="mt-4 lp-bar" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <span style={{ width: `${r.w}%`, background: r.c }} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Comparison Agent · ivory ---------------- */}
      <section className="lp-section lp-bg-ivory overflow-hidden">
        <div
          className="lp-blob"
          style={{ background: 'rgba(124,58,237,0.16)', width: 460, height: 460, top: -140, right: -160 }}
        />
        <div className="lp-wrap relative">
          <SectionHead
            eyebrow="Comparison Agent"
            color="#7c3aed"
            title="Benchmark any two companies."
            lead="Peer analysis rendered side by side — growth, profitability, cash generation and risk posture in a single frame."
          />

          <Reveal delay={100}>
            <div className="lp-glass mt-12 p-6 sm:p-8">
              <div className="grid grid-cols-3 items-center pb-5">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}
                  >
                    <Scale className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[13px] font-extrabold text-[#0b1020]">Company A</p>
                </div>
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#8590ad]">
                  versus
                </p>
                <p className="text-right text-[13px] font-extrabold text-[#0b1020]">Company B</p>
              </div>
              <div className="lp-hair" />

              <div className="mt-5 space-y-5">
                {COMPARE.map((c, i) => (
                  <Reveal key={c.label} delay={i * 70}>
                    <div>
                      <div className="flex items-center justify-between text-[12px] font-bold">
                        <span style={{ color: c.color }}>{c.av}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8590ad]">
                          {c.label}
                        </span>
                        <span className="text-[#3c4666]">{c.bv}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="lp-bar" style={{ transform: 'scaleX(-1)' }}>
                          <span style={{ width: `${c.a}%`, background: c.color }} />
                        </div>
                        <div className="lp-bar">
                          <span style={{ width: `${c.b}%`, background: 'rgba(13,20,44,0.3)' }} />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="lp-hair mt-6" />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10.5px] font-semibold text-[#8590ad]">
                  Peer position · sector percentile
                </p>
                <span className="lp-chip" style={{ background: 'rgba(124,58,237,0.10)', color: '#6d28d9' }}>
                  Top quartile
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Research Agent · soft lavender ---------------- */}
      <section id="research" className="lp-section lp-bg-lilac overflow-hidden">
        <div
          className="lp-blob"
          style={{ background: 'rgba(46,98,245,0.14)', width: 460, height: 460, bottom: -160, right: -140 }}
        />
        <div className="lp-wrap relative">
          <SectionHead
            eyebrow="Research Agent"
            color="#2e62f5"
            title="Ask complex financial questions. Get grounded answers."
            lead="Natural-language research across every indexed filing — answered with reasoning, and always with a citation."
          />

          <Reveal delay={120}>
            <div className="lp-glass relative mx-auto mt-12 max-w-3xl p-6 sm:p-8">
              <div
                className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                style={{ background: 'rgba(46,98,245,0.07)', border: '1px solid rgba(46,98,245,0.2)' }}
              >
                <Search className="mt-0.5 h-4 w-4 flex-none" style={{ color: '#2e62f5' }} />
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#8590ad]">
                    Your question
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0b1020]">
                    What was the operating margin in FY24?
                  </p>
                </div>
              </div>

              <div className="my-4 flex justify-center">
                <svg width="2" height="34" aria-hidden="true">
                  <line x1="1" y1="0" x2="1" y2="34" stroke="rgba(46,98,245,0.5)" strokeWidth="2" className="lp-flow" />
                </svg>
              </div>

              <div className="lp-card p-5">
                <span className="lp-chip" style={{ background: 'rgba(46,98,245,0.10)', color: '#2e62f5' }}>
                  <Sparkles className="h-3 w-3" /> Research Agent
                </span>
                <p className="mt-3.5 text-[14.5px] font-semibold leading-relaxed text-[#0b1020]">
                  Operating margin was{' '}
                  <span style={{ color: '#0f9d8a' }}>20.7%</span> in FY24 — a 120 bps contraction
                  year over year, driven primarily by higher delivery costs.
                </p>
                <div className="lp-hair my-4" />
                <div
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.22)' }}
                >
                  <BadgeCheck className="h-4 w-4 flex-none" style={{ color: '#059669' }} />
                  <p className="text-[12px] font-bold" style={{ color: '#046c50' }}>
                    Source · Annual Report, page 14 — Financial Highlights
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Analyst Report Agent · ivory ---------------- */}
      <section className="lp-section lp-bg-ivory overflow-hidden">
        <div
          className="lp-blob"
          style={{ background: 'rgba(5,150,105,0.14)', width: 440, height: 440, top: -120, left: -140 }}
        />
        <div className="lp-wrap relative grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionHead
            eyebrow="Analyst Report Agent"
            color="#059669"
            title="From research to analyst-ready reports."
            lead="Everything the pipeline learned — metrics, risks, benchmarks and citations — composed into a structured report you can export and defend."
          />

          <Reveal delay={120}>
            <div className="lp-glass relative overflow-hidden p-0 lp-float">
              <div
                className="flex items-center justify-between px-5 py-4 sm:px-6"
                style={{ background: 'linear-gradient(120deg, rgba(5,150,105,0.12), rgba(13,148,136,0.06))' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-lg"
                    style={{ background: 'rgba(5,150,105,0.14)', color: '#059669' }}
                  >
                    <FileCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#0b1020]">Analyst report</p>
                    <p className="text-[10.5px] font-semibold" style={{ color: '#046c50' }}>
                      FY24 · Company research note
                    </p>
                  </div>
                </div>
                <span className="lp-chip" style={{ background: 'rgba(5,150,105,0.12)', color: '#047857' }}>
                  <ShieldCheck className="h-3 w-3" /> Source grounded
                </span>
              </div>

              <div className="space-y-1 p-4 sm:p-5">
                {[
                  { s: 'Executive summary', w: 88 },
                  { s: 'Financial metrics', w: 72 },
                  { s: 'Risk analysis', w: 64 },
                  { s: 'Peer comparison', w: 56 },
                  { s: 'Source citations', w: 80 },
                ].map(({ s, w }, i) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[rgba(5,150,105,0.05)]"
                  >
                    <span
                      className="grid h-6 w-6 flex-none place-items-center rounded-md font-mono text-[9.5px] font-bold"
                      style={{ background: 'rgba(5,150,105,0.10)', color: '#047857' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-[13px] font-bold text-[#0b1020]">{s}</p>
                    <div className="ml-auto h-2 rounded-full" style={{ width: w, background: 'rgba(13,20,44,0.08)' }} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Source grounding · soft lavender ---------------- */}
      <section className="lp-section lp-bg-lilac overflow-hidden">
        <div className="lp-wrap relative">
          <SectionHead
            eyebrow="Traceability"
            color="#0f9d8a"
            title="Every insight has a source."
            lead="No answer is produced without a retrievable passage behind it — so every claim can be re-checked against the filing."
          />

          <div className="relative mt-12 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
            <Reveal delay={60}>
              <div className="lp-card h-full p-6">
                <span className="lp-chip" style={{ background: 'rgba(46,98,245,0.10)', color: '#2e62f5' }}>
                  <Sparkles className="h-3 w-3" /> AI insight
                </span>
                <p className="mt-4 text-[15px] font-semibold leading-relaxed text-[#0b1020]">
                  Operating margin declined to 20.7%, a 120 bps contraction year over year, driven
                  primarily by higher delivery costs.
                </p>
                <div className="lp-hair my-5" />
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" style={{ color: '#059669' }} />
                  <p className="text-[12px] font-bold" style={{ color: '#046c50' }}>
                    Grounded in annual report · page 14
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="hidden items-center lg:flex">
              <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true">
                <line x1="0" y1="30" x2="60" y2="30" stroke="rgba(5,150,105,0.55)" strokeWidth="2" className="lp-flow" />
                <path d="M56 22l10 8-10 8" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="6" cy="30" r="4" fill="#059669" opacity="0.9" />
              </svg>
            </Reveal>

            <Reveal delay={180}>
              <div className="lp-card h-full p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8590ad]">
                  Source document · page 14
                </p>
                <div className="mt-4 space-y-2.5">
                  {[92, 100, 78].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: 'rgba(13,20,44,0.07)' }} />
                  ))}
                  <div
                    className="rounded-lg px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed"
                    style={{
                      background: 'rgba(5,150,105,0.10)',
                      border: '1px solid rgba(5,150,105,0.28)',
                      color: '#0b1020',
                      boxShadow: '0 0 28px -8px rgba(5,150,105,0.4)',
                    }}
                  >
                    “Operating margin for the year stood at 20.7%, compared with 21.9% in the prior
                    period.”
                  </div>
                  {[88, 70].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: 'rgba(13,20,44,0.07)' }} />
                  ))}
                </div>
                <p className="mt-4 text-[10.5px] font-semibold text-[#8590ad]">
                  Annual Report · Financial Highlights · p. 14
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA · dark navy ---------------- */}
      <section className="lp-section lp-bg-navy overflow-hidden">
        <div className="lp-grid-lines" />
        <div
          className="lp-blob"
          style={{ background: 'rgba(79,70,229,0.5)', width: 560, height: 560, bottom: -240, left: '25%' }}
        />
        <div
          className="lp-blob"
          style={{ background: 'rgba(15,157,138,0.3)', width: 380, height: 380, top: -140, right: -100 }}
        />
        <div className="lp-wrap relative text-center">
          <Reveal>
            <span className="lp-eyebrow justify-center">Analyst workspace</span>
            <h2 className="lp-h2 mx-auto max-w-3xl">
              Research smarter.
              <br />
              Invest with better intelligence.
            </h2>
            <p className="lp-lead mx-auto text-center">
              Explore financial filings through a multi-agent research system built for grounded,
              traceable analysis.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="lp-btn lp-btn-primary lp-btn-lg"
                onClick={() => go('/login')}
              >
                Sign In <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="lp-btn lp-btn-onnavy lp-btn-lg"
                onClick={() => go('/register')}
              >
                Get Started
              </button>
            </div>
          </Reveal>

          <div className="lp-hair mt-16" />
          <p className="mt-6 text-[11.5px]" style={{ color: 'rgba(226,232,255,0.6)' }}>
            Infosys AI · Multi-Agent Financial Research ·{' '}
            <Link to="/login" className="font-bold" style={{ color: '#c7bdf7' }}>
              Analyst sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
