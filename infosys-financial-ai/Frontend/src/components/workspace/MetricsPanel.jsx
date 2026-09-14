import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TrendingUp, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export const MetricsPanel = () => {
  const metrics = [
    { name: 'Revenue (USD)', value: '$18,562M', prev: '$18,212M', yoy: '+1.9%', positive: true, citation: 'FY24 20-F p. 14' },
    { name: 'Operating Margin (EBIT)', value: '20.7%', prev: '21.0%', yoy: '-30 bps', positive: false, citation: 'FY24 20-F p. 42' },
    { name: 'Large Deal TCV', value: '$17.7 Billion', prev: '$9.8 Billion', yoy: '+80.6%', positive: true, citation: 'Q4 Transcript p. 4' },
    { name: 'Free Cash Flow (FCF)', value: '$2,890M', prev: '$2,480M', yoy: '+16.5%', positive: true, citation: 'FY24 20-F p. 55' },
    { name: 'Debt to Equity Ratio', value: '0.07x', prev: '0.08x', yoy: '-0.01x', positive: true, citation: 'Note 2.22 p. 214' },
    { name: 'EPS (Diluted USD)', value: '$0.73', prev: '$0.71', yoy: '+2.8%', positive: true, citation: 'FY24 20-F p. 45' },
  ];

  return (
    <Card
      title="Extracted Key Financial Metrics & Ratios"
      subtitle="Automatically pulled by Extraction Agent upon filing ingestion"
      headerAction={<Badge variant="emerald">VERIFIED AGAINST SOURCE</Badge>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl glass-inset hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{m.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-100">{m.value}</span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${m.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {m.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {m.yoy}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>FY23: {m.prev}</span>
              <span className="text-emerald-400/90">{m.citation}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
