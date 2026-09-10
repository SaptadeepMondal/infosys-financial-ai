import React from 'react';
import { CardHead } from '../app/ui';
import { MockBadge } from './MockBadge';

/* higher: true  -> a larger value is the stronger one
   higher: false -> a smaller value is the stronger one */
const ROWS = [
  { key: 'peRatio', label: 'P/E Ratio', higher: false, suffix: 'x' },
  { key: 'pbRatio', label: 'P/B Ratio', higher: false, suffix: 'x' },
  { key: 'roe', label: 'ROE', higher: true, suffix: '%' },
  { key: 'roa', label: 'ROA', higher: true, suffix: '%' },
  { key: 'debtToEquity', label: 'Debt-to-Equity', higher: false, suffix: 'x' },
  { key: 'currentRatio', label: 'Current Ratio', higher: true, suffix: 'x' },
  { key: 'operatingMargin', label: 'Operating Margin', higher: true, suffix: '%' },
];

export const FinancialRatiosTable = ({ companies, ratios }) => (
  <article className="dash-card dash-reveal">
    <CardHead
      title="Key Financial Ratios"
      subtitle="Strongest value in each row is marked — sector context still applies."
      right={<MockBadge />}
    />
    <div className="cmp-table-wrap">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-sticky">Ratio</th>
            {companies.map((c) => (
              <th key={c.id}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = companies.map((c) => ratios?.[c.id]?.[row.key]);
            const valid = values.filter((v) => typeof v === 'number');
            const best = valid.length
              ? (row.higher ? Math.max(...valid) : Math.min(...valid))
              : null;
            return (
              <tr key={row.key}>
                <th className="cmp-sticky">{row.label}</th>
                {companies.map((c, i) => (
                  <td key={c.id} className="cmp-val">
                    {typeof values[i] === 'number' ? `${values[i]}${row.suffix}` : '—'}
                    {best !== null && values[i] === best && <span className="cmp-best">Best</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </article>
);
