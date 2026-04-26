import { NextResponse } from "next/server";
import { getNetworkMember } from "@/lib/network/session";
import { listNotifications, countUnread } from "@/lib/network/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const member = await getNetworkMember();
  if (!member) return new NextResponse("Unauthorized", { status: 401 });

  const [items, unread] = await Promise.all([
    listNotifications(member.id),
    countUnread(member.id),
  ]);

  return NextResponse.json({ items, unread });
}
