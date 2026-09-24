import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { AppState } from '../types';
import { exportDataAsCSV, exportDataAsJSON, exportDataAsTXT, parseImportJSON } from '../utils/export';

interface ExportModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onImportState: (newState: AppState) => void;
  onResetData: () => void;
  onRecordExport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  state,
  isOpen,
  onClose,
  onImportState,
  onResetData,
  onRecordExport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportDataAsJSON(state);
    onRecordExport();
  };

  const handleExportCSV = () => {
    exportDataAsCSV(state);
    onRecordExport();
  };

  const handleExportTXT = () => {
    exportDataAsTXT(state);
    onRecordExport();
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportStatus('Error: Please select a valid JSON backup file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseImportJSON(content);
      if (parsed) {
        if (confirm('Import backup file? This will merge and restore all habits, goals, notes, and records.')) {
          onImportState(parsed);
          setImportStatus('Backup successfully restored!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1200);
        }
      } else {
        setImportStatus('Error: Backup file is corrupt or invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F5D77F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#F5D77F]">
                Data Vault & Persistence
              </h3>
              <p className="text-[11px] text-[#9E9689]">
                100% Offline · Stored Locally on Your Device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
            importStatus.startsWith('Error')
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
          }`}>
            {importStatus}
          </div>
        )}

        {/* 1. Export Data Section */}
        <div className="space-y-3 mb-6">
          <label className="block text-[11px] font-bold text-[#F5D77F] uppercase tracking-wider">
            Export Data Snapshot
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* JSON Export */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-3.5 rounded-2xl bg-[#1C1811] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left transition flex flex-col items-center text-center group active:scale-95"
            >
              <FileJson className="w-6 h-6 text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#EDE8D0]">JSON File</span>
              <span className="text-[9px] text-[#8A8275] mt-0.5">Full restore</span>
            </button>

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-3.5 rounded-2xl bg-[#1C1811] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left transition flex flex-col items-center text-center group active:scale-95"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#EDE8D0]">CSV Sheets</span>
              <span className="text-[9px] text-[#8A8275] mt-0.5">Table format</span>
            </button>

            {/* TXT Export */}
            <button
              type="button"
              onClick={handleExportTXT}
              className="p-3.5 rounded-2xl bg-[#1C1811] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left transition flex flex-col items-center text-center group active:scale-95"
            >
              <FileText className="w-6 h-6 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#EDE8D0]">Text Dossier</span>
              <span className="text-[9px] text-[#8A8275] mt-0.5">Readable log</span>
            </button>
          </div>
        </div>

        {/* 2. Import Data Section */}
        <div className="space-y-3 mb-6">
          <label className="block text-[11px] font-bold text-[#F5D77F] uppercase tracking-wider">
            Restore Backup Snapshot (.JSON)
          </label>

          {/* Drag & Drop area + File picker */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              dragOver
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-[#D4AF37]/30 bg-[#1A1712] hover:border-[#D4AF37]/60'
            }`}
          >
            <Upload className="w-7 h-7 text-[#D4AF37] mb-2" />
            <p className="text-xs font-semibold text-[#EDE8D0]">
              Click to select or drag & drop backup .json
            </p>
            <p className="text-[10px] text-[#8A8275] mt-1">
              Supports APEX Life OS exported backups
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 3. Reset / Clear Vault Section */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset & Wipe Vault Data
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                Are you absolutely sure? All habits, goals, and XP will reset!
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                >
                  Yes, Wipe Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
