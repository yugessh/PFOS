"use client";

import { useState, useMemo } from 'react';
import { FileDown, FileSpreadsheet, FileText, Printer, CheckSquare } from 'lucide-react';
import { type SubscriptionModel } from '@/src/services/firestore/subscriptions.service';
import { formatCurrency } from '@/src/lib/currency';
import * as XLSX from 'xlsx';

interface SubscriptionReportsProps {
  subscriptions: SubscriptionModel[];
  optimizationRecommendations: any[];
}

export function SubscriptionReports({ subscriptions, optimizationRecommendations }: SubscriptionReportsProps) {
  const [selectedReport, setSelectedReport] = useState<'list' | 'recurring' | 'savings' | 'annual'>('list');

  // Format data for export
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'list':
        // Active & general subscriptions
        return subscriptions.map(s => ({
          Name: s.name,
          Category: s.category,
          Amount: s.amount,
          Frequency: s.frequency,
          Status: s.status,
          'Next Renewal': s.nextRenewalDate,
          'Payment Method': s.paymentMethod,
          'Auto Renew': s.autoRenew ? 'Yes' : 'No',
          'Usage Frequency': s.usageFrequency
        }));
      case 'recurring':
        // Only active/paused recurring expenses
        return subscriptions
          .filter(s => s.status !== 'cancelled')
          .map(s => ({
            Name: s.name,
            Category: s.category,
            Amount: s.amount,
            Frequency: s.frequency,
            'Billing Cycle Start': s.billingCycleStart,
            'Payment Method': s.paymentMethod
          }));
      case 'savings':
        // Optimization opportunities
        return optimizationRecommendations.map(rec => ({
          Subscription: rec.subscriptionName,
          Category: rec.category,
          Type: rec.type.replace('_', ' ').toUpperCase(),
          Description: rec.description,
          'Potential Monthly Savings': rec.potentialSavings
        }));
      case 'annual':
        // Annual projected burden
        return subscriptions
          .filter(s => s.status === 'active')
          .map(s => {
            let annualCost = s.amount;
            if (s.frequency === 'monthly') annualCost = s.amount * 12;
            else if (s.frequency === 'weekly') annualCost = s.amount * 52;
            return {
              Name: s.name,
              Category: s.category,
              'Current Amount': s.amount,
              Frequency: s.frequency,
              'Projected Annual Cost': annualCost
            };
          });
    }
  }, [selectedReport, subscriptions, optimizationRecommendations]);

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]);
    const csvRows = [headers.join(',')];

    reportData.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + (row as any)[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PFOS_${selectedReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    XLSX.writeFile(workbook, `PFOS_${selectedReport}_report.xlsx`);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reportData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `PFOS_${selectedReport}_report.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card-surface p-5 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Generate Reports</h3>
          <p className="text-xs text-secondary">Export cost analysis, active subscriptions or optimization results.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: 'list', title: 'Subscription Report', desc: 'Complete list of tracked services' },
          { key: 'recurring', title: 'Recurring Cost Report', desc: 'Active recurring expenses summary' },
          { key: 'savings', title: 'Savings Opportunity', desc: 'Identified overlapping/unused services' },
          { key: 'annual', title: 'Annual Cost Summary', desc: 'Projected annual cost projections' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setSelectedReport(item.key as any)}
            className={`rounded-[24px] border p-4 text-left transition flex flex-col justify-between ${selectedReport === item.key ? 'border-accent-mint bg-accent-mint/5' : 'border-white/5 bg-[#0C1319] hover:bg-white/5'}`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`rounded-full p-2 ${selectedReport === item.key ? 'bg-accent-mint text-[#071a0d]' : 'bg-white/5 text-secondary'}`}>
                <CheckSquare className="size-4" />
              </span>
            </div>
            <div className="mt-4">
              <h4 className={`text-sm font-semibold ${selectedReport === item.key ? 'text-accent-mint' : 'text-white'}`}>{item.title}</h4>
              <p className="text-[11px] text-secondary mt-1">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Preview Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Report Preview ({reportData.length} records)</h4>
        <div className="overflow-x-auto rounded-[20px] border border-white/5 bg-[#0C1319]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 text-secondary">
                {reportData.length > 0 &&
                  Object.keys(reportData[0]).map(header => (
                    <th key={header} className="p-3 font-semibold uppercase tracking-wider">{header}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-secondary" colSpan={5}>No records found for this report type.</td>
                </tr>
              ) : (
                reportData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="p-3 text-white truncate max-w-[200px]">
                        {typeof val === 'number' && !isNaN(val) && val > 100 ? formatCurrency(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
              {reportData.length > 5 && (
                <tr className="border-t border-white/5 bg-white/5 text-center text-secondary">
                  <td className="p-2" colSpan={Object.keys(reportData[0]).length}>
                    Showing first 5 preview rows. Export to see full details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5">
        <button onClick={handleExportCSV} className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2.5 text-xs text-white transition font-medium">
          <FileText className="size-4 text-orange-400" /> Export CSV
        </button>
        <button onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2.5 text-xs text-white transition font-medium">
          <FileSpreadsheet className="size-4 text-green-400" /> Export Excel
        </button>
        <button onClick={handleExportJSON} className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2.5 text-xs text-white transition font-medium">
          <FileDown className="size-4 text-blue-400" /> Export JSON
        </button>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2.5 text-xs text-white transition font-medium sm:ml-auto">
          <Printer className="size-4 text-accent-mint" /> Print Report
        </button>
      </div>
    </div>
  );
}
