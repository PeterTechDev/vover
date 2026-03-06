import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export function MediaCard({ tmdbId, mediaType, title, posterPath, rating, year, voteAverage, recommendedBy }: MediaCardProps) {
  return (
    <Link
      href={`/${mediaType}/${tmdbId}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={posterUrl(posterPath)}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {mediaType && (
          <Badge className="absolute left-2 top-2 bg-background/80 text-xs backdrop-blur-sm">
            {mediaType === "movie" ? "Movie" : "TV"}
          </Badge>
        )}
        {voteAverage != null && voteAverage > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">{title}</h3>
        {recommendedBy && (
          <span className="inline-flex items-center gap-1 truncate max-w-full rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Recommended by {recommendedBy}
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {year && <span>{year}</span>}
          {rating != null && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
