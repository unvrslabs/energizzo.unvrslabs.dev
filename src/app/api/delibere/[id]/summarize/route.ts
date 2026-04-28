import { NextResponse, type NextRequest } from "next/server";
import { getAdminMember } from "@/lib/admin/session";
import { getNetworkMember, getNetworkMemberFromRequest } from "@/lib/network/session";
import {
  generateDeliberaSummary,
  recordSummaryError,
} from "@/actions/delibere-summary";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth: cookie (web admin/network) OR Bearer (mobile network).
  const [admin, memberCookie, memberBearer] = await Promise.all([
    getAdminMember(),
    getNetworkMember(),
    getNetworkMemberFromRequest(request),
  ]);
  if (!admin && !memberCookie && !memberBearer) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deliberaId = Number(id);
  if (!Number.isFinite(deliberaId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  try {
    const result = await generateDeliberaSummary(deliberaId);
    return NextResponse.json({ ok: true, result, cached: result.cached });
  } catch (err) {
    const message = err instanceof Error ? err.message : "summarize failed";
    console.error(`summarize ${deliberaId} failed:`, err);
    try {
      await recordSummaryError(deliberaId, message);
    } catch (recordErr) {
      console.error(`recordSummaryError ${deliberaId} also failed:`, recordErr);
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
