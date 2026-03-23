import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { Star, Plus, Eye } from "lucide-react";

interface MediaCardProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  rating?: number | null;
  year?: string | null;
  voteAverage?: number | null;
  recommendedBy?: string | null;
}

export function MediaCard({
  tmdbId,
  mediaType,
  title,
  posterPath,
  rating,
  year,
  voteAverage,
  recommendedBy,
}: MediaCardProps) {
  return (
    <Link
      href={`/${mediaType}/${tmdbId}`}
      className="group relative flex flex-col overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary/50 rounded-xl">
        <Image
          src={posterUrl(posterPath)}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />

        {/* Gradient overlay — always faint, stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top left: media type pill */}
        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm border border-white/10">
          {mediaType === "movie" ? "Film" : "TV"}
        </div>

        {/* Top right: TMDB rating */}
        {voteAverage != null && voteAverage > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 backdrop-blur-sm border border-white/10">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-bold tabular-nums text-white">{voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Bottom overlay: title + actions on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1 px-2.5 pb-2.5 pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {/* Quick action icons */}
          <div className="mb-2 flex items-center justify-end gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-sm hover:bg-primary transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-sm hover:bg-white/25 transition-colors">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Recommended-by badge */}
        {recommendedBy && (
          <div className="absolute inset-x-0 bottom-0 px-2 pb-2 opacity-0 transition-opacity duration-300 group-hover:opacity-0">
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-primary/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              From {recommendedBy}
            </span>
          </div>
        )}
      </div>

      {/* Card info below poster */}
      <div className="mt-2 px-0.5">
        <p className="line-clamp-1 text-[13px] font-medium leading-tight text-foreground/90">
          {title}
        </p>

        <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">{year ?? ""}</span>

          {/* User rating stars */}
          {rating != null && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < rating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/25"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Recommended by (compact) */}
          {recommendedBy && !rating && (
            <span className="truncate max-w-[80px] text-primary/80 font-medium">
              {recommendedBy}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
