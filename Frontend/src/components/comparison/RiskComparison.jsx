import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CardHead } from '../app/ui';
import { MockBadge } from './MockBadge';
import { CompanyLogo } from './CompanySelector';

const LEVEL_FILL = {
  Low: 'linear-gradient(90deg,#8fd3bb,#6fc3a6)',
  Medium: 'linear-gradient(90deg,#f2d79a,#e8c377)',
  High: 'linear-gradient(90deg,#f0aebc,#e592a5)',
};

const LEVEL_WIDTH = { Low: 33, Medium: 66, High: 100 };

export const RiskComparison = ({ companies, risk }) => {
  const maxSignals = Math.max(1, ...companies.map((c) => risk?.[c.id]?.totalSignals || 0));

  return (
    <article className="dash-card dash-reveal">
      <CardHead
        title="Risk Intelligence"
        subtitle="Risk level and flagged signals per company."
        right={<MockBadge />}
      />
      <div className="p-[18px] pt-1 space-y-2.5">
        {companies.map((c) => {
          const r = risk?.[c.id];
          const level = r?.riskLevel || 'Low';
          return (
            <div key={c.id} className="cmp-risk-row">
              <CompanyLogo company={c} small />
              <span className="min-w-0 w-[110px]">
                <span className="cmp-name block truncate">{c.name}</span>
                <span className="cmp-meta block truncate">{c.ticker}</span>
              </span>
              <span className="cmp-risk-track">
                <span style={{ width: `${LEVEL_WIDTH[level]}%`, background: LEVEL_FILL[level] }} />
              </span>
              <span className={`cmp-chip chip-${level.toLowerCase()}`}>{level}</span>
            </div>
          );
        })}

        <div className="pt-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Risk signals detected
          </p>
          {companies.map((c) => {
            const total = risk?.[c.id]?.totalSignals || 0;
            return (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <span className="w-[110px] text-[12.5px] font-semibold text-slate-700 truncate">{c.name}</span>
                <span className="cmp-risk-track">
                  <span
                    style={{
                      width: `${(total / maxSignals) * 100}%`,
                      background: 'linear-gradient(90deg,#93b4fb,#a78bfa)',
                    }}
                  />
                </span>
                <span className="text-[12.5px] font-bold text-slate-800 w-6 text-right">{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};
