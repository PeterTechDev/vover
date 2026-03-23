import { supabase } from "./supabase";


// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function getWatchlist(userId: string) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return { data, error };
}

export async function addToWatchlist(
  userId: string,
  item: { tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null; recommended_by?: string | null }
) {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({ user_id: userId, ...item })
    .select()
    .single();
  return { data, error };
}

export async function removeFromWatchlist(userId: string, id: string) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

export async function isInWatchlist(userId: string, tmdbId: number, mediaType: string) {
  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();
  return !!data;
}

// ─── Watched ──────────────────────────────────────────────────────────────────

export async function getWatched(userId: string) {
  const { data, error } = await supabase
    .from("watched")
    .select("*")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false });
  return { data, error };
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
  const { data, error } = await supabase
    .from("watched")
    .insert({ user_id: userId, ...item })
    .select()
    .single();
  return { data, error };
}

export async function removeFromWatched(userId: string, id: string) {
  const { error } = await supabase
    .from("watched")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      id,
      status,
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, name, avatar_url),
      addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");
  return { data, error };
}

export async function sendFriendRequest(requesterId: string, addresseeEmail: string) {
  // Look up user by email via profile lookup
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", addresseeEmail) // email lookup requires auth.users join — handled server-side
    .maybeSingle();

  if (profileError || !profile) {
    return { data: null, error: profileError || new Error("User not found") };
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: profile.id })
    .select()
    .single();
  return { data, error };
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFriendActivity(userId: string) {
  // Get accepted friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!friendships?.length) return { data: [], error: null };

  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  // Get recent watched entries from friends
  const { data: watched, error } = await supabase
    .from("watched")
    .select("*, user:profiles!watched_user_id_fkey(id, name, avatar_url)")
    .in("user_id", friendIds)
    .order("watched_at", { ascending: false })
    .limit(30);

  return { data: watched, error };
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId: string, updates: { name?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function getRecommendationsForUser(userId: string) {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*, from_user:profiles!recommendations_from_user_id_fkey(id, name, avatar_url)")
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getWatchlistWithRecommender(userId: string) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*, recommender:profiles!watchlist_recommended_by_fkey(id, name)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return { data, error };
}

// ─── Shared Lists ─────────────────────────────────────────────────────────────

export async function getSharedLists(userId: string) {
  // Lists I created or am a member of
  const { data: memberListIds } = await supabase
    .from("shared_list_members")
    .select("list_id")
    .eq("user_id", userId);

  const memberIds = (memberListIds || []).map((m) => m.list_id);

  const { data, error } = await supabase
    .from("shared_lists")
    .select(`
      *,
      creator:profiles!shared_lists_created_by_fkey(id, name, avatar_url),
      members:shared_list_members(
        id,
        user_id,
        profile:profiles!shared_list_members_user_id_fkey(id, name, avatar_url)
      ),
      items:shared_list_items(id)
    `)
    .or(
      memberIds.length > 0
        ? `created_by.eq.${userId},id.in.(${memberIds.join(",")})`
        : `created_by.eq.${userId}`
    )
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getSharedListById(listId: string) {
  const { data, error } = await supabase
    .from("shared_lists")
    .select(`
      *,
      creator:profiles!shared_lists_created_by_fkey(id, name, avatar_url),
      members:shared_list_members(
        id,
        user_id,
        profile:profiles!shared_list_members_user_id_fkey(id, name, avatar_url)
      )
    `)
    .eq("id", listId)
    .single();
  return { data, error };
}

export async function getSharedListItems(listId: string) {
  const { data, error } = await supabase
    .from("shared_list_items")
    .select(`
      *,
      adder:profiles!shared_list_items_added_by_fkey(id, name)
    `)
    .eq("list_id", listId)
    .order("added_at", { ascending: false });
  return { data, error };
}

export async function createSharedList(userId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from("shared_lists")
    .insert({ created_by: userId, name, description: description || null })
    .select()
    .single();
  return { data, error };
}

export async function addMemberToList(listId: string, userId: string, invitedBy: string) {
  const { data, error } = await supabase
    .from("shared_list_members")
    .insert({ list_id: listId, user_id: userId, invited_by: invitedBy })
    .select()
    .single();
  return { data, error };
}

export async function addItemToSharedList(
  listId: string,
  userId: string,
  item: { tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null }
) {
  const { data, error } = await supabase
    .from("shared_list_items")
    .insert({ list_id: listId, added_by: userId, ...item })
    .select()
    .single();
  return { data, error };
}

export async function removeItemFromSharedList(itemId: string) {
  const { error } = await supabase.from("shared_list_items").delete().eq("id", itemId);
  return { error };
}

export async function deleteSharedList(listId: string) {
  const { error } = await supabase.from("shared_lists").delete().eq("id", listId);
  return { error };
}

export async function getFriendsByUserId(userId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      id,
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, name, avatar_url),
      addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");
  return { data, error };
}

// ─── Enhanced Feed ────────────────────────────────────────────────────────────

export async function getEnhancedFriendActivity(userId: string) {
  // Get accepted friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!friendships?.length) return { data: [], error: null };

  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  // Fetch watched activity from friends
  const { data: watched } = await supabase
    .from("watched")
    .select("id, tmdb_id, media_type, title, poster_path, rating, note, watched_at, user_id, user:profiles!watched_user_id_fkey(id, name, avatar_url)")
    .in("user_id", friendIds)
    .order("watched_at", { ascending: false })
    .limit(20);

  // Fetch recommendations sent BY friends or TO friends (visible to current user)
  const { data: recs } = await supabase
    .from("recommendations")
    .select("id, tmdb_id, media_type, title, poster_path, note, created_at, from_user_id, to_user_id, from_user:profiles!recommendations_from_user_id_fkey(id, name, avatar_url), to_user:profiles!recommendations_to_user_id_fkey(id, name, avatar_url)")
    .or(`from_user_id.in.(${friendIds.join(",")}),to_user_id.in.(${friendIds.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(20);

  // Normalize into a unified activity list
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

  const activities: ActivityItem[] = [
    ...((watched || []).map((w) => ({
      id: `watched-${w.id}`,
      type: "watched" as const,
      timestamp: w.watched_at,
      tmdb_id: w.tmdb_id,
      media_type: w.media_type as "movie" | "tv",
      title: w.title,
      poster_path: w.poster_path,
      rating: w.rating,
      note: w.note,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actor: (w as any).user,
    }))),
    ...((recs || []).map((r) => ({
      id: `rec-${r.id}`,
      type: "recommended" as const,
      timestamp: r.created_at,
      tmdb_id: r.tmdb_id,
      media_type: r.media_type as "movie" | "tv",
      title: r.title,
      poster_path: r.poster_path,
      note: r.note,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actor: (r as any).from_user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recipient: (r as any).to_user,
    }))),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 40);

  return { data: activities, error: null };
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();
  return data?.onboarding_completed === true;
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

export async function getOrCreateInviteCode(userId: string): Promise<{ code: string | null; error: Error | null }> {
  // Try to get existing code
  const { data: existing } = await supabase
    .from("invite_codes")
    .select("code")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.code) return { code: existing.code, error: null };

  // Create new code (retry on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from("invite_codes")
      .insert({ user_id: userId, code })
      .select("code")
      .single();
    if (!error && data) return { code: data.code, error: null };
  }

  return { code: null, error: new Error("Failed to generate invite code") };
}

export async function getInviteByCode(code: string) {
  const { data, error } = await supabase
    .from("invite_codes")
    .select("*, owner:profiles!invite_codes_user_id_fkey(id, name, avatar_url)")
    .eq("code", code)
    .maybeSingle();
  return { data, error };
}

export async function incrementInviteUses(code: string) {
  // Increment uses using RPC or raw update
  const { data: current } = await supabase
    .from("invite_codes")
    .select("uses")
    .eq("code", code)
    .single();
  
  if (current) {
    await supabase
      .from("invite_codes")
      .update({ uses: current.uses + 1 })
      .eq("code", code);
  }
}

export async function acceptInviteAndFriend(inviterUserId: string, newUserId: string) {
  // Increment uses
  const { data: inviteCode } = await supabase
    .from("invite_codes")
    .select("code")
    .eq("user_id", inviterUserId)
    .single();
  
  if (inviteCode) await incrementInviteUses(inviteCode.code);

  // Create friendship (inviter → new user)
  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: inviterUserId, addressee_id: newUserId, status: "accepted" })
    .select()
    .single();
  return { data, error };
}

export async function getInviteStats(userId: string) {
  const { data, error } = await supabase
    .from("invite_codes")
    .select("code, uses")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}
