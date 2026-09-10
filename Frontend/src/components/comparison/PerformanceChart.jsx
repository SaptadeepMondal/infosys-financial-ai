import React, { useState } from 'react';
import { CardHead } from '../app/ui';
import { MockBadge, SERIES_COLORS } from './MockBadge';

const SERIES = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'profit', label: 'Profit' },
  { key: 'margin', label: 'Margin' },
];

const RANGES = [
  { key: '1Y', points: 2 },
  { key: '3Y', points: 3 },
  { key: '5Y', points: 5 },
];

const curve = (pts) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return d;
};

/** Historical trend lines per company for revenue / profit / margin. */
export const PerformanceChart = ({ companies, performance, periods }) => {
  const [series, setSeries] = useState('revenue');
  const [range, setRange] = useState('5Y');

  const count = RANGES.find((r) => r.key === range).points;
  const labels = (periods || []).slice(-count);

  const data = companies.map((c) => ({
    company: c,
    values: (performance?.[c.id]?.[series] || []).slice(-count),
  }));

  const all = data.flatMap((d) => d.values);
  const max = all.length ? Math.max(...all) : 1;
  const min = all.length ? Math.min(...all) : 0;
  const span = max - min || 1;

  const W = 720;
  const H = 250;
  const padX = 44;
  const padTop = 18;
  const padBottom = 40;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const xAt = (i, n) => padX + (n <= 1 ? plotW / 2 : (plotW / (n - 1)) * i);
  const yAt = (v) => padTop + plotH - ((v - min) / span) * plotH;

  return (
    <article className="dash-card dash-reveal">
      <CardHead
        title="Performance"
        subtitle="Revenue growth, profit growth and margin trend over time."
        right={<MockBadge />}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-[18px] pb-2">
        <div className="dash-pills">
          {SERIES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`dash-pill ${series === s.key ? 'is-active' : ''}`}
              onClick={() => setSeries(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="dash-pills">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`dash-pill ${range === r.key ? 'is-active' : ''}`}
              onClick={() => setRange(r.key)}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <div className="cmp-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Performance trend">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padTop + plotH * t;
            return (
              <g key={t}>
                <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="#eef2f9" strokeWidth="1" />
                <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {Math.round((min + span * (1 - t)) * 10) / 10}
                </text>
              </g>
            );
          })}

          {labels.map((l, i) => (
            <text
              key={l}
              x={xAt(i, labels.length)}
              y={padTop + plotH + 22}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              {l}
            </text>
          ))}

          {data.map((d, si) => {
            const pts = d.values.map((v, i) => [xAt(i, d.values.length), yAt(v)]);
            const color = SERIES_COLORS[si % SERIES_COLORS.length];
            return (
              <g key={d.company.id}>
                <path className="cmp-line" d={curve(pts)} stroke={color} style={{ animationDelay: `${si * 120}ms` }} />
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3.4" fill="#fff" stroke={color} strokeWidth="2">
                    <title>{`${d.company.name} • ${labels[i]}: ${d.values[i]}`}</title>
                  </circle>
                ))}
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
