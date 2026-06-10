import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content || '';
    const outDir = path.join(ROOT, 'audit');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const filePath = path.join(outDir, 'production-readiness.md');
    fs.writeFileSync(filePath, content, 'utf8');
    return NextResponse.json({ success: true, path: path.relative(ROOT, filePath).replace(/\\/g, '/') });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
