import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { workspaceService } from '../services/workspaceService';
import { documentService } from '../services/documentService';
import { ResearchChat } from '../components/app/ResearchChat';
import { PageHead, CardHead, Empty, timeAgo, statusBadge } from '../components/app/ui';
import {
  Layers,
  Plus,
  Upload,
  FileText,
  Bot,
  Sparkles,
  ShieldAlert,
  Activity,
  FileBarChart,
  Quote,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import './dashboard.css';
import './app-pages.css';

const AGENTS = [
  { name: 'Document Agent', Icon: FileText },
  { name: 'Extraction Agent', Icon: Sparkles },
  { name: 'Risk Agent', Icon: ShieldAlert },
  { name: 'Comparison Agent', Icon: Activity },
  { name: 'Report Agent', Icon: FileBarChart },
];

export const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [citations, setCitations] = useState([]);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef(null);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);
      if (list.length > 0 && !activeWorkspace) setActiveWorkspace(list[0]);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!activeWorkspace) return;
    try {
      setDocuments(await documentService.getDocuments(activeWorkspace.id));
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) loadDocuments();
  }, [activeWorkspace]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const ws = await workspaceService.createWorkspace(newWsName.trim(), 'Created in Analyst Workspace');
      setWorkspaces((prev) => [ws, ...prev]);
      setActiveWorkspace(ws);
      setNewWsName('');
      setShowCreateModal(false);
    } catch (err) {
      alert('Failed to create workspace.');
    }
  };

  const handleUpload = async (file) => {
    if (!file || !activeWorkspace) return;
    setUploading(1);
    try {
      await documentService.uploadDocument(
        file,
        activeWorkspace.id,
        'Infosys Limited',
        'Annual Report',
        2024,
        (p) => setUploading(Math.max(1, p))
      );
      await loadDocuments();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this document from the workspace index?')) return;
    try {
      await documentService.deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <main className="dash-body">
      <PageHead
        eyebrow="Multi-agent research"
        title="Research Workspace"
        subtitle="Investigate companies, filings and financial signals with multi-agent intelligence."
        actions={
          <>
            <button type="button" className="dash-btn dash-btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Upload Filing
            </button>
            <button type="button" className="dash-btn dash-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              New Research
            </button>
          </>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.xlsx,.docx"
        className="hidden"
        onChange={(e) => {
          handleUpload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* Active workspace selector */}
      <section className="dash-card dash-reveal p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
            <Layers className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Active workspace</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <select
                className="app-field w-auto max-w-full h-9 text-[13px] font-semibold"
                value={activeWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) setActiveWorkspace(ws);
                }}
              >
                {workspaces.length === 0 && <option value="">No workspaces yet</option>}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.documents_count ?? 0} docs)
                  </option>
                ))}
              </select>
              <span className="app-meta truncate">
                {activeWorkspace?.description || 'Multi-agent deep dive analysis on company filings.'}
              </span>
            </div>
          </div>
        </div>
        <Link to="/documents" className="dash-link shrink-0">
          Manage documents →
        </Link>
      </section>

      {uploading > 0 && (
        <div className="dash-card dash-reveal p-4">
          <p className="text-[12.5px] font-semibold text-slate-700 mb-2">Uploading filing… {uploading}%</p>
          <div className="app-bar">
            <span style={{ width: `${uploading}%` }} />
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ResearchChat workspaceId={activeWorkspace?.id} onCitations={setCitations} />
        </div>

        <div className="space-y-4">
          <article className="dash-card dash-reveal">
            <CardHead title="Active AI Agents" subtitle="Agents assigned to this workspace" />
            <div className="p-2.5">
              {AGENTS.map((a) => (
                <div key={a.name} className="dash-row">
                  <span className="dash-status-dot status-active" />
                  <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                    <a.Icon className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-slate-700 truncate">{a.name}</span>
                  <span className="dash-badge badge-ok">Active</span>
                </div>
              ))}
            </div>
          </article>

          <article className="dash-card dash-reveal">
            <CardHead
              title="Workspace Documents"
              subtitle="Filings indexed for this research session"
              right={
                <button type="button" className="dash-link" onClick={() => fileRef.current?.click()}>
                  Upload →
                </button>
              }
            />
            <div className="p-2.5">
              {documents.length === 0 ? (
                <Empty
                  Icon={FileText}
                  title="No filings indexed yet"
                  description="Upload an annual report, transcript or filing and the Document Agent will index it for research."
                  actionLabel="Upload Filing"
                  onAction={() => fileRef.current?.click()}
                />
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="dash-row">
                    <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                      <FileText className="w-[17px] h-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-slate-700 truncate">{doc.title}</span>
                      <span className="block app-meta truncate">
                        {doc.company_name} • {timeAgo(doc.uploaded_at || doc.created_at)}
                      </span>
                    </span>
                    <span className={`dash-badge ${statusBadge(doc.status)}`}>{doc.status || 'Indexed'}</span>
                    <button
                      type="button"
                      className="app-act app-act-danger"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="dash-card dash-reveal">
          <CardHead title="Research Insights" subtitle="Signals surfaced from this workspace" />
          <div className="p-2.5">
            {documents.length === 0 ? (
              <Empty
                Icon={Sparkles}
                title="No insights yet"
                description="Insights appear once the agents have analysed at least one indexed filing in this workspace."
                actionLabel="Start Research"
                onAction={() => fileRef.current?.click()}
              />
            ) : (
              <>
                <div className="dash-row">
                  <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                    <FileText className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 text-[13px] text-slate-600">
                    {documents.length} filing{documents.length === 1 ? '' : 's'} indexed and searchable
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
                    <Bot className="w-[17px] h-[17px]" />
                  </span>
                  <span className="flex-1 text-[13px] text-slate-600">
                    {citations.length} grounded citation{citations.length === 1 ? '' : 's'} produced this session
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </div>
              </>
            )}
          </div>
        </article>

        <article className="dash-card dash-reveal">
          <CardHead title="Source Citations" subtitle="Every answer traced back to its filing" />
          <div className="p-2.5">
            {citations.length === 0 ? (
              <Empty
                Icon={Quote}
                title="No citations yet"
                description="Ask the research agent a question — supporting quotes and page references will be collected here."
              />
            ) : (
              citations.slice(0, 8).map((c, i) => (
                <div key={i} className="dash-row items-start">
                  <span className="dash-row-icon mt-0.5" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                    <Quote className="w-[16px] h-[16px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-700 truncate">{c.source}</span>
                    {c.quote && <span className="block app-meta line-clamp-2">"{c.quote}"</span>}
                  </span>
                  <span className="dash-badge badge-info">{c.page}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {loading && workspaces.length === 0 && <div className="dash-skel h-24 w-full" />}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <form onSubmit={handleCreateWorkspace} className="dash-card w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="dash-card-title">New research session</h3>
              <p className="dash-card-sub">Group filings, questions and reports for one investigation.</p>
            </div>
            <div>
              <label className="app-label">Workspace name</label>
              <input
                className="app-field"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="e.g. FY24 Q4 Competitor Analysis"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-1">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="dash-btn dash-btn-primary">
                Create workspace
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
