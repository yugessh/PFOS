'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useBackupRestore } from '@/src/hooks/useBackupRestore';
import {
  Download,
  Upload,
  FileJson,
  FileText,
  Calendar,
  HardDrive,
  Package,
} from 'lucide-react';

export function DataManagement() {
  const {
    isLoading,
    error,
    backupMetadata,
    loadBackupMetadata,
    exportAsJSON,
    exportAsCSV,
    importFromBackup,
  } = useBackupRestore();

  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);

  useEffect(() => {
    loadBackupMetadata();
  }, [loadBackupMetadata]);

  const handleExportJSON = async () => {
    const backup = await exportAsJSON();
    if (backup) {
      const dataStr = JSON.stringify(backup, null, 2);
      downloadFile(dataStr, 'pfos-backup.json', 'application/json');
    }
  };

  const handleExportCSV = async () => {
    const csv = await exportAsCSV();
    if (csv) {
      downloadFile(csv, 'pfos-transactions.csv', 'text/csv');
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const success = await importFromBackup(data);
      if (success) {
        setShowRestoreOptions(false);
      }
    } catch (err) {
      console.error('Failed to parse backup file:', err);
    }
  };

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-border bg-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
          <p className="mt-1 text-sm text-secondary">
            Export and import your financial data
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Backup Information */}
        {backupMetadata && (
          <div className="mb-6 rounded-xl border border-border bg-card-elevated p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Last Backup</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="size-4 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-secondary">Backup Date</p>
                  <p className="text-foreground">{formatDate(backupMetadata.backupDate)}</p>
                </div>
              </div>
              {backupMetadata.lastRestoreDate && (
                <div className="flex items-start gap-2">
                  <Upload className="size-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary">Last Restore</p>
                    <p className="text-foreground">
                      {formatDate(backupMetadata.lastRestoreDate)}
                    </p>
                  </div>
                </div>
              )}
              {backupMetadata.dataSize && (
                <div className="flex items-start gap-2">
                  <HardDrive className="size-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary">Data Size</p>
                    <p className="text-foreground">{formatBytes(backupMetadata.dataSize)}</p>
                  </div>
                </div>
              )}
              {backupMetadata.itemCount && (
                <div className="flex items-start gap-2">
                  <Package className="size-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary">Items Count</p>
                    <p className="text-foreground">{backupMetadata.itemCount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Section */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Export Data</h4>
          {!showExportOptions ? (
            <Button
              onClick={() => setShowExportOptions(true)}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-accent-mint text-[#071a0d] font-semibold hover:brightness-95 transition-all"
            >
              <Download className="size-4 mr-2" />
              Export My Data
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleExportJSON}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
              >
                <FileJson className="size-4 mr-2" />
                {isLoading ? 'Exporting...' : 'Export as JSON'}
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all"
              >
                <FileText className="size-4 mr-2" />
                {isLoading ? 'Exporting...' : 'Export Transactions as CSV'}
              </Button>
              <Button
                onClick={() => setShowExportOptions(false)}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Import Data</h4>
          {!showRestoreOptions ? (
            <Button
              onClick={() => setShowRestoreOptions(true)}
              disabled={isLoading}
              className="w-full h-12 rounded-xl border border-border bg-card hover:bg-card-elevated text-foreground font-semibold transition-all"
            >
              <Upload className="size-4 mr-2" />
              Restore Backup
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload backup file"
                />
                <Button
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all relative"
                >
                  <Upload className="size-4 mr-2" />
                  {isLoading ? 'Importing...' : 'Choose Backup File'}
                </Button>
              </div>
              <p className="text-xs text-secondary text-center">
                Select a JSON backup file to restore
              </p>
              <Button
                onClick={() => setShowRestoreOptions(false)}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mt-6 rounded-xl bg-amber-900/20 p-3 text-xs text-amber-300">
          <p>
            ⚠️ <strong>Note:</strong> All exports contain user-specific data only. Backups can only be
            restored to the same account.
          </p>
        </div>
      </div>
    </div>
  );
}
