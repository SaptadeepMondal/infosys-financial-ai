import React from 'react';
import { Card } from '../common/Card';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Renders only the red-flag information the dashboard API already returns.
 * If the metric is absent, the component renders nothing.
 */
export const RiskSignals = ({ card }) => {
  if (!card) return null;

  return (
    <Card
      title="Automated Risk Signals"
      subtitle="Detected by the Red Flag Agent across indexed filings"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[2rem] leading-none font-bold text-slate-50 tabular-nums tracking-tight">
            {card.value}
          </p>
          <p className="eyebrow mt-2">{card.title}</p>
        </div>
      </div>

      {card.change && (
        <p className="mt-4 pt-4 border-t glass-divider text-[11px] text-slate-400 leading-relaxed">
          {card.change}
        </p>
      )}

      <Link
        to="/workspace"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        Review in research workspace <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </Card>
  );
};
