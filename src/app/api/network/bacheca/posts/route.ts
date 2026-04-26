import { NextResponse } from "next/server";
import { getNetworkMember } from "@/lib/network/session";
import { listPosts } from "@/lib/network/bacheca";

export const dynamic = "force-dynamic";

export async function GET() {
  const member = await getNetworkMember();
  if (!member) return new NextResponse("Unauthorized", { status: 401 });
  const items = await listPosts(member.id);
  return NextResponse.json({ items });
}
