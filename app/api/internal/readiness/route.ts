import { NextResponse } from 'next/server';
import ReadinessService from '@/src/services/audit/readiness.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get('uid');
    if (!uid) return NextResponse.json({ success: false, error: 'uid required' }, { status: 400 });
    const res = await ReadinessService.computeReadiness(uid);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
