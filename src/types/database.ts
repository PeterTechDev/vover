export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path: string | null;
          added_at: string;
          recommended_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path?: string | null;
          added_at?: string;
          recommended_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tmdb_id?: number;
          media_type?: "movie" | "tv";
          title?: string;
          poster_path?: string | null;
          added_at?: string;
          recommended_by?: string | null;
        };
      };
      watched: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path: string | null;
          rating: number | null;
          note: string | null;
          watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path?: string | null;
          rating?: number | null;
          note?: string | null;
          watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tmdb_id?: number;
          media_type?: "movie" | "tv";
          title?: string;
          poster_path?: string | null;
          rating?: number | null;
          note?: string | null;
          watched_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          poster_path?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          tmdb_id?: number;
          media_type?: "movie" | "tv";
          title?: string;
          poster_path?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
