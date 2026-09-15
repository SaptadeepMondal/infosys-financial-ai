import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
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
  ChevronDown,
  MoreVertical,
  Check,
} from 'lucide-react';
import './dashboard.css';
import './app-pages.css';



export const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('activeWorkspaceId') || null;
  });
  
  // Compute activeWorkspace derived from state to ensure it always matches a valid object in the list
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;

  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [citations, setCitations] = useState([]);
  const [uploading, setUploading] = useState(0);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);
  const [wsToDelete, setWsToDelete] = useState(null);
  const [isDeletingWs, setIsDeletingWs] = useState(false);
  const fileRef = useRef(null);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);
      
      // If we don't have an active workspace saved, or the saved one doesn't exist, default to the first one
      if (list.length > 0) {
        const found = list.find(w => w.id === activeWorkspaceId);
        if (!found) {
          setActiveWorkspaceId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!activeWorkspace) return;
    try {
      const docs = await documentService.getDocuments(activeWorkspace.id);
      setDocuments(docs);
      if (activeDocumentId && docs.length > 0 && !docs.find((d) => d.id === activeDocumentId)) {
        setActiveDocumentId(null);
      } else if (docs.length === 0) {
        setActiveDocumentId(null);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      localStorage.setItem('activeWorkspaceId', activeWorkspace.id);
      loadDocuments();
    }
  }, [activeWorkspace?.id]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const ws = await workspaceService.createWorkspace(newWsName.trim(), 'Created in Analyst Workspace');
      setWorkspaces((prev) => [ws, ...prev]);
      setActiveWorkspaceId(ws.id);
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
      const companyName = file.name ? (file.name.split('.').slice(0, -1).join('.') || file.name) : 'Infosys Limited';
      const formattedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

      await documentService.uploadDocument(
        file,
        activeWorkspace.id,
        formattedName,
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

  const confirmDeleteDoc = async () => {
    if (!docToDelete) return;
    setIsDeletingDoc(true);
    try {
      await documentService.deleteDocument(docToDelete);
      await loadDocuments();
      setDocToDelete(null);
    } catch (err) {
      alert('Delete failed.');
    } finally {
      setIsDeletingDoc(false);
    }
  };

  const confirmDeleteWs = async () => {
    if (!wsToDelete) return;
    setIsDeletingWs(true);
    try {
      await workspaceService.deleteWorkspace(wsToDelete);
      const remaining = workspaces.filter(w => w.id !== wsToDelete);
      setWorkspaces(remaining);
      if (activeWorkspaceId === wsToDelete) {
        setActiveWorkspaceId(remaining.length > 0 ? remaining[0].id : null);
      }
      setWsToDelete(null);
    } catch (err) {
      alert('Failed to delete workspace.');
    } finally {
      setIsDeletingWs(false);
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
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          handleUpload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* Active workspace selector */}
      <section className="dash-card dash-reveal p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-50">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
            <Layers className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Active workspace</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <Menu as="div" className="relative inline-block text-left z-20">
                <div>
                  <Menu.Button className="inline-flex items-center justify-between w-full max-w-[280px] sm:w-[280px] gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50">
                    <span className="truncate">
                      {activeWorkspace ? activeWorkspace.name : 'No workspaces yet'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-[280px] origin-top-left rounded-xl bg-white border border-slate-200 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="p-1.5 max-h-[300px] overflow-y-auto">
                      {workspaces.map((ws) => (
                        <div key={ws.id} className="flex items-center justify-between group relative px-1 py-1">
                          <Menu.Item as={Fragment}>
                            {({ active }) => (
                              <button
                                onClick={() => setActiveWorkspaceId(ws.id)}
                                className={`flex items-center w-full px-2.5 py-2 text-[13px] rounded-lg transition-colors ${
                                  active ? 'bg-[#EEF5FF] text-[#2563EB]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span className="flex-1 text-left truncate">{ws.name}</span>
                                {activeWorkspaceId === ws.id && (
                                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2 mr-6" />
                                )}
                              </button>
                            )}
                          </Menu.Item>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setWsToDelete(ws.id);
                            }}
                            className="absolute right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Delete Workspace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {workspaces.length === 0 && (
                        <div className="px-3 py-2 text-[13px] text-slate-500 text-center">
                          No workspaces found
                        </div>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              <span className="app-meta truncate max-w-sm hidden sm:inline-block">
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
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <div className="dash-card w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="dash-card-title">Uploading filing</h3>
              <p className="dash-card-sub">Please wait while the document is uploaded and indexed.</p>
            </div>
            <div className="pt-2">
              <p className="text-[12.5px] font-semibold text-slate-700 mb-2">Progress… {uploading}%</p>
              <div className="app-bar">
                <span style={{ width: `${uploading}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ResearchChat workspaceId={activeWorkspace?.id} documentId={activeDocumentId} onCitations={setCitations} />
        </div>

        <div className="space-y-4">


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
                documents.map((doc) => {
                  const isActive = activeDocumentId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocumentId(isActive ? null : doc.id)}
                      className={`dash-row cursor-pointer transition-colors ${isActive ? 'bg-[#EEF5FF] border border-[#2563EB]/20' : 'hover:bg-slate-50'}`}
                    >
                      <span className="dash-row-icon shrink-0" style={{ background: isActive ? '#2563EB' : '#EEF5FF', color: isActive ? '#FFF' : '#2563EB' }}>
                        <FileText className="w-[17px] h-[17px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[13px] font-semibold truncate ${isActive ? 'text-[#2563EB]' : 'text-slate-700'}`}>{doc.title}</span>
                        <span className="block app-meta truncate">
                          {doc.company_name} • {timeAgo(doc.uploaded_at || doc.created_at)}
                        </span>
                      </span>
                      <span className={`dash-badge ${statusBadge(doc.status)}`}>{doc.status || 'Indexed'}</span>
                      <button
                        type="button"
                        className="app-act app-act-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc.id);
                        }}
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
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

      {docToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <div className="dash-card w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="dash-card-title text-red-600">Delete document?</h3>
              <p className="dash-card-sub mt-2 leading-relaxed">
                Remove this document from the workspace index?
              </p>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setDocToDelete(null)} disabled={isDeletingDoc}>
                Cancel
              </button>
              <button type="button" className="dash-btn dash-btn-primary !bg-red-600 hover:!bg-red-700 !border-red-600" onClick={confirmDeleteDoc} disabled={isDeletingDoc}>
                {isDeletingDoc ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {wsToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <div className="dash-card w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="dash-card-title text-red-600">Delete workspace?</h3>
              <p className="dash-card-sub mt-2 leading-relaxed">
                Are you sure you want to delete this workspace and all its documents?
              </p>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setWsToDelete(null)} disabled={isDeletingWs}>
                Cancel
              </button>
              <button type="button" className="dash-btn dash-btn-primary !bg-red-600 hover:!bg-red-700 !border-red-600" onClick={confirmDeleteWs} disabled={isDeletingWs}>
                {isDeletingWs ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
