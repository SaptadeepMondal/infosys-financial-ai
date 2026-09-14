import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const RedFlagsPanel = () => {
  const flags = [
    {
      severity: 'medium',
      title: 'North American BFS Discretionary Demand Softness',
      description: 'Client budget scrutiny and delayed decision-making cycles in Banking & Financial Services caused slower project ramps.',
      citation: 'FY24 Annual Report p. 44 (Segment Analysis)',
    },
    {
      severity: 'low',
      title: 'Offshore Wage Increases & Margin Compression Risk',
      description: 'While Project Maximus offset subcontracting expenses, scheduled compensation hikes may compress operating margins in H1 FY25.',
      citation: 'FY24 Q4 Transcript p. 12 (CFO Guidance)',
    },
    {
      severity: 'info',
      title: 'Statutory Auditor Verification (Clean Audit)',
      description: 'No going-concern modifications or auditor qualifications reported by Deloitte Haskins & Sells LLP.',
      citation: 'FY24 Annual Report p. 182 (Independent Auditor Report)',
    },
    {
      severity: 'info',
      title: 'Debt Leverage Assessment',
      description: 'Debt-to-Equity remains exceptionally low at 0.07x with strong liquidity ($4.5B cash & cash equivalents).',
      citation: 'FY24 Annual Report p. 214 (Liquidity Note)',
    },
  ];

  const badgeMap = {
    high: { variant: 'rose', label: 'HIGH RISK' },
    medium: { variant: 'amber', label: 'MEDIUM ALERT' },
    low: { variant: 'cyan', label: 'LOW WARNING' },
    info: { variant: 'emerald', label: 'VERIFIED CLEAN' },
  };

  return (
    <Card
      title="Automated Red Flags & Anomaly Scanner"
      subtitle="Scans filings for rising debt, falling margins, auditor qualifications, and unusual patterns"
      headerAction={<Badge variant="amber">4 automated scans</Badge>}
    >
      <div className="space-y-3">
        {flags.map((item, idx) => {
          const config = badgeMap[item.severity] || badgeMap.info;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl glass-inset hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    item.severity === 'medium' ? 'text-amber-400' :
                    item.severity === 'high' ? 'text-rose-400' : 'text-emerald-400'
                  }`} />
                  <h4 className="font-semibold text-slate-200 text-xs">{item.title}</h4>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Scan Engine: Red Flag Agent v1</span>
                <span className="text-emerald-400">{item.citation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
