import { NextResponse } from "next/server";
import { getAdminMember } from "@/lib/admin/session";
import { syncDelibereFromApi } from "@/actions/delibere-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  const admin = await getAdminMember();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncDelibereFromApi();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("delibere sync failed:", err);
    const message = err instanceof Error ? err.message : "sync failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
