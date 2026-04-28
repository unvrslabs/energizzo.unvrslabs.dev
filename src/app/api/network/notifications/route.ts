import { NextResponse, type NextRequest } from "next/server";
import { getNetworkMember, getNetworkMemberFromRequest } from "@/lib/network/session";
import { listNotifications, countUnread } from "@/lib/network/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Auth: cookie (web) OR Bearer (mobile)
  const [memberCookie, memberBearer] = await Promise.all([
    getNetworkMember(),
    getNetworkMemberFromRequest(req),
  ]);
  const member = memberBearer ?? memberCookie;
  if (!member) return new NextResponse("Unauthorized", { status: 401 });

  const [items, unread] = await Promise.all([
    listNotifications(member.id),
    countUnread(member.id),
  ]);

  return NextResponse.json({ items, unread });
}
