import React from 'react';
import {
  FolderTree,
  FileText,
  AlertTriangle,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/**
 * Premium KPI row. Purely presentational — renders exactly what the API returns.
 * No value, change or trend is ever fabricated here.
 */
export const StatsCards = ({ cards = [] }) => {
  const iconMap = {
    FolderTree,
    FileText,
    AlertTriangle,
    FileCheck,
  };

  // Semantic accent per metric family: indigo = research, cyan = system/technical,
  // red = risk, green = completed output. Presentation only.
  const toneMap = {
    FolderTree: {
      icon: 'text-brand-300 bg-brand-500/10 border-brand-400/20',
      rail: 'via-brand-400/45',
    },
    FileText: {
      icon: 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20',
      rail: 'via-cyan-400/45',
    },
    AlertTriangle: {
      icon: 'text-rose-400 bg-rose-500/10 border-rose-400/20',
      rail: 'via-rose-400/45',
    },
    FileCheck: {
      icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20',
      rail: 'via-emerald-400/45',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
      {cards.map((card, idx) => {
        const IconComponent = iconMap[card.icon] || FileText;
        const tone = toneMap[card.icon] || toneMap.FolderTree;
        const isUp = card.trend === 'up';
        const isDown = card.trend === 'down';
        const hasTrend = Boolean(card.change) && (isUp || isDown);

        return (
          <div
            key={idx}
            className="group relative overflow-hidden glass rounded-2xl transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-lift"
          >
            {/* hairline accent rail */}
            <span
              className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${tone.rail} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`}
            />

            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="eyebrow leading-4 max-w-[10.5rem]">{card.title}</span>
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors duration-300 ${tone.icon}`}
                >
                  <IconComponent className="w-[17px] h-[17px]" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2.5">
                <span className="text-[2.25rem] leading-none font-bold text-slate-50 tracking-tight tabular-nums">
                  {card.value}
                </span>
                {hasTrend && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                )}
              </div>

              {card.change && (
                <p
                  className="mt-3 pt-3 border-t glass-divider text-[11px] text-slate-400 leading-snug truncate"
                  title={card.change}
                >
                  {card.change}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
