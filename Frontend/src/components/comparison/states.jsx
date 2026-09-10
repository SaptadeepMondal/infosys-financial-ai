import React from 'react';
import { Scale, RefreshCw, AlertTriangle } from 'lucide-react';
import { CardHead } from '../app/ui';

export const ComparisonEmptyState = ({ onSelect }) => (
  <article className="dash-card dash-reveal">
    <div className="dash-empty" style={{ margin: 18 }}>
      <span
        className="w-14 h-14 rounded-2xl grid place-items-center mb-3.5"
        style={{ background: 'linear-gradient(135deg,#eef5ff,#f2eeff)', color: '#2563EB' }}
      >
        <Scale className="w-6 h-6" />
      </span>
      <p className="text-[15px] font-bold text-slate-800">Compare companies side-by-side</p>
      <p className="mt-1.5 text-[12.5px] text-slate-500 max-w-md leading-relaxed">
        Select two or more companies to compare financial performance, risk signals and AI research insights.
      </p>
      <button type="button" className="dash-btn dash-btn-primary mt-4 h-9 text-[12.5px]" onClick={onSelect}>
        Select Companies
      </button>
    </div>
  </article>
);

const SkelCard = ({ title, children }) => (
  <article className="dash-card dash-reveal">
    <CardHead title={title} subtitle="Loading comparison data…" />
    <div className="p-[18px] pt-1 space-y-2.5">{children}</div>
  </article>
);

export const ComparisonLoadingState = () => (
  <>
    <SkelCard title="Company Comparison">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="cmp-skel h-[74px]" />
        ))}
      </div>
    </SkelCard>
    <SkelCard title="Financial Overview">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="cmp-skel h-9" />
      ))}
    </SkelCard>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SkelCard title="Performance">
        <div className="cmp-skel h-[200px]" />
      </SkelCard>
      <SkelCard title="Risk Intelligence">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="cmp-skel h-11" />
        ))}
      </SkelCard>
    </div>
    <SkelCard title="AI Comparison Insights">
      {[0, 1, 2].map((i) => (
        <div key={i} className="cmp-skel h-16" />
      ))}
    </SkelCard>
  </>
);

export const ComparisonErrorState = ({ message, onRetry }) => (
  <article className="dash-card dash-reveal">
    <div
      className="m-[18px] flex flex-col items-start gap-2.5 rounded-2xl border px-4 py-4"
      style={{ borderColor: '#F3D6DD', background: 'rgba(253,238,241,0.7)' }}
    >
      <p className="flex items-center gap-2 text-[13.5px] font-bold" style={{ color: '#B0455C' }}>
        <AlertTriangle className="w-4 h-4" />
        Unable to load comparison data.
      </p>
      {message && <p className="text-[12.5px]" style={{ color: '#B0455C' }}>{message}</p>}
      <button type="button" className="dash-btn dash-btn-ghost h-9 text-[12.5px] mt-1" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  </article>
);
