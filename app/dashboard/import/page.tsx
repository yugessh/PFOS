'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, FileSpreadsheet, History, Info, Sparkles, RefreshCw, Upload } from 'lucide-react';
import FileUploader from '@/src/components/import/FileUploader';
import ImportWizard from '@/src/components/import/ImportWizard';
import ImportHistoryList from '@/src/components/import/ImportHistoryList';
import type { BankTemplateKey } from '@/src/utils/import/BankStatementMapper';

export default function ImportHubPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  
  // Parsed file context passed to wizard
  const [parsedFile, setParsedFile] = useState<{
    fileName: string;
    fileSize: number;
    rows: any[];
    headers: string[];
    detectedTemplate: BankTemplateKey;
    sheets?: string[];
  } | null>(null);

  const handleDataParsed = (data: typeof parsedFile) => {
    setParsedFile(data);
  };

  const handleReset = () => {
    setParsedFile(null);
  };

  return (
    <div className="min-h-screen bg-bg-main pb-24 animate-in fade-in duration-300">
      {/* Premium Header */}
      <div className="relative overflow-hidden px-6 py-8 border-b border-border bg-[linear-gradient(180deg,#0e1117_0%,#080a0f_100%)]">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-mint pointer-events-none select-none">
          <Database size={160} />
        </div>
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Upload className="text-accent-mint animate-bounce" size={24} />
            Data Import Hub
          </h1>
          <p className="text-sm text-secondary max-w-xl">
            Ingest external financial logs, parse bank statements, upload spreadsheets, and sync records with the AI financial coach.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-elevated flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="text-xs text-secondary font-medium uppercase tracking-wider">Statement Parsers</div>
              <div className="text-xl font-bold text-foreground">7 Major Indian Banks</div>
              <div className="text-[10px] text-accent-mint font-semibold">SBI, HDFC, ICICI, Axis & more</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[rgba(126,231,199,0.04)] border border-accent-mint/10 flex items-center justify-center text-accent-mint">
              <FileSpreadsheet size={20} />
            </div>
          </div>

          <div className="card-elevated flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="text-xs text-secondary font-medium uppercase tracking-wider">Smart Categorizer</div>
              <div className="text-xl font-bold text-foreground">AI-Style Engine</div>
              <div className="text-[10px] text-accent-mint font-semibold">Auto-detects Type & Categories</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[rgba(126,231,199,0.04)] border border-accent-mint/10 flex items-center justify-center text-accent-mint">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="card-elevated flex items-center justify-between p-6">
            <div className="space-y-1">
              <div className="text-xs text-secondary font-medium uppercase tracking-wider">API Integrations</div>
              <div className="text-xl font-bold text-secondary">Coming Soon</div>
              <div className="text-[10px] text-secondary font-semibold">Direct Plaid & Yodlee feeds</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-border/5 border border-border/20 flex items-center justify-center text-secondary">
              <RefreshCw size={20} />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        {!parsedFile && (
          <div className="flex bg-bg-secondary rounded-[20px] p-1.5 border border-border max-w-[360px] gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-card text-accent-mint shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              <Upload size={14} />
              Upload Ledger
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-card text-accent-mint shadow-sm'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              <History size={14} />
              Import Logs
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === 'upload' ? (
            parsedFile ? (
              <ImportWizard parsedFile={parsedFile} onReset={handleReset} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <FileUploader onDataParsed={handleDataParsed} />
                
                {/* Informational tip */}
                <div className="flex items-start gap-3 p-5 rounded-[24px] border border-border bg-card shadow-sm">
                  <Info className="text-accent-mint mt-0.5 shrink-0" size={16} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-foreground">Statement parsing tips</h4>
                    <p className="text-xs text-secondary leading-relaxed">
                      Statements are processed 100% locally in your browser. We support HDFC, ICICI, SBI, Axis, Kotak, Canara, and Union Bank default export layouts. For other files, select the manual column mapping to align dates, amounts, and descriptions.
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ImportHistoryList />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
