import React, { useEffect, useRef, useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Scale,
  Plus,
  Info,
  BarChart3,
  Activity,
  ShieldAlert,
  Percent,
  Sparkles,
  FileText,
  Trophy,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PageHead, CardHead } from '../components/app/ui';
import { workspaceService } from '../services/workspaceService';
import { CompanySelector } from '../components/comparison/CompanySelector';
import { ComparisonHeader } from '../components/comparison/ComparisonHeader';
import { ComparisonTabs } from '../components/comparison/ComparisonTabs';
import { FinancialMetricsTable } from '../components/comparison/FinancialMetricsTable';
import { ComparisonChart } from '../components/comparison/ComparisonChart';
import { PerformanceChart } from '../components/comparison/PerformanceChart';
import { RiskComparison } from '../components/comparison/RiskComparison';
import { FinancialRatiosTable } from '../components/comparison/FinancialRatiosTable';
import { AIComparisonInsights, ComparisonSources } from '../components/comparison/AIComparisonInsights';
import { ComparisonSummary } from '../components/comparison/ComparisonSummary';
import {
  ComparisonEmptyState,
  ComparisonLoadingState,
  ComparisonErrorState,
} from '../components/comparison/states';
import { comparisonService } from '../services/comparisonService';
const MAX_COMPANIES = 4;
import '../components/comparison/comparison.css';
import './dashboard.css';
import './app-pages.css';

const TABS = [
  { id: 'financial', label: 'Financial Overview', icon: BarChart3 },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'risk', label: 'Risk Comparison', icon: ShieldAlert },
  { id: 'ratios', label: 'Financial Ratios', icon: Percent },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'sources', label: 'Sources', icon: FileText },
  { id: 'summary', label: 'Summary', icon: Trophy },
];

/**
 * Comparison Agent — a standalone page, completely separate from the
 * Research Workspace. All figures come from ./components/comparison/mockData.js;
 * swap those two functions for real API calls when the backend is ready.
 */
