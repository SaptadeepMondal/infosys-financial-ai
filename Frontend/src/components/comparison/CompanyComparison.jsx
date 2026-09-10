import React, { useEffect, useRef, useState } from 'react';
import { Scale, Plus, Info } from 'lucide-react';
import { CardHead } from '../app/ui';
import { CompanySelector } from './CompanySelector';
import { ComparisonHeader } from './ComparisonHeader';
import { FinancialMetricsTable } from './FinancialMetricsTable';
import { ComparisonChart } from './ComparisonChart';
import { PerformanceChart } from './PerformanceChart';
import { RiskComparison } from './RiskComparison';
import { FinancialRatiosTable } from './FinancialRatiosTable';
import { AIComparisonInsights, ComparisonSources } from './AIComparisonInsights';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonEmptyState, ComparisonLoadingState, ComparisonErrorState } from './states';
import { fetchCompanies, fetchComparison, MAX_COMPANIES } from './mockData';
import './comparison.css';

/**
 * Company Comparison — frontend only.
 * Data comes from ./mockData.js; swap those two functions for real API calls
 * and this component needs no changes.
 */
export const CompanyComparison = () => {
  const [companies, setCompanies] = useState([]);
  const [slots, setSlots] = useState([null, null]);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const entryRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchCompanies()
      .then((list) => alive && setCompanies(list))
      .catch(() => alive && setCompanies([]));
    return () => {
      alive = false;
    };
  }, []);

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
    setSlots((prev) => (prev.length <= 2 ? prev.map((s, i) => (i === index ? null : s)) : prev.filter((_, i) => i !== index)));

  const removeCompany = (id) => {
    const index = slots.findIndex((s) => s?.id === id);
    if (index >= 0) removeSlot(index);
  };

  const clearAll = () => {
    setSlots([null, null]);
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
      const data = await fetchComparison(selectedIds);
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setError(err?.message || 'The comparison service did not respond.');
      setStatus('error');
    }
  };

  const focusSelectors = () => entryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <section className="space-y-4">
      <div className="cmp-divider" />

      <div className="cmp-section-head dash-reveal">
        <h2 className="cmp-section-title">Compare Companies</h2>
        <p className="cmp-section-sub">
          Compare financial performance, risk signals and research insights across companies.
        </p>
      </div>

      {/* Entry area */}
      <article className="dash-card dash-reveal" ref={entryRef}>
        <CardHead
          title="Compare companies"
          subtitle="Select two to four companies to build a side-by-side comparison."
          right={
            <button type="button" className="dash-link" onClick={addSlot}>
              <Plus className="w-4 h-4 inline -mt-0.5 mr-1" />
              Add company
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
          <span className="app-meta">
            {selected.length}/{MAX_COMPANIES} companies selected
          </span>
        </div>
      </article>

      {status === 'idle' && !result && <ComparisonEmptyState onSelect={focusSelectors} />}
      {status === 'loading' && <ComparisonLoadingState />}
      {status === 'error' && <ComparisonErrorState message={error} onRetry={runComparison} />}

      {status === 'ready' && result && (
        <>
          <ComparisonHeader companies={result.companies} onRemove={removeCompany} />

          <FinancialMetricsTable
            companies={result.companies}
            metrics={result.metrics}
            risk={result.risk}
          />

          <ComparisonChart companies={result.companies} metrics={result.metrics} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <PerformanceChart
              companies={result.companies}
              performance={result.performance}
              periods={result.periods}
            />
            <RiskComparison companies={result.companies} risk={result.risk} />
          </div>

          <FinancialRatiosTable companies={result.companies} ratios={result.ratios} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AIComparisonInsights insights={result.insights} />
            <ComparisonSources insights={result.insights} />
          </div>

          <ComparisonSummary summary={result.summary} />
        </>
      )}
    </section>
  );
};
