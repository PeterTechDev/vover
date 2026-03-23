import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import InviteLanding from "./invite-landing";
import { db } from "@/db";
import { watched } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface PageProps {
  params: { code: string };
}

async function getInviteData(code: string) {
  try {
    const result = await db.execute(sql`
      SELECT ic.code, ic.uses, ic.user_id,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS owner
      FROM invite_codes ic
      JOIN profiles p ON p.id = ic.user_id
      WHERE ic.code = ${code}
    `);

    const invite = result.rows[0] as {
      code: string;
      uses: number;
      user_id: string;
      owner: { id: string; name: string | null; avatar_url: string | null };
    } | undefined;

    if (!invite) return null;

    const recentResult = await db
      .select({ title: watched.title, poster_path: watched.posterPath, rating: watched.rating, watched_at: watched.watchedAt })
      .from(watched)
      .where(eq(watched.userId, invite.user_id))
      .orderBy(sql`${watched.watchedAt} DESC`)
      .limit(3);

    return {
      invite,
      recentActivity: recentResult.map((r) => ({
        title: r.title,
        poster_path: r.poster_path,
        rating: r.rating,
        watched_at: r.watched_at.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getInviteData(params.code);
  if (!data) return { title: "Invalid Invite | Vover" };
  const name = data.invite.owner?.name || "Someone";
  return {
    title: `${name} invited you to Vover`,
    description: `Join ${name} on Vover — the social app for movie and TV recommendations.`,
  };
}

export default async function InvitePage({ params }: PageProps) {
  const data = await getInviteData(params.code);
  if (!data) notFound();

  const cookieStore = cookies();
  try {
    cookieStore.set("pending_invite_code", params.code, {
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });
  } catch {
    // Can't set cookie in some server contexts
  }

  return (
    <InviteLanding
      code={params.code}
      inviterName={data.invite.owner?.name || "A friend"}
      inviterId={data.invite.user_id}
      inviterAvatar={data.invite.owner?.avatar_url || null}
      inviteUses={data.invite.uses}
      recentActivity={data.recentActivity}
    />
  );
}
