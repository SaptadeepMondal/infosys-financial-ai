import React, { useMemo, useState } from 'react';

/**
 * Premium multi-line research activity chart.
 *
 * IMPORTANT — DATA CONTRACT:
 * This component never invents data. It receives the real records returned by
 * the existing dashboard API (documents, workspaces/sessions, reports) and
 * buckets them by their own timestamps. If there are no records, the parent
 * renders an empty state instead.
 */

const SERIES_META = [
  { key: 'documents', label: 'Documents Analyzed', color: '#2563EB' },
  { key: 'sessions', label: 'Research Sessions', color: '#6D4AFF' },
  { key: 'reports', label: 'Reports Generated', color: '#60A5FA' },
];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const buildActivitySeries = (sources, days) => {
  const today = startOfDay(new Date());
  const bucketCount = days <= 7 ? 7 : days <= 30 ? 10 : 12;
  const span = days / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const end = new Date(today);
    end.setDate(end.getDate() - Math.round(span * (bucketCount - 1 - i)));
    return { end, documents: 0, sessions: 0, reports: 0 };
  });

  const place = (dateStr, key) => {
    if (!dateStr) return;
    const t = startOfDay(new Date(dateStr)).getTime();
    if (Number.isNaN(t)) return;
    const idx = buckets.findIndex((b) => t <= b.end.getTime());
    if (idx >= 0) buckets[idx][key] += 1;
  };

  (sources.documents || []).forEach((d) => place(d.uploaded_at || d.created_at, 'documents'));
  (sources.sessions || []).forEach((w) => place(w.updated_at || w.created_at, 'sessions'));
  (sources.reports || []).forEach((r) => place(r.created_at, 'reports'));

  return buckets;
};

export const ActivityChart = ({ buckets }) => {
  const [hover, setHover] = useState(null);

  const W = 720;
  const H = 240;
  const PAD = { l: 34, r: 14, t: 16, b: 26 };

  const { max, paths, points } = useMemo(() => {
    const maxVal = Math.max(
      1,
      ...buckets.flatMap((b) => [b.documents, b.sessions, b.reports])
    );
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const x = (i) => PAD.l + (buckets.length === 1 ? innerW / 2 : (i * innerW) / (buckets.length - 1));
    const y = (v) => PAD.t + innerH - (v / maxVal) * innerH;

    const smooth = (pts) =>
      pts
        .map(([px, py], i, arr) => {
          if (i === 0) return `M ${px} ${py}`;
          const [ax, ay] = arr[i - 1];
          const cx = (ax + px) / 2;
          return `C ${cx} ${ay}, ${cx} ${py}, ${px} ${py}`;
        })
        .join(' ');

    const pathMap = {};
    const pointMap = {};
    SERIES_META.forEach((s) => {
      const pts = buckets.map((b, i) => [x(i), y(b[s.key])]);
      pathMap[s.key] = smooth(pts);
      pointMap[s.key] = pts;
    });

    return { max: maxVal, paths: pathMap, points: pointMap };
  }, [buckets]);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-4 px-1 pb-3">
        {SERIES_META.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2 text-[12px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[240px]" role="img" aria-label="Research activity over time">
        <defs>
          <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const y = PAD.t + (H - PAD.t - PAD.b) * g;
          return (
            <g key={g}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#DCE5F2" strokeWidth="1" />
              <text x={8} y={y + 4} fontSize="10" fill="#94A3B8">
                {Math.round(max * (1 - g))}
              </text>
            </g>
          );
        })}

        <path
          d={`${paths.documents} L ${W - PAD.r} ${H - PAD.b} L ${PAD.l} ${H - PAD.b} Z`}
          fill="url(#dashFill)"
        />

        {SERIES_META.map((s) => (
          <path
            key={s.key}
            d={paths[s.key]}
            fill="none"
            stroke={s.color}
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: 2000,
              animation: 'dashDraw 1.5s cubic-bezier(0.22,1,0.36,1) forwards',
            }}
          />
        ))}

        {buckets.map((b, i) => {
          const px = points.documents[i][0];
          return (
            <g key={i}>
              {hover === i && (
                <line x1={px} x2={px} y1={PAD.t} y2={H - PAD.b} stroke="#3155E7" strokeOpacity="0.25" strokeWidth="1" />
              )}
              {hover === i &&
                SERIES_META.map((s) => (
                  <circle key={s.key} cx={px} cy={points[s.key][i][1]} r="4" fill="#fff" stroke={s.color} strokeWidth="2.5" />
                ))}
              <rect
                x={px - 18}
                y={PAD.t}
                width="36"
                height={H - PAD.t - PAD.b}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <text x={px} y={H - 8} fontSize="10" fill="#94A3B8" textAnchor="middle">
                {b.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            </g>
          );
        })}
        <style>{`@keyframes dashDraw { to { stroke-dashoffset: 0; } }`}</style>
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-8 rounded-xl border border-[#DCE5F2] bg-white/95 px-3 py-2 shadow-[0_12px_30px_rgba(50,70,110,0.12)]"
          style={{ left: `${(points.documents[hover][0] / W) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <p className="text-[11px] font-semibold text-slate-800">
            {buckets[hover].end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
          {SERIES_META.map((s) => (
            <p key={s.key} className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}
              <span className="ml-auto font-semibold text-slate-800">{buckets[hover][s.key]}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
