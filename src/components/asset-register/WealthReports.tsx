"use client";

import React from 'react';
import { objectsToCSV } from '@/src/lib/export';

export default function WealthReports({ assets, liabilities }: { assets: any[]; liabilities: any[] }) {
  return (
    <div className="p-4 rounded-[28px] bg-[#151A20] text-white">
      <h2 className="text-lg font-medium">Reports</h2>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <button onClick={() => objectsToCSV(assets, 'assets.csv')} className="px-3 py-2 bg-[#7EE7C7] text-black rounded">Export Assets (CSV)</button>
        <button onClick={() => objectsToCSV(liabilities, 'liabilities.csv')} className="px-3 py-2 bg-[#7EE7C7] text-black rounded">Export Liabilities (CSV)</button>
        <button onClick={() => alert('PDF export coming soon')} className="px-3 py-2 bg-[#7EE7C7] text-black rounded">Export PDF (stub)</button>
      </div>
    </div>
  );
}
