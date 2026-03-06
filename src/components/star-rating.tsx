"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled ? "fill-primary text-primary" : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
