import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { documentService } from '../../services/documentService';

export const UploadPanel = ({ workspaceId, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState('Infosys Limited');
  const [filingType, setFilingType] = useState('Annual Report (20-F)');
  const [fiscalYear, setFiscalYear] = useState(2024);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !workspaceId) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      await documentService.uploadDocument(
        file,
        workspaceId,
        companyName,
        filingType,
        fiscalYear,
        (percent) => setProgress(percent)
      );
      setFile(null);
      setProgress(100);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Document ingestion and embedding failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 shadow-lg">
      <h3 className="font-semibold text-slate-100 text-sm mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4 text-emerald-400" />
        <span>Ingest & Index Financial Document</span>
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Document Agent will automatically parse, chunk, and index embeddings into the vector database.
      </p>

      {error && (
        <div className="mb-4 bg-rose-500/15 border border-rose-500/40 text-rose-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-white/10 hover:border-slate-600 bg-[#070B16]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-xs">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for ingestion</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">
                Drag and drop PDF/DOCX annual report, or <span className="text-emerald-400">browse file</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Supports Form 10-K, 20-F, Q4 Transcript (.pdf, .txt)
              </p>
            </div>
          )}
        </div>

        {/* Filing Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full glass-inset text-slate-200 text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Filing Type</label>
            <select
              value={filingType}
              onChange={(e) => setFilingType(e.target.value)}
              className="w-full glass-inset text-slate-200 text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            >
              <option value="Annual Report (20-F)">Annual Report (20-F)</option>
              <option value="Form 10-K">Form 10-K</option>
              <option value="Earnings Transcript">Earnings Transcript</option>
              <option value="Form 10-Q">Form 10-Q</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Fiscal Year</label>
            <input
              type="number"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              className="w-full glass-inset text-slate-200 text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 font-mono"
            />
          </div>
        </div>

        {uploading && (
          <div className="w-full bg-[#070B16] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!file}
            loading={uploading}
          >
            Index Document to Vector DB
          </Button>
        </div>
      </form>
    </div>
  );
};
