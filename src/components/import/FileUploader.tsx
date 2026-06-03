'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { detectBankTemplate, BANK_TEMPLATES, type BankTemplateKey } from '@/src/utils/import/BankStatementMapper';

interface FileUploaderProps {
  onDataParsed: (data: {
    fileName: string;
    fileSize: number;
    rows: any[];
    headers: string[];
    detectedTemplate: BankTemplateKey;
    sheets?: string[];
  }) => void;
}

export default function FileUploader({ onDataParsed }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setLoading(true);

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setLoading(false);
          if (results.errors.length > 0 && results.data.length === 0) {
            setError('Failed to parse CSV file. Ensure it is not corrupted.');
            return;
          }
          const headers = results.meta.fields || [];
          const detected = detectBankTemplate(headers);
          onDataParsed({
            fileName: file.name,
            fileSize: file.size,
            rows: results.data,
            headers,
            detectedTemplate: detected,
          });
        },
        error: (err) => {
          setLoading(false);
          setError(`CSV Error: ${err.message}`);
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('Empty file content');
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          
          // Extract headers
          const headers: string[] = [];
          if (jsonData.length > 0) {
            Object.keys(jsonData[0] as object).forEach(key => headers.push(key));
          }

          const detected = detectBankTemplate(headers);
          setLoading(false);
          onDataParsed({
            fileName: file.name,
            fileSize: file.size,
            rows: jsonData,
            headers,
            detectedTemplate: detected,
            sheets: workbook.SheetNames,
          });
        } catch (err: any) {
          setLoading(false);
          setError(`Excel Error: ${err.message || String(err)}`);
        }
      };
      reader.onerror = () => {
        setLoading(false);
        setError('Failed to read Excel file.');
      };
      reader.readAsBinaryString(file);
    } else if (extension === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (!content) throw new Error('Empty file content');
          const parsed = JSON.parse(content as string);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          setLoading(false);
          onDataParsed({
            fileName: file.name,
            fileSize: file.size,
            rows,
            headers,
            detectedTemplate: 'generic',
          });
        } catch (err: any) {
          setLoading(false);
          setError(`JSON Error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      setLoading(false);
      setError('Unsupported file format. Please upload CSV, Excel, or JSON.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[320px] ${
          isDragActive
            ? 'border-accent-mint bg-[rgba(126,231,199,0.06)]'
            : 'border-border bg-card hover:bg-card-elevated hover:border-accent-mint/30 shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileInput}
        />

        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-12 w-12 text-accent-mint animate-spin" />
            <p className="text-sm text-secondary">Parsing statement file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="h-16 w-16 rounded-3xl bg-[rgba(126,231,199,0.06)] border border-accent-mint/10 flex items-center justify-center text-accent-mint shadow-inner">
              <Upload size={28} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Upload statement or ledger</h3>
              <p className="text-sm text-secondary max-w-sm">
                Drag and drop your file here, or click to browse.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-main border border-border text-secondary flex items-center gap-1.5">
                <FileSpreadsheet size={12} className="text-[#4ADE80]" /> CSV
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-main border border-border text-secondary flex items-center gap-1.5">
                <FileSpreadsheet size={12} className="text-[#60A5FA]" /> Excel (.xlsx)
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-main border border-border text-secondary flex items-center gap-1.5">
                <FileSpreadsheet size={12} className="text-[#F1948A]" /> JSON
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-[20px] bg-red-950/20 border border-red-500/20 text-red-400 text-sm shadow-md"
          >
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
