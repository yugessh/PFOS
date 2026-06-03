export function objectsToCSV(items: Record<string, any>[], filename = 'export.csv') {
  if (!items || items.length === 0) {
    const blob = new Blob([""], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    return;
  }
  const keys = Object.keys(items[0]);
  const lines = [keys.join(',')];
  for (const it of items) {
    const row = keys.map((k) => {
      const v = it[k] ?? '';
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      // escape quotes
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(',');
    lines.push(row);
  }
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
