# Vover

> Social movie & TV recommendation app — "What should we watch next?"

## Brain Doc
No brain doc yet

## What It Is
Vover lets friends recommend movies and TV shows to each other. Users search TMDB for titles, maintain a personal watchlist and watched history (with 1-5 star ratings and notes), and send recommendations to friends. A social feed shows what friends have been watching.

## Stack
- **Next.js 14.2** (App Router, `src/` directory)
- **React 18** + **TypeScript 5**
- **Tailwind CSS 3.4** + **tailwindcss-animate**
- **Radix UI** (avatar, dialog, dropdown-menu, tabs, sheet, scroll-area, separator)
- **shadcn/ui** component pattern (`src/components/ui/`)
- **Supabase** — auth (magic link OTP) + Postgres DB + RLS
- **TMDB API** — movie/TV search, trending, detail pages
- **Sonner** — toast notifications
- **Lucide React** — icons
- Dark theme only (`<html lang="en" className="dark">`)

## Run
```bash
npm run dev    # default port 3000
npm run build  # production build
npm run lint   # ESLint
```

## Key Files
- `src/app/page.tsx` — homepage with trending movies/TV and search
- `src/app/search/page.tsx` — TMDB multi-search results
- `src/app/movie/[id]/page.tsx` — movie detail page
- `src/app/tv/[id]/page.tsx` — TV show detail page
- `src/app/watchlist/page.tsx` — user's watchlist
- `src/app/watched/page.tsx` — user's watched history
- `src/app/feed/page.tsx` — social feed of friends' activity
- `src/app/recommendations/page.tsx` — standalone recommendations view (if exists)
- `src/app/profile/page.tsx` — user profile
- `src/app/auth/callback/route.ts` — Supabase auth code exchange
- `src/app/api/search/route.ts` — server-side TMDB search (keeps API key secret)
- `src/lib/db.ts` — all Supabase DB queries (watchlist, watched, friends, recs, profile)
- `src/lib/tmdb.ts` — TMDB API client (search, trending, movie/TV detail)
- `src/lib/auth.ts` — client-side auth helpers (magic link, sign out, session)
- `src/lib/supabase.ts` — Supabase client init
- `src/types/database.ts` — TypeScript types for all DB tables
- `src/components/navbar.tsx` — top navigation bar
- `src/components/media-card.tsx` — reusable movie/TV poster card
- `src/components/search-bar.tsx` — autocomplete search with typeahead dropdown
- `src/components/recommendations-inbox.tsx` — incoming recommendations UI
- `src/components/detail-actions.tsx` — add-to-watchlist / mark-watched actions
- `supabase/schema.sql` — full DB schema with RLS policies

## Database Tables (Supabase Postgres)
- `profiles` — user profiles (auto-created on signup via trigger)
- `watchlist` — movies/shows user wants to watch
- `watched` — movies/shows user has seen (with rating 1-5 and notes)
- `friendships` — friend requests (pending/accepted/rejected)
- `recommendations` — friend-to-friend title recommendations

## Environment Variables
```bash
# .env.local — see .env.local.example
NEXT_PUBLIC_TMDB_API_KEY=   # TMDB v3 API key (client-side, for images)
TMDB_API_KEY=               # TMDB v3 API key (server-side, for API calls in route handlers)
NEXT_PUBLIC_SUPABASE_URL=   # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
```
Note: `TMDB_API_KEY` (no NEXT_PUBLIC_ prefix) is used in `src/lib/tmdb.ts` for server-side calls.

## Auth
Magic link (email OTP) via Supabase Auth. Callback at `/auth/callback`. Client helpers in `src/lib/auth.ts`, server exchange in the route handler.

## Deploy
Unknown — no Vercel config found. Standard Next.js deployment applies.

## Current State
**Active MVP** (last commit: Mar 2025). Working features:
- TMDB search with autocomplete/typeahead
- Trending movies/TV on homepage
- Movie and TV detail pages
- Personal watchlist and watched history with ratings
- Friend system (requests, accept/reject)
- Friend-to-friend recommendations
- Social feed of friends' watch activity
- User profiles
- Magic link auth
