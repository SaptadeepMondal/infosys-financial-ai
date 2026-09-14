import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { FileText, CheckCircle2, Calendar, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentDocuments = ({ documents = [] }) => {
  return (
    <Card
      title="Recently Indexed Financial Documents"
      subtitle="Parsed, embedded, and ready for multi-agent retrieval"
      headerAction={
        <Link to="/workspace" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          Open Workspace →
        </Link>
      }
    >
      {documents.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No filings indexed"
          description="Upload an annual report, 10-K or 20-F in the Research Workspace. The Document Agent parses, chunks and embeds it for retrieval."
          action={
            <Link
              to="/workspace"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
            >
              Upload a filing
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Filing & Title</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">FY</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.05] transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-xs" title={doc.title}>{doc.title}</span>
                    {doc.is_seed && (
                      <Badge variant="emerald">SEED DOC</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{doc.company_name}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{doc.filing_type}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">FY{doc.fiscal_year}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{doc.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
