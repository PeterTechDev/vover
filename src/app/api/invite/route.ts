import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateInviteCode, getInviteStats } from "@/lib/db";

// GET /api/invite — get or create invite code for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, error } = await getOrCreateInviteCode(session.user.id);
  if (error || !code) {
    return NextResponse.json({ error: "Failed to generate invite code" }, { status: 500 });
  }

  const { data: stats } = await getInviteStats(session.user.id);
  return NextResponse.json({ code, uses: (stats as { uses?: number } | null)?.uses ?? 0 });
}
