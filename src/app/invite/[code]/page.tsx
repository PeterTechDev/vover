import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import InviteLanding from "./invite-landing";
import { createServerClient } from "@supabase/ssr";

interface PageProps {
  params: { code: string };
}

async function getInviteData(code: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: invite } = await supabase
    .from("invite_codes")
    .select(`
      code,
      uses,
      user_id,
      owner:profiles!invite_codes_user_id_fkey(id, name, avatar_url)
    `)
    .eq("code", code)
    .maybeSingle();

  if (!invite) return null;

  // Get recent activity of the inviter (last 3 watched)
  const { data: recentActivity } = await supabase
    .from("watched")
    .select("title, poster_path, rating, watched_at")
    .eq("user_id", invite.user_id)
    .order("watched_at", { ascending: false })
    .limit(3);

  return {
    invite,
    recentActivity: recentActivity || [],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getInviteData(params.code);
  if (!data) return { title: "Invalid Invite | Vover" };

  // Type the owner properly
  const owner = data.invite.owner as unknown as { name: string | null } | null;
  const name = owner?.name || "Someone";
  return {
    title: `${name} invited you to Vover`,
    description: `Join ${name} on Vover — the social app for movie and TV recommendations. See what they're watching and share your own taste.`,
  };
}

export default async function InvitePage({ params }: PageProps) {
  const data = await getInviteData(params.code);

  if (!data) {
    notFound();
  }

  // Set cookie so auth callback can process the invite after signup
  const cookieStore = cookies();
  try {
    cookieStore.set("pending_invite_code", params.code, {
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      sameSite: "lax",
    });
  } catch {
    // Can't set cookie from Server Component in some contexts — that's OK
  }

  // Type owner safely
  const rawOwner = data.invite.owner as unknown as { id: string; name: string | null; avatar_url: string | null } | null;

  return (
    <InviteLanding
      code={params.code}
      inviterName={rawOwner?.name || "A friend"}
      inviterId={data.invite.user_id}
      inviterAvatar={rawOwner?.avatar_url || null}
      inviteUses={data.invite.uses}
      recentActivity={data.recentActivity}
    />
  );
}
