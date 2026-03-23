import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/invite — get or create invite code for the authenticated user
export async function GET() {
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

  // Get or create invite code
  const { data: existing } = await supabase
    .from("invite_codes")
    .select("code, uses")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ code: existing.code, uses: existing.uses });
  }

  // Generate unique code
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const { data, error } = await supabase
      .from("invite_codes")
      .insert({ user_id: user.id, code })
      .select("code, uses")
      .single();

    if (!error && data) {
      return NextResponse.json({ code: data.code, uses: data.uses });
    }
  }

  return NextResponse.json({ error: "Failed to generate invite code" }, { status: 500 });
}
