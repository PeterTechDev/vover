import type { Database } from "@/types/database";

type WatchlistItem = Database["public"]["Tables"]["watchlist"]["Row"];
type WatchedItem = Database["public"]["Tables"]["watched"]["Row"];
type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const mockUser: Profile = {
  id: "mock-user-1",
  name: "Peter",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export const mockFriends: Profile[] = [
  { id: "mock-user-2", name: "Alice", avatar_url: null, created_at: new Date().toISOString() },
  { id: "mock-user-3", name: "Bob", avatar_url: null, created_at: new Date().toISOString() },
  { id: "mock-user-4", name: "Carol", avatar_url: null, created_at: new Date().toISOString() },
];

export const mockWatchlist: WatchlistItem[] = [
  { id: "w1", user_id: "mock-user-1", tmdb_id: 550, media_type: "movie", title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", added_at: "2025-03-01T10:00:00Z", recommended_by: null },
  { id: "w2", user_id: "mock-user-1", tmdb_id: 680, media_type: "movie", title: "Pulp Fiction", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", added_at: "2025-03-02T10:00:00Z", recommended_by: null },
  { id: "w3", user_id: "mock-user-1", tmdb_id: 1396, media_type: "tv", title: "Breaking Bad", poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", added_at: "2025-03-03T10:00:00Z", recommended_by: null },
  { id: "w4", user_id: "mock-user-1", tmdb_id: 299534, media_type: "movie", title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", added_at: "2025-03-04T10:00:00Z", recommended_by: null },
];

export const mockWatched: WatchedItem[] = [
  { id: "wt1", user_id: "mock-user-1", tmdb_id: 278, media_type: "movie", title: "The Shawshank Redemption", poster_path: "/9cjIGRiQxkYMQ3UeCkR1nKtOHOx.jpg", rating: 5, note: "A masterpiece. The ending had me in tears.", watched_at: "2025-02-28T20:00:00Z" },
  { id: "wt2", user_id: "mock-user-1", tmdb_id: 1399, media_type: "tv", title: "Game of Thrones", poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", rating: 4, note: "Great until the last season.", watched_at: "2025-02-25T20:00:00Z" },
  { id: "wt3", user_id: "mock-user-1", tmdb_id: 238, media_type: "movie", title: "The Godfather", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", rating: 5, note: "An offer I couldn't refuse.", watched_at: "2025-02-20T20:00:00Z" },
];

export const mockRecommendations: (Recommendation & { from_user_name: string })[] = [
  { id: "r1", from_user_id: "mock-user-2", to_user_id: "mock-user-1", tmdb_id: 155, media_type: "movie", title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911BTUgMe1nS2bA.jpg", note: "You'll love this — best superhero movie ever made!", created_at: "2025-03-04T15:00:00Z", from_user_name: "Alice" },
  { id: "r2", from_user_id: "mock-user-3", to_user_id: "mock-user-1", tmdb_id: 76479, media_type: "tv", title: "The Boys", poster_path: "/stTEycfG9Ey7snqYDMQLDgrAADn.jpg", note: "Dark, funny, and totally different from other superhero stuff.", created_at: "2025-03-03T12:00:00Z", from_user_name: "Bob" },
];

export interface FeedItem {
  id: string;
  type: "watchlist_add" | "watched" | "recommendation";
  user: Profile;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating?: number | null;
  note?: string | null;
  to_user?: Profile;
  created_at: string;
}

export const mockFeed: FeedItem[] = [
  { id: "f1", type: "recommendation", user: mockFriends[0], tmdb_id: 155, media_type: "movie", title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911BTUgMe1nS2bA.jpg", note: "You'll love this — best superhero movie ever made!", to_user: mockUser, created_at: "2025-03-04T15:00:00Z" },
  { id: "f2", type: "watched", user: mockFriends[1], tmdb_id: 550, media_type: "movie", title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", rating: 5, note: "First rule: you do not talk about Fight Club.", created_at: "2025-03-04T12:00:00Z" },
  { id: "f3", type: "watchlist_add", user: mockFriends[2], tmdb_id: 94997, media_type: "tv", title: "House of the Dragon", poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg", created_at: "2025-03-04T10:00:00Z" },
  { id: "f4", type: "watched", user: mockFriends[0], tmdb_id: 238, media_type: "movie", title: "The Godfather", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", rating: 5, note: "Finally watched it. Absolute cinema.", created_at: "2025-03-03T20:00:00Z" },
  { id: "f5", type: "recommendation", user: mockFriends[1], tmdb_id: 76479, media_type: "tv", title: "The Boys", poster_path: "/stTEycfG9Ey7snqYDMQLDgrAADn.jpg", note: "Dark, funny, and totally different from other superhero stuff.", to_user: mockUser, created_at: "2025-03-03T12:00:00Z" },
  { id: "f6", type: "watchlist_add", user: mockFriends[0], tmdb_id: 1396, media_type: "tv", title: "Breaking Bad", poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", created_at: "2025-03-02T14:00:00Z" },
];
