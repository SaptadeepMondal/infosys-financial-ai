import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PageHead, CardHead, Empty, formatDate } from '../components/app/ui';
import {
  FileText,
  Download,
  Sparkles,
  ShieldAlert,
  BarChart2,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import './dashboard.css';
import './app-pages.css';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('Infosys Limited');

  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await reportService.getReports();
      setReports(list);
      if (list.length > 0 && !selectedReport) setSelectedReport(list[0]);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    setGenerating(true);
    try {
      const newRep = await reportService.createReport(titleInput.trim(), 'ws_demo_infy_2024', companyInput);
      setReports((prev) => [newRep, ...prev]);
      setSelectedReport(newRep);
      setShowCreateModal(false);
      setTitleInput('');
    } catch (err) {
      alert('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportMarkdown = async (id, title) => {
    try {
      const markdown = await reportService.exportReport(id);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Report.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export markdown report.');
    }
  };

  return (
    <main className="dash-body">
      <PageHead
        eyebrow="Report agent"
        title="Analyst Reports"
        subtitle="Structured investment summaries with metrics, red flags and peer ratios — each cited to its filing."
        actions={
          <button type="button" className="dash-btn dash-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Sparkles className="w-4 h-4" />
            Generate Report
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4">
          <article className="dash-card dash-reveal">
            <CardHead title="Available Reports" subtitle={`${reports.length} generated`} />
            <div className="p-2.5">
              {loading && reports.length === 0 ? (
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="dash-skel h-14 w-full" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <Empty
                  Icon={FileText}
                  title="No reports generated"
                  description="Run the Report Agent on an indexed filing to produce a cited investment summary."
                  actionLabel="Generate Report"
                  onAction={() => setShowCreateModal(true)}
                />
              ) : (
                reports.map((rep) => {
                  const active = selectedReport?.id === rep.id;
                  return (
                    <button
                      key={rep.id}
                      type="button"
                      onClick={() => setSelectedReport(rep)}
                      className={`dash-row w-full text-left ${active ? 'is-active' : ''}`}
                    >
                      <span
                        className="dash-row-icon"
                        style={{ background: active ? '#EEF4FF' : '#F2EEFF', color: active ? '#2563EB' : '#6D4AFF' }}
                      >
                        <FileCheck className="w-[17px] h-[17px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-slate-800 truncate">{rep.title}</span>
                        <span className="block app-meta truncate">
                          {rep.company_name} • {formatDate(rep.created_at)}
                        </span>
                      </span>
                      <span className="dash-badge badge-ok">{rep.status || 'Ready'}</span>
                    </button>
                  );
                })
              )}
            </div>
          </article>
        </div>

        <div className="xl:col-span-8">
          {selectedReport ? (
            <article className="dash-card dash-reveal">
              <CardHead
                title={selectedReport.title}
                subtitle={`${selectedReport.company_name} • Grounded in source documents`}
                right={
                  <button
                    type="button"
                    className="dash-btn dash-btn-ghost"
                    onClick={() => handleExportMarkdown(selectedReport.id, selectedReport.title)}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                }
              />

              <div className="p-4 space-y-4 text-[13.5px] leading-relaxed text-slate-600">
                <div className="app-block">
                  <h4 className="app-block-title">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    Executive summary
                  </h4>
                  <p className="whitespace-pre-line">
                    {selectedReport.summary ||
                      'The Report Agent has not returned a summary for this report yet. Once the agents finish synthesising the indexed filings, the executive thesis will appear here.'}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="app-block-title px-0.5">
                    <BarChart2 className="w-4 h-4 text-[#6D4AFF]" />
                    Key financial metrics
                  </h4>
                  {selectedReport.metrics && Object.keys(selectedReport.metrics).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(selectedReport.metrics).map(([k, v]) => (
                        <div key={k} className="app-metric">
                          <span>{k}</span>
                          <strong>{String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      Icon={BarChart2}
                      title="No extracted metrics"
                      description="Metrics appear here once the Extraction Agent has parsed the underlying filing."
                    />
                  )}
                </div>

                <div className="space-y-2.5">
                  <h4 className="app-block-title px-0.5">
                    <ShieldAlert className="w-4 h-4 text-[#B4791F]" />
                    Risk analysis
                  </h4>
                  {selectedReport.red_flags && selectedReport.red_flags.length > 0 ? (
                    <div className="app-block app-block-warn space-y-2">
                      {selectedReport.red_flags.map((flag, i) => (
                        <p key={i} className="flex gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#B4791F]" />
                          <span>{typeof flag === 'string' ? flag : flag.description || flag.title}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      Icon={ShieldAlert}
                      title="No red flags recorded"
                      description="The Risk Agent has not flagged any issues for this report."
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-[#EDF2FB] flex flex-wrap items-center justify-between gap-2 app-meta">
                  <span>Report Agent • multi-agent synthesis</span>
                  <span className="inline-flex items-center gap-1.5 text-[#1D7A5F] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Citations verified against source filings
                  </span>
                </div>
              </div>
            </article>
          ) : (
            <article className="dash-card dash-reveal">
              <CardHead title="Report viewer" subtitle="Select a report to inspect" />
              <div className="p-4">
                <Empty
                  Icon={FileCheck}
                  title="No report selected"
                  description="Choose a report from the list, or generate a new analyst report to get started."
                  actionLabel="Generate Report"
                  onAction={() => setShowCreateModal(true)}
                />
              </div>
            </article>
          )}
        </div>
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[#0F172A]/25 backdrop-blur-sm">
          <form onSubmit={handleCreateReport} className="dash-card w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="dash-card-title">Generate analyst report</h3>
              <p className="dash-card-sub">The Report Agent synthesises indexed filings into a cited note.</p>
            </div>

            <div>
              <label className="app-label">Report title</label>
              <input
                className="app-field"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. FY24 Comprehensive Equity Research Note"
                required
              />
            </div>

            <div>
              <label className="app-label">Company name</label>
              <input className="app-field" value={companyInput} onChange={(e) => setCompanyInput(e.target.value)} />
            </div>

            <div className="app-block">
              <p className="text-[12.5px] font-semibold text-slate-700 mb-1">Report agent workflow</p>
              <p className="app-meta leading-relaxed">
                1. Summarize executive performance across indexed filings.
                <br />
                2. Extract operating KPIs and year-over-year deltas.
                <br />
                3. Highlight automated red flags and auditor status.
                <br />
                4. Generate a structured markdown export.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button type="button" className="dash-btn dash-btn-ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="dash-btn dash-btn-primary" disabled={generating}>
                {generating ? 'Synthesizing…' : 'Synthesize report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
