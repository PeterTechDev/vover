import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInviteByCode, acceptInviteAndFriend } from "@/lib/db";

// POST /api/invite/accept — accept an invite code for the current user
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { code } = body as { code?: string };

  if (!code) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  const { data: invite, error } = await getInviteByCode(code);
  if (error || !invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inviteData = invite as any;
  if (inviteData.user_id === session.user.id) {
    return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });
  }

  const { error: friendError } = await acceptInviteAndFriend(inviteData.user_id, session.user.id);
  if (friendError) {
    return NextResponse.json({ error: "Failed to create friendship" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Friendship created" });
}
