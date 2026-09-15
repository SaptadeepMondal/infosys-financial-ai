import React, { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { documentService } from '../services/documentService';
import { workspaceService } from '../services/workspaceService';
import { PageHead, CardHead, Empty, ErrorBanner, formatDate, statusBadge } from '../components/app/ui';
import { FileText, Upload, Search, Trash2, RefreshCw, AlertTriangle, Building2, Layers, ChevronDown, Check } from 'lucide-react';
import './dashboard.css';
import './app-pages.css';

const FILTERS = ['All', 'Indexed', 'Processing', 'Failed'];

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(0);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(() => {
    return localStorage.getItem('activeWorkspaceId') || 'all';
  });
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setDocuments(await documentService.getDocuments());
    } catch (err) {
      setError('Document library is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    workspaceService
      .getWorkspaces()
      .then((list) => {
        setWorkspaces(list || []);
      })
      .catch(() => {});
  }, []);

  const handleUpload = async (file) => {
    let targetWsId = workspaceId;
    if (workspaceId === 'all') {
      if (workspaces.length === 0) {
        alert('Create a research workspace first.');
        return;
      }
      targetWsId = workspaces[0].id;
    }

    if (!file || !targetWsId) return;
    
    setUploading(1);
    try {
      if (!file.name?.toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF filing.');
        return;
      }
      const companyName = file.name ? (file.name.split('.').slice(0, -1).join('.') || file.name) : 'Infosys Limited';
      // Capitalize first letter
      const formattedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      
      await documentService.uploadDocument(file, targetWsId, formattedName, 'Annual Report', 2024, (p) =>
        setUploading(Math.max(1, p))
      );
      await load();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(0);
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(docToDelete);
      await load();
      setDocToDelete(null);
    } catch (err) {
      alert('Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      const status = String(d.status || 'indexed').toLowerCase();
      const matchFilter =
        filter === 'All' ||
        (filter === 'Indexed' && (status.includes('index') || status.includes('complete') || status.includes('ready'))) ||
        (filter === 'Processing' && (status.includes('process') || status.includes('pending') || status.includes('queue'))) ||
        (filter === 'Failed' && (status.includes('fail') || status.includes('error')));
      const matchQuery =
        !q ||
        [d.title, d.company_name, d.filing_type, d.fiscal_year].join(' ').toLowerCase().includes(q);
      const matchWorkspace = workspaceId === 'all' || d.workspace_id === workspaceId;
      return matchFilter && matchQuery && matchWorkspace;
    });
  }, [documents, filter, query, workspaceId]);



  return (
    <main className="dash-body">
      <PageHead
        eyebrow="Document library"
        title="Financial Documents"
        subtitle="Manage indexed filings and financial documents used by the research agents."
        actions={
          <>
            <button type="button" className="dash-btn dash-btn-ghost" onClick={load}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button type="button" className="dash-btn dash-btn-primary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Upload Filing
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

      <ErrorBanner>
        {error && (
          <>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </>
        )}
      </ErrorBanner>

      <section className="dash-card dash-reveal p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-50">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <span className="dash-row-icon" style={{ background: '#F2EEFF', color: '#6D4AFF' }}>
            <Layers className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace Filter</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <Menu as="div" className="relative inline-block text-left z-20">
                <div>
                  <Menu.Button className="inline-flex items-center justify-between w-full max-w-[280px] sm:w-[280px] gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50">
                    <span className="truncate">
                      {workspaceId === 'all' 
                        ? 'All Workspaces' 
                        : workspaces.find(w => w.id === workspaceId)?.name || 'Select Workspace'}
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
                      <Menu.Item as={Fragment}>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setWorkspaceId('all');
                            }}
                            className={`flex items-center w-full px-2.5 py-2 text-[13px] rounded-lg transition-colors ${
                              active ? 'bg-[#EEF5FF] text-[#2563EB]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="flex-1 text-left truncate">All Workspaces</span>
                            {workspaceId === 'all' && (
                              <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2 mr-6" />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                      {workspaces.map((ws) => (
                        <Menu.Item as={Fragment} key={ws.id}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setWorkspaceId(ws.id);
                                localStorage.setItem('activeWorkspaceId', ws.id);
                              }}
                              className={`flex items-center w-full px-2.5 py-2 text-[13px] rounded-lg transition-colors ${
                                active ? 'bg-[#EEF5FF] text-[#2563EB]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span className="flex-1 text-left truncate">{ws.name}</span>
                              {workspaceId === ws.id && (
                                <Check className="w-4 h-4 text-[#2563EB] shrink-0 ml-2 mr-6" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <span className="app-meta truncate max-w-sm hidden sm:inline-block">
                {workspaceId === 'all' 
                  ? 'Viewing all indexed documents across workspaces.' 
                  : 'Viewing documents for selected workspace.'}
              </span>
            </div>
          </div>
        </div>
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

      <article className="dash-card dash-reveal">
        <CardHead
          title="All Documents"
          subtitle="Filings available to the research agents"
          right={
            <div className="app-seg">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`app-seg-item ${filter === f ? 'is-active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        />

        <div className="px-4 pt-4">
          <label className="app-search">
            <Search className="w-4 h-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, companies or filing types…"
            />
          </label>
        </div>

        <div className="p-4">
          {loading && !documents.length ? (
            <div className="space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="dash-skel h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty
              Icon={FileText}
              title={documents.length ? 'No documents match this filter' : 'No documents indexed yet'}
              description={
                documents.length
                  ? 'Try a different filter or clear your search to see the full library.'
                  : 'Upload a filing and the Document Agent will parse, chunk and index it for research.'
              }
              actionLabel={documents.length ? undefined : 'Upload Filing'}
              onAction={() => fileRef.current?.click()}
            />
          ) : (
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Uploaded</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="dash-row-icon" style={{ background: '#EEF5FF', color: '#2563EB' }}>
                            <FileText className="w-[17px] h-[17px]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-slate-800 truncate max-w-[280px]">
                              {doc.title}
                            </span>
                            <span className="block app-meta">
                              {doc.chunks_count ? `${doc.chunks_count} chunks` : 'Awaiting indexing'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{doc.company_name || '—'}</td>
                      <td className="whitespace-nowrap">
                        {doc.filing_type || '—'}
                        {doc.fiscal_year ? ` · FY${String(doc.fiscal_year).slice(-2)}` : ''}
                      </td>
                      <td className="whitespace-nowrap">{formatDate(doc.uploaded_at || doc.created_at)}</td>
                      <td>
                        <span className={`dash-badge ${statusBadge(doc.status)}`}>{doc.status || 'Indexed'}</span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="app-act app-act-danger"
                          onClick={() => setDocToDelete(doc.id)}
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </article>

      {docToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <div className="dash-card w-full max-w-sm p-6 space-y-4">
            <div>
              <h3 className="dash-card-title text-red-600">Delete document?</h3>
              <p className="dash-card-sub mt-2 leading-relaxed">
                This will remove the document from the index. The research agents will no longer be able to use it.
              </p>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                type="button" 
                className="dash-btn dash-btn-ghost" 
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="dash-btn dash-btn-primary !bg-red-600 hover:!bg-red-700 !border-red-600" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
