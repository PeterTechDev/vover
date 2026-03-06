"use client";

import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
  autoFocus?: boolean;
}

interface AutocompleteResult {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  year: string | null;
}

export function SearchBar({ defaultValue = "", large = false, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigateToResult = useCallback(
    (result: AutocompleteResult) => {
      setIsOpen(false);
      setQuery(result.title || "");
      router.push(`/${result.media_type}/${result.id}`);
    },
    [router]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // If an item is focused, navigate to it
    if (focusIndex >= 0 && focusIndex < results.length) {
      navigateToResult(results[focusIndex]);
      return;
    }

    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusIndex(-1);
    }
  }

  // Reset focus index when results change
  useEffect(() => {
    setFocusIndex(-1);
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "h-5 w-5" : "h-4 w-4"}`}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`bg-secondary/50 border-border/50 ${large ? "h-14 pl-11 pr-4 text-lg" : "h-10 pl-9 pr-4"}`}
        />
        {isLoading && (
          <Loader2
            className={`absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground ${large ? "h-5 w-5" : "h-4 w-4"}`}
          />
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result, index) => (
                <li key={`${result.media_type}-${result.id}`}>
                  <button
                    type="button"
                    onClick={() => navigateToResult(result)}
                    onMouseEnter={() => setFocusIndex(index)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent ${
                      focusIndex === index ? "bg-accent" : ""
                    }`}
                  >
                    <div className="relative h-[60px] w-[40px] flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                      <Image
                        src={posterUrl(result.poster_path, "w92")}
                        alt={result.title || ""}
                        width={40}
                        height={60}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {result.year && (
                          <span className="text-xs text-muted-foreground">{result.year}</span>
                        )}
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                          {result.media_type === "movie" ? "Movie" : "TV"}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
