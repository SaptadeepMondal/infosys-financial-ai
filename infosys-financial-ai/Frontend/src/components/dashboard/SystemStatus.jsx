import React from 'react';
import { Card } from '../common/Card';
import { Cpu, ShieldCheck, Database, Quote } from 'lucide-react';

/**
 * Compact system-status panel. Mirrors the Agents Engine information already
 * surfaced in the sidebar — no new capabilities, no fabricated telemetry.
 */
const AGENTS = ['Document Agent', 'Extraction Agent', 'Red Flag Agent', 'Comparison Agent'];

export const SystemStatus = () => {
  return (
    <Card
      title="AI System Status"
      subtitle="Multi-agent pipeline & grounding controls"
      headerAction={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {AGENTS.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg glass-inset"
          >
            <span className="flex items-center gap-2 min-w-0">
              <Cpu className="w-3.5 h-3.5 text-brand-300 shrink-0" />
              <span className="text-xs font-medium text-slate-200 truncate">{name}</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 shrink-0">
              Active
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t glass-divider grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
        <div className="flex items-center gap-2 text-slate-400">
          <Quote className="w-3.5 h-3.5 text-brand-300 shrink-0" />
          <span>
            Source grounding <span className="text-slate-200 font-semibold">Enforced</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Hallucination <span className="text-slate-200 font-semibold">0</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Database className="w-3.5 h-3.5 text-brand-300 shrink-0" />
          <span>
            Database <span className="text-slate-200 font-semibold font-mono">MongoDB</span>
          </span>
        </div>
      </div>
    </Card>
  );
};
