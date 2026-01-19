import { useState, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/query-client";
import { WatchSource } from "@/types/film";

interface WatchProvider {
  name: string;
  type: string;
  logo: string;
}

interface WatchProvidersResponse {
  providers: WatchProvider[];
  link: string | null;
}

export function useWatchProviders(filmId: string) {
  const [providers, setProviders] = useState<WatchSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    if (!filmId.startsWith("tmdb-")) {
      return;
    }

    const tmdbId = filmId.replace("tmdb-", "");
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL(`/api/films/${tmdbId}/watch-providers`, baseUrl);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch watch providers");
      }
      
      const data: WatchProvidersResponse = await response.json();
      
      const watchSources: WatchSource[] = data.providers.map(p => ({
        name: p.name,
        url: data.link || `https://www.justwatch.com/us/search?q=${encodeURIComponent(p.name)}`,
        type: p.type as "stream" | "rent" | "buy" | "official",
      }));

      if (watchSources.length === 0 && data.link) {
        watchSources.push({
          name: "View Options",
          url: data.link,
          type: "official",
        });
      }

      setProviders(watchSources);
    } catch (err) {
      console.error("Error fetching watch providers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setIsLoading(false);
    }
  }, [filmId]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    isLoading,
    error,
    refetch: fetchProviders,
  };
}
