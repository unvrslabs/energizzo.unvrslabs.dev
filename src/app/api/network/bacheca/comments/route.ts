import { NextResponse, type NextRequest } from "next/server";
import { getNetworkMember } from "@/lib/network/session";
import { listComments } from "@/lib/network/bacheca";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const member = await getNetworkMember();
  if (!member) return new NextResponse("Unauthorized", { status: 401 });

  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId)
    return NextResponse.json({ error: "postId required" }, { status: 400 });

  const items = await listComments(postId);
  return NextResponse.json({ items });
}
