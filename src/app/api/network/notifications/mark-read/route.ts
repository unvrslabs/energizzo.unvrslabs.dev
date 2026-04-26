import { NextResponse } from "next/server";
import { getNetworkMember } from "@/lib/network/session";
import { markRead } from "@/lib/network/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const member = await getNetworkMember();
  if (!member) return new NextResponse("Unauthorized", { status: 401 });

  let body: { ids?: string[]; all?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const target: string[] | "all" = body.all ? "all" : body.ids ?? [];
  const updated = await markRead(member.id, target);
  return NextResponse.json({ updated });
}
