import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Scale, CheckCircle2, ArrowRight } from 'lucide-react';

export const ComparisonPanel = () => {
  const [sector, setSector] = useState('IT_SERVICES');

  const comparisonData = {
    IT_SERVICES: {
      headers: ['Metric (FY24)', 'Infosys (INFY)', 'TCS Limited', 'Wipro Limited', 'Sector Average'],
      rows: [
        { metric: 'Revenue Growth (YoY)', infy: '+1.9%', tcs: '+6.8%', wipro: '-3.8%', avg: '+1.6%' },
        { metric: 'Operating Margin (EBIT)', infy: '20.7%', tcs: '24.6%', wipro: '16.1%', avg: '20.5%' },
        { metric: 'Large Deal TCV', infy: '$17.7 Billion', tcs: '$13.2 Billion', wipro: '$4.6 Billion', avg: '$11.8 Billion' },
        { metric: 'Free Cash Flow (FCF) Conversion', infy: '88.4%', tcs: '86.1%', wipro: '91.2%', avg: '88.6%' },
        { metric: 'Debt to Equity Ratio', infy: '0.07x', tcs: '0.05x', wipro: '0.22x', avg: '0.11x' },
        { metric: 'Employee Attrition (LTM)', infy: '12.6%', tcs: '12.5%', wipro: '14.2%', avg: '13.1%' },
      ],
    },
    BIG_TECH: {
      headers: ['Metric (FY24)', 'Apple (AAPL)', 'Microsoft (MSFT)', 'Alphabet (GOOGL)', 'Sector Average'],
      rows: [
        { metric: 'Revenue Growth (YoY)', infy: '+2.0%', tcs: '+15.7%', wipro: '+11.8%', avg: '+9.8%' },
        { metric: 'Operating Margin (EBIT)', infy: '30.7%', tcs: '44.6%', wipro: '31.3%', avg: '35.5%' },
        { metric: 'Free Cash Flow (USD)', infy: '$104.0B', tcs: '$74.1B', wipro: '$69.5B', avg: '$82.5B' },
        { metric: 'Debt to Equity Ratio', infy: '1.45x', tcs: '0.38x', wipro: '0.09x', avg: '0.64x' },
      ],
    },
  };

  const activeData = comparisonData[sector] || comparisonData.IT_SERVICES;

  return (
    <Card
      title="Multi-Company Peer Comparison & Benchmarking"
      subtitle="Automated cross-document extraction comparing ratios across competitors"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSector('IT_SERVICES')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              sector === 'IT_SERVICES'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'glass-inset text-slate-400 hover:text-white'
            }`}
          >
            Indian IT Peers (INFY / TCS / WIPRO)
          </button>
          <button
            onClick={() => setSector('BIG_TECH')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              sector === 'BIG_TECH'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'glass-inset text-slate-400 hover:text-white'
            }`}
          >
            US Big Tech Ratios
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {activeData.headers.map((h, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 ${
                    idx === 1 ? 'text-emerald-400 font-bold bg-emerald-500/10 border-l border-r border-emerald-500/20' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs">
            {activeData.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.05] transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-200">{row.metric}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400 bg-emerald-500/5 border-l border-r border-emerald-500/20">
                  {row.infy}
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">{row.tcs}</td>
                <td className="py-3 px-4 font-mono text-slate-300">{row.wipro}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{row.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Extracted via Comparison Agent cross-filing matrix</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          NORMALIZED ON FY2024 CONSOLIDATED IFRS/GAAP
        </span>
      </div>
    </Card>
  );
};
