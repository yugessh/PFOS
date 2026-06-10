import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const PATTERNS = [
  { key: 'mockData', regex: /mockData/i, severity: 'warning', reason: 'Possible mock data present' },
  { key: 'fakeData', regex: /fakeData/i, severity: 'warning' },
  { key: 'sampleData', regex: /sampleData/i, severity: 'warning' },
  { key: 'demoData', regex: /demoData|demo@|example.com/i, severity: 'critical' },
  { key: 'seedData', regex: /seedData|seed|SEED_USER/i, severity: 'warning' },
  { key: 'placeholder', regex: /placeholder|TODO:|TBD|FIXME/i, severity: 'info' },
  { key: 'hardcodedChart', regex: /\b(\d{3,}\.?\d*)\b/, severity: 'warning', reason: 'Numeric literal may be hardcoded' },
];

function walk(dir: string, fileList: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // skip node_modules and .next and android
      if (['node_modules', '.next', 'android', 'build', 'dist'].includes(ent.name)) continue;
      walk(full, fileList);
    } else {
      // only scan source files
      if (/\.(ts|tsx|js|jsx|json|html|css|py)$/.test(ent.name)) fileList.push(full);
    }
  }
  return fileList;
}

export async function GET() {
  try {
    const files = walk(ROOT);
    const findings: any[] = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          for (const p of PATTERNS) {
            if (p.regex.test(line)) {
              findings.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), line: i+1, text: line.trim(), pattern: p.key, severity: p.severity, recommendation: p.reason || 'Remove demo/static data or replace with config' });
            }
          }
        }
      } catch (e) {
        // ignore read errors
      }
    }

    return NextResponse.json({ success: true, findings, scanned: files.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
