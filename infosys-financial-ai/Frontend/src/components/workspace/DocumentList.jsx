import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText, Trash2, CheckCircle2, Database, Shield } from 'lucide-react';
import { documentService } from '../../services/documentService';

export const DocumentList = ({ documents = [], onDeleteSuccess }) => {
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from vector DB?`)) return;
    try {
      await documentService.deleteDocument(id);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  return (
    <Card
      title="Workspace Indexed Filings"
      subtitle="Documents loaded in active memory for this research session"
    >
      {documents.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          No filings in this workspace yet. Upload an annual report or 10-K above.
        </div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl glass-inset flex items-center justify-between hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-200 text-xs truncate max-w-xs" title={doc.title}>
                      {doc.title}
                    </h4>
                    {doc.is_seed && <Badge variant="emerald">SEED DOC</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {doc.company_name} • {doc.filing_type} (FY{doc.fiscal_year}) • {doc.chunks_count} chunks indexed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="cyan" className="hidden sm:inline-flex">
                  <Database className="w-3 h-3 mr-1" />
                  VECTOR DB
                </Badge>
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove from Workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
