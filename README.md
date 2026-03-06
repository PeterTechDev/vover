# Vover

Social movie and series recommendations from friends you trust — not algorithms.

## Features

- **Search** — Find movies and TV shows via TMDB
- **Watchlist** — Save titles you want to watch
- **Watched** — Log what you've seen with ratings (1-5 stars) and notes
- **Recommend** — Send recommendations to friends with a personal note
- **Feed** — See what your friends are watching, rating, and recommending
- **Profile** — Your stats and friend management

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- TMDB API for movie/series data
- Supabase for auth + database (optional — works with mock data)
- Lucide React icons

## Setup

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_TMDB_API_KEY` | Free API key from [TMDB](https://www.themoviedb.org/settings/api) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

The app works without Supabase (uses mock data for watchlist, watched, feed, and profile). TMDB API key is required for search and detail pages.

## Database

See the SQL schema in the project spec. Tables: `profiles`, `watchlist`, `watched`, `friendships`, `recommendations`.
