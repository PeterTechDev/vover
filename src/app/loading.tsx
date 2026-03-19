import { Film } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Film className="h-7 w-7 animate-pulse text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
