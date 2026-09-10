import React from 'react';
import { CardHead } from '../app/ui';
import { MockBadge } from './MockBadge';

/* Row definitions — `key` maps 1:1 to the FinancialMetrics shape in mockData.js,
   so the backend can supply the same field names with real values. */
const ROWS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'revenueGrowth', label: 'Revenue Growth' },
  { key: 'netIncome', label: 'Net Income' },
  { key: 'profitMargin', label: 'Profit Margin' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'ebitdaMargin', label: 'EBITDA Margin' },
  { key: 'eps', label: 'EPS' },
  { key: 'marketCap', label: 'Market Cap' },
];

export const FinancialMetricsTable = ({ companies, metrics, risk }) => (
  <article className="dash-card dash-reveal">
    <CardHead
      title="Financial Overview"
      subtitle="Reported figures normalised across the selected companies."
      right={<MockBadge />}
    />
    <div className="cmp-table-wrap">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-sticky">Metric</th>
            {companies.map((c) => (
              <th key={c.id}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <th className="cmp-sticky">{row.label}</th>
              {companies.map((c) => (
                <td key={c.id} className="cmp-val">
                  {metrics?.[c.id]?.[row.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          {risk && (
            <tr>
              <th className="cmp-sticky">Risk Level</th>
              {companies.map((c) => (
                <td key={c.id}>
                  <span className={`cmp-chip chip-${String(risk[c.id]?.riskLevel || 'low').toLowerCase()}`}>
                    {risk[c.id]?.riskLevel || '—'}
                  </span>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </article>
);
