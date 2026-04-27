import { NextResponse, type NextRequest } from "next/server";
import { getNetworkMemberFromRequest } from "@/lib/network/session";
import { maskPhone } from "@/lib/network/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const member = await getNetworkMemberFromRequest(req);
  if (!member) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    member: {
      id: member.id,
      ragione_sociale: member.ragione_sociale,
      piva: member.piva,
      referente: member.referente,
      phone_masked: maskPhone(member.phone),
      approved_at: member.approved_at,
    },
  });
}
