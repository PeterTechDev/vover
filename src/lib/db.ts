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
  item: { tmdb_id: number; media_type: "movie" | "tv"; title: string; poster_path: string | null }
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
