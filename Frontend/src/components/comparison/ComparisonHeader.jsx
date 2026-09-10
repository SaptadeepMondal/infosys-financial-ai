import React from 'react';
import { X } from 'lucide-react';
import { CardHead } from '../app/ui';
import { CompanyLogo } from './CompanySelector';

/** One company column header. */
export const SelectedCompanyCard = ({ company, onRemove }) => (
  <div className="cmp-head-card">
    <CompanyLogo company={company} />
    <div className="min-w-0 flex-1">
      <p className="cmp-name truncate">{company.name}</p>
      <p className="cmp-meta truncate">{company.ticker}</p>
      <p className="cmp-meta truncate">{company.industry}</p>
    </div>
    {onRemove && (
      <button type="button" className="cmp-remove" onClick={() => onRemove(company.id)} title="Remove">
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

export const ComparisonHeader = ({ companies, onRemove }) => (
  <article className="dash-card dash-reveal">
    <CardHead title="Company Comparison" subtitle="Side-by-side financial and research intelligence." />
    <div
      className="cmp-head-grid"
      style={{ gridTemplateColumns: `repeat(${Math.min(companies.length, 4)}, minmax(0, 1fr))` }}
    >
      {companies.map((c) => (
        <SelectedCompanyCard key={c.id} company={c} onRemove={onRemove} />
      ))}
    </div>
  </article>
);
