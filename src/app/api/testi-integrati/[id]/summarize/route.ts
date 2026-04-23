import { NextResponse, type NextRequest } from "next/server";
import { getAdminMember } from "@/lib/admin/session";
import { getNetworkMember } from "@/lib/network/session";
import {
  generateTestoIntegratoSummary,
  recordTiSummaryError,
} from "@/actions/testi-integrati-summary";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [admin, member] = await Promise.all([
    getAdminMember(),
    getNetworkMember(),
  ]);
  if (!admin && !member) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tiId = Number(id);
  if (!Number.isFinite(tiId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  try {
    const result = await generateTestoIntegratoSummary(tiId);
    return NextResponse.json({ ok: true, result, cached: result.cached });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "summarize failed";
    console.error(`ti summarize ${tiId} failed:`, err);
    try {
      await recordTiSummaryError(tiId, msg);
    } catch (recordErr) {
      console.error(`recordTiSummaryError ${tiId} also failed:`, recordErr);
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
