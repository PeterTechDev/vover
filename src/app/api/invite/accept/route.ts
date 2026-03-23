import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/invite/accept — accept an invite code for the current user
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { code } = body as { code?: string };

  if (!code) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  // Look up the invite code
  const { data: invite } = await supabase
    .from("invite_codes")
    .select("user_id, uses")
    .eq("code", code)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  if (invite.user_id === user.id) {
    return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });
  }

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(requester_id.eq.${invite.user_id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${invite.user_id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, message: "Already friends" });
  }

  // Create accepted friendship
  const { error: friendError } = await supabase
    .from("friendships")
    .insert({
      requester_id: invite.user_id,
      addressee_id: user.id,
      status: "accepted",
    });

  if (friendError) {
    return NextResponse.json({ error: "Failed to create friendship" }, { status: 500 });
  }

  // Increment uses
  await supabase
    .from("invite_codes")
    .update({ uses: invite.uses + 1 })
    .eq("code", code);

  return NextResponse.json({ success: true, message: "Friendship created" });
}
