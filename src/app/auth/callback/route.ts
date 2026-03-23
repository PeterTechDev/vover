import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  // Check for invite code cookie (set when visiting /invite/[code])
  const cookieStore = cookies();
  const pendingInviteCode = cookieStore.get("pending_invite_code")?.value;

  if (code) {
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
            } catch {
              // Server Component — can be ignored
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      const userId = session.user.id;

      // Handle pending invite code — create friendship
      if (pendingInviteCode) {
        try {
          // Look up invite code to get inviter
          const { data: invite } = await supabase
            .from("invite_codes")
            .select("user_id, uses")
            .eq("code", pendingInviteCode)
            .maybeSingle();

          if (invite && invite.user_id !== userId) {
            // Create accepted friendship
            await supabase.from("friendships").insert({
              requester_id: invite.user_id,
              addressee_id: userId,
              status: "accepted",
            });
            // Increment invite uses
            await supabase
              .from("invite_codes")
              .update({ uses: invite.uses + 1 })
              .eq("code", pendingInviteCode);
          }
        } catch (err) {
          console.error("Invite acceptance error:", err);
        }

        // Clear the cookie
        try {
          cookieStore.set("pending_invite_code", "", { maxAge: 0 });
        } catch {
          // ignore
        }
      }

      // Check if onboarding is completed
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      } catch {
        // If we can't check (e.g., new user profile not yet created), redirect to onboarding
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
