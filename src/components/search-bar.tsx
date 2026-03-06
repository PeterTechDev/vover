"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({ defaultValue = "", large = false, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "h-5 w-5" : "h-4 w-4"}`} />
      <Input
        type="search"
        placeholder="Search movies & TV shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        className={`bg-secondary/50 border-border/50 ${large ? "h-14 pl-11 pr-4 text-lg" : "h-10 pl-9 pr-4"}`}
      />
    </form>
  );
}
