/**
 * Client-safe DB wrapper for Vover.
 * Mirrors @/lib/db function signatures but calls the /api/db endpoint.
 * Use this in client components ("use client") instead of @/lib/db.
 *
 * Note: userId params are forwarded to the API but the server always
 * validates the caller from the session — never trusts client-supplied IDs.
 */

async function dbCall<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, ...params }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `DB call failed: ${method}`);
  }
  return res.json() as T;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function getWatchlist(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getWatchlist", { userId });
}

export async function getWatchlistWithRecommender(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getWatchlistWithRecommender", { userId });
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
  return dbCall<{ data: unknown; error: unknown }>("addToWatchlist", { userId, item });
}

export async function removeFromWatchlist(userId: string, id: string) {
  return dbCall<{ error: unknown }>("removeFromWatchlist", { userId, id });
}

export async function isInWatchlist(userId: string, tmdbId: number, mediaType: string) {
  const res = await dbCall<{ result: boolean }>("isInWatchlist", { userId, tmdbId, mediaType });
  return res.result;
}

// ─── Watched ──────────────────────────────────────────────────────────────────

export async function getWatched(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getWatched", { userId });
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
  return dbCall<{ data: unknown; error: unknown }>("markWatched", { userId, item });
}

export async function removeFromWatched(userId: string, id: string) {
  return dbCall<{ error: unknown }>("removeFromWatched", { userId, id });
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export async function getFriends(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getFriends", { userId });
}

export async function getFriendsByUserId(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getFriendsByUserId", { userId });
}

export async function sendFriendRequest(requesterId: string, addresseeEmail: string) {
  return dbCall<{ data: unknown; error: unknown }>("sendFriendRequest", { requesterId, addresseeEmail });
}

export async function getFriendActivity(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getFriendActivity", { userId });
}

export async function getEnhancedFriendActivity(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getEnhancedFriendActivity", { userId });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  return dbCall<{ data: unknown; error: unknown }>("getProfile", { userId });
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string }
) {
  return dbCall<{ data: unknown; error: unknown }>("updateProfile", { userId, updates });
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getRecommendationsForUser(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getRecommendationsForUser", { userId });
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
  return dbCall<{ data: unknown; error: unknown }>("sendRecommendation", { fromUserId, toUserId, item });
}

// ─── Shared Lists ─────────────────────────────────────────────────────────────

export async function getSharedLists(userId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getSharedLists", { userId });
}

export async function getSharedListById(listId: string) {
  return dbCall<{ data: unknown; error: unknown }>("getSharedListById", { listId });
}

export async function getSharedListItems(listId: string) {
  return dbCall<{ data: unknown[] | null; error: unknown }>("getSharedListItems", { listId });
}

export async function createSharedList(userId: string, name: string, description?: string) {
  return dbCall<{ data: { id: string; created_by: string; name: string; description: string | null; created_at: string } | null; error: unknown }>("createSharedList", { userId, name, description });
}

export async function addMemberToList(listId: string, memberId: string, invitedBy: string) {
  return dbCall<{ data: unknown; error: unknown }>("addMemberToList", { listId, memberId, invitedBy });
}

export async function addItemToSharedList(
  listId: string,
  userId: string,
  item: { tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null }
) {
  return dbCall<{ data: { id: string; list_id: string; added_by: string; tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null; added_at: string } | null; error: unknown }>("addItemToSharedList", { listId, userId, item });
}

export async function removeItemFromSharedList(itemId: string) {
  return dbCall<{ error: unknown }>("removeItemFromSharedList", { itemId });
}

export async function deleteSharedList(listId: string) {
  return dbCall<{ error: unknown }>("deleteSharedList", { listId });
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(userId: string) {
  return dbCall<{ data: unknown; error: unknown }>("completeOnboarding", { userId });
}

export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  const res = await dbCall<{ result: boolean }>("isOnboardingCompleted", { userId });
  return res.result;
}

// ─── Invite Codes ─────────────────────────────────────────────────────────────

export async function getOrCreateInviteCode(
  userId: string
): Promise<{ code: string | null; error: Error | null }> {
  return dbCall("getOrCreateInviteCode", { userId });
}

export async function getInviteByCode(code: string) {
  return dbCall<{ data: unknown; error: unknown }>("getInviteByCode", { code });
}

export async function incrementInviteUses(code: string) {
  return dbCall<{ ok: boolean }>("incrementInviteUses", { code });
}

export async function acceptInviteAndFriend(inviterUserId: string, newUserId: string) {
  return dbCall<{ data: unknown; error: unknown }>("acceptInviteAndFriend", { inviterUserId, newUserId });
}

export async function getInviteStats(userId: string) {
  return dbCall<{ data: unknown; error: unknown }>("getInviteStats", { userId });
}
