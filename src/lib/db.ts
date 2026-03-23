/**
 * Server-side database queries using Drizzle ORM + Neon.
 * Import this only from Server Components, API routes, and Server Actions.
 * Client components should use @/lib/db-client instead.
 */
import { db } from "@/db";
import {
  watchlist,
  watched,
  friendships,
  profiles,
  recommendations,
  inviteCodes,
  sharedLists,
  sharedListMembers,
  sharedListItems,
} from "@/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function getWatchlist(userId: string) {
  try {
    const data = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getWatchlistWithRecommender(userId: string) {
  try {
    const data = await db
      .select({
        id: watchlist.id,
        userId: watchlist.userId,
        tmdbId: watchlist.tmdbId,
        mediaType: watchlist.mediaType,
        title: watchlist.title,
        posterPath: watchlist.posterPath,
        addedAt: watchlist.addedAt,
        recommendedBy: watchlist.recommendedBy,
        recommender: {
          id: profiles.id,
          name: profiles.name,
        },
      })
      .from(watchlist)
      .leftJoin(profiles, eq(watchlist.recommendedBy, profiles.id))
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addToWatchlist(
  userId: string,
  item: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    recommended_by?: string | null;
  }
) {
  try {
    const [data] = await db
      .insert(watchlist)
      .values({
        userId,
        tmdbId: item.tmdb_id,
        mediaType: item.media_type,
        title: item.title,
        posterPath: item.poster_path,
        recommendedBy: item.recommended_by ?? null,
      })
      .onConflictDoNothing()
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function removeFromWatchlist(userId: string, id: string) {
  try {
    await db
      .delete(watchlist)
      .where(and(eq(watchlist.id, id), eq(watchlist.userId, userId)));
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function isInWatchlist(userId: string, tmdbId: number, mediaType: string) {
  try {
    const [row] = await db
      .select({ id: watchlist.id })
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.tmdbId, tmdbId),
          eq(watchlist.mediaType, mediaType as "movie" | "tv")
        )
      )
      .limit(1);
    return !!row;
  } catch {
    return false;
  }
}

// ─── Watched ──────────────────────────────────────────────────────────────────

export async function getWatched(userId: string) {
  try {
    const data = await db
      .select()
      .from(watched)
      .where(eq(watched.userId, userId))
      .orderBy(desc(watched.watchedAt));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function markWatched(
  userId: string,
  item: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    rating?: number | null;
    note?: string | null;
  }
) {
  try {
    const [data] = await db
      .insert(watched)
      .values({
        userId,
        tmdbId: item.tmdb_id,
        mediaType: item.media_type,
        title: item.title,
        posterPath: item.poster_path,
        rating: item.rating ?? null,
        note: item.note ?? null,
      })
      .returning();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function removeFromWatched(userId: string, id: string) {
  try {
    await db
      .delete(watched)
      .where(and(eq(watched.id, id), eq(watched.userId, userId)));
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export async function getFriends(userId: string) {
  try {
    const data = await db.execute(sql`
      SELECT
        f.id,
        f.status,
        f.requester_id,
        f.addressee_id,
        json_build_object('id', rp.id, 'name', rp.name, 'avatar_url', rp.avatar_url) AS requester,
        json_build_object('id', ap.id, 'name', ap.name, 'avatar_url', ap.avatar_url) AS addressee
      FROM friendships f
      JOIN profiles rp ON rp.id = f.requester_id
      JOIN profiles ap ON ap.id = f.addressee_id
      WHERE f.status = 'accepted'
        AND (f.requester_id = ${userId} OR f.addressee_id = ${userId})
    `);
    return { data: data.rows as FriendshipWithProfiles[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export type FriendshipWithProfiles = {
  id: string;
  status: string;
  requester_id: string;
  addressee_id: string;
  requester: { id: string; name: string | null; avatar_url: string | null };
  addressee: { id: string; name: string | null; avatar_url: string | null };
};

export async function getFriendsByUserId(userId: string) {
  return getFriends(userId);
}

export async function sendFriendRequest(requesterId: string, addresseeEmail: string) {
  try {
    // Look up user by email
    const [addressee] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, addresseeEmail))
      .limit(1);

    if (!addressee) {
      return { data: null, error: new Error("User not found") };
    }

    const [data] = await db
      .insert(friendships)
      .values({ requesterId, addresseeId: addressee.id })
      .onConflictDoNothing()
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFriendActivity(userId: string) {
  try {
    const friendRows = await db
      .select({ requesterId: friendships.requesterId, addresseeId: friendships.addresseeId })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
        )
      );

    if (!friendRows.length) return { data: [], error: null };

    const friendIds = friendRows.map((f) =>
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    const data = await db.execute(sql`
      SELECT w.*, json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS "user"
      FROM watched w
      JOIN profiles p ON p.id = w.user_id
      WHERE w.user_id = ANY(${friendIds})
      ORDER BY w.watched_at DESC
      LIMIT 30
    `);
    return { data: data.rows, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getEnhancedFriendActivity(userId: string) {
  try {
    const friendRows = await db
      .select({ requesterId: friendships.requesterId, addresseeId: friendships.addresseeId })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
        )
      );

    if (!friendRows.length) return { data: [], error: null };

    const friendIds = friendRows.map((f) =>
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    const [watchedRows, recRows] = await Promise.all([
      db.execute(sql`
        SELECT w.id, w.tmdb_id, w.media_type, w.title, w.poster_path, w.rating, w.note, w.watched_at, w.user_id,
          json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS "user"
        FROM watched w
        JOIN profiles p ON p.id = w.user_id
        WHERE w.user_id = ANY(${friendIds})
        ORDER BY w.watched_at DESC
        LIMIT 20
      `),
      db.execute(sql`
        SELECT r.id, r.tmdb_id, r.media_type, r.title, r.poster_path, r.note, r.created_at, r.from_user_id, r.to_user_id,
          json_build_object('id', fp.id, 'name', fp.name, 'avatar_url', fp.avatar_url) AS from_user,
          json_build_object('id', tp.id, 'name', tp.name, 'avatar_url', tp.avatar_url) AS to_user
        FROM recommendations r
        JOIN profiles fp ON fp.id = r.from_user_id
        JOIN profiles tp ON tp.id = r.to_user_id
        WHERE r.from_user_id = ANY(${friendIds}) OR r.to_user_id = ANY(${friendIds})
        ORDER BY r.created_at DESC
        LIMIT 20
      `),
    ]);

    type ActivityItem = {
      id: string;
      type: "watched" | "recommended";
      timestamp: string;
      tmdb_id: number;
      media_type: "movie" | "tv";
      title: string;
      poster_path: string | null;
      rating?: number | null;
      note?: string | null;
      actor: { id: string; name: string | null; avatar_url: string | null } | null;
      recipient?: { id: string; name: string | null; avatar_url: string | null } | null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activities: ActivityItem[] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(watchedRows.rows as any[]).map((w) => ({
        id: `watched-${w.id}`,
        type: "watched" as const,
        timestamp: w.watched_at,
        tmdb_id: w.tmdb_id,
        media_type: w.media_type as "movie" | "tv",
        title: w.title,
        poster_path: w.poster_path,
        rating: w.rating,
        note: w.note,
        actor: w.user,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(recRows.rows as any[]).map((r) => ({
        id: `rec-${r.id}`,
        type: "recommended" as const,
        timestamp: r.created_at,
        tmdb_id: r.tmdb_id,
        media_type: r.media_type as "movie" | "tv",
        title: r.title,
        poster_path: r.poster_path,
        note: r.note,
        actor: r.from_user,
        recipient: r.to_user,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 40);

    return { data: activities, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  try {
    const [data] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string }
) {
  try {
    const [data] = await db
      .update(profiles)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.avatar_url !== undefined && { avatarUrl: updates.avatar_url }),
      })
      .where(eq(profiles.id, userId))
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function ensureProfile(userId: string, email?: string, name?: string) {
  try {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!existing.length) {
      await db.insert(profiles).values({
        id: userId,
        email: email ?? null,
        name: name ?? email?.split("@")[0] ?? null,
      }).onConflictDoNothing();
    }
  } catch (err) {
    console.error("[db] ensureProfile error:", err);
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getRecommendationsForUser(userId: string) {
  try {
    const data = await db.execute(sql`
      SELECT r.*,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS from_user
      FROM recommendations r
      JOIN profiles p ON p.id = r.from_user_id
      WHERE r.to_user_id = ${userId}
      ORDER BY r.created_at DESC
    `);
    return { data: data.rows, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function sendRecommendation(
  fromUserId: string,
  toUserId: string,
  item: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    note?: string;
  }
) {
  try {
    const [data] = await db
      .insert(recommendations)
      .values({
        fromUserId,
        toUserId,
        tmdbId: item.tmdb_id,
        mediaType: item.media_type,
        title: item.title,
        posterPath: item.poster_path,
        note: item.note ?? null,
      })
      .returning();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ─── Shared Lists ─────────────────────────────────────────────────────────────

export async function getSharedLists(userId: string) {
  try {
    const data = await db.execute(sql`
      SELECT sl.*,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS creator,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', slm.id, 'user_id', slm.user_id,
            'profile', jsonb_build_object('id', mp.id, 'name', mp.name, 'avatar_url', mp.avatar_url)
          )) FILTER (WHERE slm.id IS NOT NULL),
          '[]'
        ) AS members,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', sli.id)) FILTER (WHERE sli.id IS NOT NULL),
          '[]'
        ) AS items
      FROM shared_lists sl
      LEFT JOIN profiles p ON p.id = sl.created_by
      LEFT JOIN shared_list_members slm ON slm.list_id = sl.id
      LEFT JOIN profiles mp ON mp.id = slm.user_id
      LEFT JOIN shared_list_items sli ON sli.list_id = sl.id
      WHERE sl.created_by = ${userId}
        OR sl.id IN (SELECT list_id FROM shared_list_members WHERE user_id = ${userId})
      GROUP BY sl.id, p.id
      ORDER BY sl.created_at DESC
    `);
    return { data: data.rows, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSharedListById(listId: string) {
  try {
    const data = await db.execute(sql`
      SELECT sl.*,
        json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS creator,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', slm.id, 'user_id', slm.user_id,
            'profile', jsonb_build_object('id', mp.id, 'name', mp.name, 'avatar_url', mp.avatar_url)
          )) FILTER (WHERE slm.id IS NOT NULL),
          '[]'
        ) AS members
      FROM shared_lists sl
      LEFT JOIN profiles p ON p.id = sl.created_by
      LEFT JOIN shared_list_members slm ON slm.list_id = sl.id
      LEFT JOIN profiles mp ON mp.id = slm.user_id
      WHERE sl.id = ${listId}
      GROUP BY sl.id, p.id
    `);
    return { data: data.rows[0] ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSharedListItems(listId: string) {
  try {
    const data = await db.execute(sql`
      SELECT sli.*,
        json_build_object('id', p.id, 'name', p.name) AS adder
      FROM shared_list_items sli
      JOIN profiles p ON p.id = sli.added_by
      WHERE sli.list_id = ${listId}
      ORDER BY sli.added_at DESC
    `);
    return { data: data.rows, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createSharedList(userId: string, name: string, description?: string) {
  try {
    const [data] = await db
      .insert(sharedLists)
      .values({ createdBy: userId, name, description: description ?? null })
      .returning();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addMemberToList(listId: string, userId: string, invitedBy: string) {
  try {
    const [data] = await db
      .insert(sharedListMembers)
      .values({ listId, userId, invitedBy })
      .onConflictDoNothing()
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addItemToSharedList(
  listId: string,
  userId: string,
  item: { tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null }
) {
  try {
    const [data] = await db
      .insert(sharedListItems)
      .values({
        listId,
        addedBy: userId,
        tmdbId: item.tmdb_id,
        mediaType: item.media_type,
        title: item.title,
        posterPath: item.poster_path,
      })
      .onConflictDoNothing()
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function removeItemFromSharedList(itemId: string) {
  try {
    await db.delete(sharedListItems).where(eq(sharedListItems.id, itemId));
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function deleteSharedList(listId: string) {
  try {
    await db.delete(sharedLists).where(eq(sharedLists.id, listId));
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(userId: string) {
  try {
    const [data] = await db
      .update(profiles)
      .set({ onboardingCompleted: true })
      .where(eq(profiles.id, userId))
      .returning();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const [row] = await db
      .select({ onboardingCompleted: profiles.onboardingCompleted })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return row?.onboardingCompleted === true;
  } catch {
    return false;
  }
}

// ─── Invite Codes ─────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getOrCreateInviteCode(
  userId: string
): Promise<{ code: string | null; error: Error | null }> {
  try {
    const [existing] = await db
      .select({ code: inviteCodes.code })
      .from(inviteCodes)
      .where(eq(inviteCodes.userId, userId))
      .limit(1);

    if (existing?.code) return { code: existing.code, error: null };

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      try {
        const [data] = await db
          .insert(inviteCodes)
          .values({ userId, code })
          .onConflictDoNothing()
          .returning({ code: inviteCodes.code });
        if (data) return { code: data.code, error: null };
      } catch {
        // collision — retry
      }
    }

    return { code: null, error: new Error("Failed to generate invite code") };
  } catch (error) {
    return { code: null, error: error as Error };
  }
}

export async function getInviteByCode(code: string) {
  try {
    const data = await db.execute(sql`
      SELECT ic.*, json_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url) AS owner
      FROM invite_codes ic
      JOIN profiles p ON p.id = ic.user_id
      WHERE ic.code = ${code}
    `);
    return { data: data.rows[0] ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function incrementInviteUses(code: string) {
  try {
    await db
      .update(inviteCodes)
      .set({ uses: sql`${inviteCodes.uses} + 1` })
      .where(eq(inviteCodes.code, code));
  } catch (err) {
    console.error("[db] incrementInviteUses error:", err);
  }
}

export async function acceptInviteAndFriend(inviterUserId: string, newUserId: string) {
  try {
    // Increment uses
    const [inviteCode] = await db
      .select({ code: inviteCodes.code })
      .from(inviteCodes)
      .where(eq(inviteCodes.userId, inviterUserId))
      .limit(1);

    if (inviteCode) await incrementInviteUses(inviteCode.code);

    const [data] = await db
      .insert(friendships)
      .values({ requesterId: inviterUserId, addresseeId: newUserId, status: "accepted" })
      .onConflictDoNothing()
      .returning();
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getInviteStats(userId: string) {
  try {
    const [data] = await db
      .select({ code: inviteCodes.code, uses: inviteCodes.uses })
      .from(inviteCodes)
      .where(eq(inviteCodes.userId, userId))
      .limit(1);
    return { data: data ?? null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
