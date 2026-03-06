import { MediaGridSkeleton } from "@/components/media-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 max-w-xl">
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="mb-6 h-4 w-48" />
      <MediaGridSkeleton count={10} />
    </div>
  );
}
