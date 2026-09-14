import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { Layers, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentWorkspaces = ({ workspaces = [] }) => {
  return (
    <Card
      title="Recent Research Sessions"
      subtitle="Active multi-agent workspaces"
      headerAction={
        <Link to="/workspace" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          All Workspaces →
        </Link>
      }
    >
      {workspaces.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No active research sessions"
          description="Create a workspace to ingest filings and run the multi-agent research pipeline against them."
          action={
            <Link
              to="/workspace"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
            >
              Launch workspace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to="/workspace"
              className="p-4 rounded-xl glass-inset hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-semibold text-slate-200 text-sm group-hover:text-emerald-400 transition-colors">
                      {ws.name}
                    </h4>
                  </div>
                  <Badge variant="cyan">{ws.documents_count} Docs</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {ws.description || "Multi-agent deep dive financial assessment."}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Updated: {ws.updated_at ? ws.updated_at.slice(0, 10) : 'Recent'}</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
