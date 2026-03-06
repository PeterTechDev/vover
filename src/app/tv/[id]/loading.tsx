import { Skeleton } from "@/components/ui/skeleton";

export default function TVLoading() {
  return (
    <div>
      <Skeleton className="h-[50vh] w-full" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="-mt-32 relative z-10 flex flex-col gap-8 md:flex-row">
          <Skeleton className="h-[450px] w-[300px] flex-shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-4 pt-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-24 w-full max-w-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