export const Comparison = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('activeWorkspaceId') || null;
  });
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

  const [companies, setCompanies] = useState([]);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('financial');
  const entryRef = useRef(null);

  useEffect(() => {
    let alive = true;
    workspaceService.getWorkspaces().then((list) => {
      if (alive) {
        setWorkspaces(list);
        if (list.length > 0) {
          const found = list.find((w) => w.id === activeWorkspaceId);
          if (!found) {
            setActiveWorkspaceId(list[0].id);
          }
        }
      }
    }).catch(console.error);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const wsId = activeWorkspace?.id;
    if (wsId) {
      localStorage.setItem('activeWorkspaceId', wsId);
    }
    
    // Clear slots and result when workspace changes
    setSlots([null, null, null, null]);
    setResult(null);
    setStatus('idle');
    
    comparisonService.getCompanies(wsId)
      .then((list) => alive && setCompanies(list))
      .catch(() => alive && setCompanies([]));
    return () => {
      alive = false;
    };
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  const selected = slots.filter(Boolean);
  const selectedIds = selected.map((c) => c.id);

  const setSlot = (index, company) =>
    setSlots((prev) => prev.map((s, i) => (i === index ? company : s)));

  const addSlot = () => {
    if (slots.length >= MAX_COMPANIES) {
      setNotice('Compare up to 4 companies at a time.');
      return;
    }
    setSlots((prev) => [...prev, null]);
  };

  const removeSlot = (index) =>
    setSlots((prev) =>
      prev.length <= 2 ? prev.map((s, i) => (i === index ? null : s)) : prev.filter((_, i) => i !== index),
    );

  const removeCompany = (id) => {
    const index = slots.findIndex((s) => s?.id === id);
    if (index >= 0) removeSlot(index);
  };

  const clearAll = () => {
    setSlots([null, null, null, null]);
    setResult(null);
    setStatus('idle');
    setError('');
  };

  const runComparison = async () => {
    if (selected.length < 2) {
      setNotice('Select at least two companies to compare.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const data = await comparisonService.compareCompanies(selectedIds);
      setResult(data);
      setTab('financial');
      setStatus('ready');
    } catch (err) {
      setError(err?.message || 'The comparison service did not respond.');
      setStatus('error');
    }
  };

  const focusSelectors = () => entryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <main className="dash-body space-y-4">
      <PageHead
        eyebrow="Comparison Agent"
        title="Compare Companies"
        subtitle="Compare financial performance, risk signals and AI-driven research insights across companies."
        actions={
          <div className="cmp-info-card">
            <span className="cmp-info-icon">
              <Scale className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="cmp-info-title">AI-Powered Comparison</span>
              <span className="cmp-info-sub">Compare up to 4 companies using multi-agent intelligence.</span>
            </span>
          </div>
        }
      />

      <section className="dash-card dash-reveal p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-50">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
            <Layers className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Filter by Workspace</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <Menu as="div" className="relative inline-block text-left z-20">
                <div>
                  <Menu.Button className="inline-flex items-center justify-between w-full max-w-[280px] sm:w-[280px] gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50">
                    <span className="truncate">
                      {activeWorkspace ? activeWorkspace.name : 'No workspaces yet'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-[280px] origin-top-left rounded-xl bg-white border border-slate-200 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="p-1.5 max-h-[300px] overflow-y-auto">
                      {workspaces.map((ws) => (
                        <Menu.Item as={Fragment} key={ws.id}>
                          {({ active }) => (
                            <button
                              onClick={() => setActiveWorkspaceId(ws.id)}
                              className={`flex items-center w-full px-2.5 py-2 text-[13px] rounded-lg transition-colors ${
                                active ? 'bg-[#EEF5FF] text-[#2563EB]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span className="flex-1 text-left truncate">{ws.name}</span>
                              {activeWorkspace?.id === ws.id && (
                                <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2 mr-6" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                      {workspaces.length === 0 && (
                        <div className="px-3 py-2 text-[13px] text-slate-500 text-center">
                          No workspaces found
                        </div>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </section>

      {/* Selection */}
      <article className="dash-card dash-reveal relative z-40" ref={entryRef}>
        <CardHead
          title="Select Companies to Compare"
          subtitle="Choose 2 to 4 companies for side-by-side analysis."
          right={
            <button type="button" className="dash-link" onClick={addSlot}>
              <Plus className="w-4 h-4 inline -mt-0.5 mr-1" />
              Add Company
            </button>
          }
        />

        <div className="cmp-select-grid">
          {slots.map((company, i) => (
            <CompanySelector
              key={i}
              index={i}
              company={company}
              companies={companies}
              disabledIds={selectedIds}
              onSelect={(c) => setSlot(i, c)}
              onRemove={() => removeSlot(i)}
              removable={slots.length > 2 || Boolean(company)}
            />
          ))}
        </div>

        {notice && (
          <p className="cmp-notice">
            <Info className="w-4 h-4" />
            {notice}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2.5 px-[18px] pb-[18px]">
          <button type="button" className="dash-btn dash-btn-primary" onClick={runComparison}>
            <Scale className="w-4 h-4" />
            Compare Companies
          </button>
          <button type="button" className="dash-btn dash-btn-ghost" onClick={clearAll}>
            Clear
          </button>
          {status !== 'ready' && (
            <span className="app-meta ml-auto">
              {selected.length}/{MAX_COMPANIES} companies selected
            </span>
          )}
        </div>
      </article>

      {status === 'idle' && !result && <ComparisonEmptyState onSelect={focusSelectors} />}
      {status === 'loading' && <ComparisonLoadingState />}
      {status === 'error' && <ComparisonErrorState message={error} onRetry={runComparison} />}

      {status === 'ready' && result && (
        <>
          <div className="cmp-divider" />

          <ComparisonHeader companies={result.companies} onRemove={removeCompany} />

          <ComparisonTabs tabs={TABS} active={tab} onChange={setTab} />

          {tab === 'financial' && (
            <>
              <FinancialMetricsTable
                companies={result.companies}
                metrics={result.metrics}
                risk={result.risk}
              />
              <ComparisonChart companies={result.companies} metrics={result.metrics} />
            </>
          )}

          {tab === 'performance' && (
            <PerformanceChart
              companies={result.companies}
              performance={result.performance}
              periods={result.periods}
            />
          )}

          {tab === 'risk' && <RiskComparison companies={result.companies} risk={result.risk} />}

          {tab === 'ratios' && (
            <FinancialRatiosTable companies={result.companies} ratios={result.ratios} />
          )}

          {tab === 'insights' && <AIComparisonInsights insights={result.insights} />}

          {tab === 'sources' && <ComparisonSources insights={result.insights} />}

          {tab === 'summary' && <ComparisonSummary summary={result.summary} />}
        </>
      )}
    </main>
  );
};

export default Comparison;
