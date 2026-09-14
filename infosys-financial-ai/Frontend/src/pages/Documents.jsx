import React, { useEffect, useMemo, useRef, useState } from 'react';
import { documentService } from '../services/documentService';
import { workspaceService } from '../services/workspaceService';
import { PageHead, CardHead, Empty, ErrorBanner, formatDate, statusBadge } from '../components/app/ui';
import { FileText, Upload, Search, Trash2, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
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
  const [workspaceId, setWorkspaceId] = useState(null);
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
      .then((list) => list?.length && setWorkspaceId(list[0].id))
      .catch(() => {});
  }, []);

  const handleUpload = async (file) => {
    if (!file || !workspaceId) {
      if (!workspaceId) alert('Create a research workspace first.');
      return;
    }
    setUploading(1);
    try {
      await documentService.uploadDocument(file, workspaceId, 'Infosys Limited', 'Annual Report', 2024, (p) =>
        setUploading(Math.max(1, p))
      );
      await load();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from the index?')) return;
    try {
      await documentService.deleteDocument(id);
      await load();
    } catch (err) {
      alert('Delete failed.');
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
      return matchFilter && matchQuery;
    });
  }, [documents, filter, query]);

  const counts = useMemo(
    () => ({
      total: documents.length,
      companies: new Set(documents.map((d) => d.company_name).filter(Boolean)).size,
    }),
    [documents]
  );

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

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Documents Indexed', value: counts.total, Icon: FileText, tint: '#2563EB', bg: '#EEF5FF' },
          { label: 'Companies Covered', value: counts.companies, Icon: Building2, tint: '#6D4AFF', bg: '#F2EEFF' },
          { label: 'Matching Filter', value: filtered.length, Icon: Search, tint: '#3155E7', bg: '#EEF4FF' },
          {
            label: 'Storage Used',
            value: documents.length
              ? `${(documents.reduce((s, d) => s + (d.file_size || 0), 0) / 1048576).toFixed(1)} MB`
              : '—',
            Icon: Upload,
            tint: '#1D7A5F',
            bg: '#E8F7F1',
          },
        ].map((k, i) => (
          <article key={k.label} className="dash-card dash-card-hover dash-kpi dash-reveal" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <span className="dash-kpi-label">{k.label}</span>
              <span className="dash-kpi-icon" style={{ background: k.bg, color: k.tint }}>
                <k.Icon className="w-[18px] h-[18px]" />
              </span>
            </div>
            <div className="mt-5">
              {loading && !documents.length ? (
                <span className="dash-skel block h-8 w-20" />
              ) : (
                <span className="dash-kpi-value">{k.value}</span>
              )}
            </div>
          </article>
        ))}
      </section>

      {uploading > 0 && (
        <div className="dash-card dash-reveal p-4">
          <p className="text-[12.5px] font-semibold text-slate-700 mb-2">Uploading… {uploading}%</p>
          <div className="app-bar">
            <span style={{ width: `${uploading}%` }} />
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
                          onClick={() => handleDelete(doc.id)}
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
    </main>
  );
};
