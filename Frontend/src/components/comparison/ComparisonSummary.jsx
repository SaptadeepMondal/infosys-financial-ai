import React from 'react';
import { CardHead } from '../app/ui';
import { MockBadge } from './MockBadge';

/** Headline takeaways — derived on the backend once real data is wired in. */
export const ComparisonSummary = ({ summary = [] }) => (
  <article className="dash-card dash-reveal">
    <CardHead
      title="Comparison Summary"
      subtitle="Headline takeaways across the selected companies."
      right={<MockBadge />}
    />
    <div className="cmp-summary-grid">
      {summary.map((item) => (
        <div key={item.label} className="cmp-summary-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint && <em>{item.hint}</em>}
        </div>
      ))}
    </div>
  </article>
);
