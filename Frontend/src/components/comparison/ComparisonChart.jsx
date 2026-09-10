import React, { useState } from 'react';
import { CardHead } from '../app/ui';
import { MockBadge, SERIES_COLORS } from './MockBadge';

const METRICS = [
  { key: 'revenue', label: 'Revenue', unit: 'B' },
  { key: 'revenueGrowth', label: 'Revenue Growth', unit: '%' },
  { key: 'profitMargin', label: 'Profit Margin', unit: '%' },
];

const toNumber = (v) => parseFloat(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;

/** Grouped bar chart comparing one metric across the selected companies. */
export const ComparisonChart = ({ companies, metrics }) => {
  const [active, setActive] = useState('revenue');
  const [hover, setHover] = useState(null);
  const metric = METRICS.find((m) => m.key === active);

  const values = companies.map((c) => toNumber(metrics?.[c.id]?.[active]));
  const max = Math.max(1, ...values);

  const W = 720;
  const H = 240;
  const padX = 44;
  const padTop = 18;
  const padBottom = 42;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const slot = plotW / Math.max(companies.length, 1);
  const barW = Math.min(64, slot * 0.44);

  return (
    <article className="dash-card dash-reveal">
      <CardHead
        title="Visual Comparison"
        subtitle="Direct metric comparison across the selected companies."
        right={<MockBadge />}
      />
      <div className="dash-pills px-[18px] pb-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`dash-pill ${active === m.key ? 'is-active' : ''}`}
            onClick={() => setActive(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="cmp-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${metric.label} comparison`}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padTop + plotH * t;
            return (
              <g key={t}>
                <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="#eef2f9" strokeWidth="1" />
                <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {Math.round(max * (1 - t) * 10) / 10}
                </text>
              </g>
            );
          })}

          {companies.map((c, i) => {
            const v = values[i];
            const h = Math.max(3, (v / max) * plotH);
            const x = padX + slot * i + (slot - barW) / 2;
            const y = padTop + plotH - h;
            return (
              <g key={c.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect
                  className="cmp-bar"
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="8"
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  opacity={hover === null || hover === i ? 0.92 : 0.4}
                  style={{ animationDelay: `${i * 90}ms` }}
                />
                <text
                  x={x + barW / 2}
                  y={y - 7}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {metrics?.[c.id]?.[active] ?? '—'}
                </text>
                <text
                  x={x + barW / 2}
                  y={padTop + plotH + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {c.ticker}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="cmp-legend">
        {companies.map((c, i) => (
          <span key={c.id}>
            <i style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            {c.name}
          </span>
        ))}
      </div>
    </article>
  );
};
