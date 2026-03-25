import { useState, useCallback } from "react";
import { getApiUrl } from "@/lib/query-client";
import { Film } from "@/types/film";

interface TMDBFilm {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  synopsis: string;
  posterUrl: string | null;
  backdropUrl?: string | null;
  rating: number;
  voteCount?: number;
}

interface DiscoverResponse {
  films: TMDBFilm[];
  page: number;
  totalPages: number;
  totalResults: number;
}

function mapTMDBToFilm(tmdbFilm: TMDBFilm): Film {
  return {
    id: tmdbFilm.id,
    title: tmdbFilm.title,
    year: tmdbFilm.year || 0,
    runtime: 90,
    director: "Various",
    synopsis: tmdbFilm.synopsis || "A wildlife documentary exploring nature and conservation.",
    posterUrl: tmdbFilm.posterUrl || "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800",
    category: "safari",
    species: [],
    locations: [],
    source: "TMDB",
    whereToWatch: [
      { 
        name: "Find Streaming", 
        url: `https://www.themoviedb.org/movie/${tmdbFilm.tmdbId}/watch`, 
        type: "official" as const 
      },
      {
        name: "JustWatch",
        url: `https://www.justwatch.com/us/search?q=${encodeURIComponent(tmdbFilm.title)}`,
        type: "official" as const
      }
    ],
    rating: tmdbFilm.rating,
  };
}

export function useTMDBFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchFilms = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL(`/api/films/discover?page=${page}`, baseUrl);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch films");
      }
      
      const data: DiscoverResponse = await response.json();
      
      const mappedFilms = data.films.map(mapTMDBToFilm);
      
      if (append) {
        setFilms(prev => [...prev, ...mappedFilms]);
      } else {
        setFilms(mappedFilms);
      }
      
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
    } catch (err) {
      console.error("Error fetching TMDB films:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch films");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (currentPage < totalPages && !isLoadingMore) {
      await fetchFilms(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, fetchFilms]);

  const refresh = useCallback(async () => {
    setFilms([]);
    setCurrentPage(0);
    await fetchFilms(1, false);
  }, [fetchFilms]);

  const hasMore = currentPage < totalPages;

  return {
    films,
    isLoading,
    isLoadingMore,
    error,
    currentPage,
    totalPages,
    totalResults,
    hasMore,
    fetchFilms,
    loadMore,
    refresh,
  };
}

export function useFeaturedFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/films/featured", baseUrl);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch featured films");
      }
      
      const data = await response.json();
      const mappedFilms = data.films.map(mapTMDBToFilm);
      
      // Mark all as featured
      mappedFilms.forEach((film: Film) => {
        film.isFeatured = true;
      });
      
      setFilms(mappedFilms);
    } catch (err) {
      console.error("Error fetching featured films:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch featured films");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    films,
    isLoading,
    error,
    fetchFeatured,
  };
}

export function useTMDBSearch() {
  const [results, setResults] = useState<Film[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const url = new URL(`/api/films/search?q=${encodeURIComponent(query)}`, baseUrl);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      const mappedFilms = data.films.map(mapTMDBToFilm);
      setResults(mappedFilms);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults,
  };
}
