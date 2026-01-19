import { useState, useEffect, useCallback } from "react";
import { UserFilmData, Film } from "@/types/film";
import { SAMPLE_FILMS } from "@/data/films";
import * as storage from "@/lib/storage";
import { StoredFilmData } from "@/lib/storage";

const filmCache: Record<string, Film> = {};

export function cacheFilm(film: Film) {
  filmCache[film.id] = film;
}

export function getCachedFilm(id: string): Film | undefined {
  return filmCache[id] || SAMPLE_FILMS.find(f => f.id === id);
}

export function useFilms() {
  const [films] = useState<Film[]>(SAMPLE_FILMS);
  const [userFilmData, setUserFilmData] = useState<Record<string, UserFilmData>>({});
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [storedWatchedFilms, setStoredWatchedFilms] = useState<Record<string, StoredFilmData>>({});
  const [storedWatchlistFilms, setStoredWatchlistFilms] = useState<Record<string, StoredFilmData>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userData, watchlist, watched, storedWatchedData, storedWatchlistData] = await Promise.all([
        storage.getUserFilmData(),
        storage.getWatchlist(),
        storage.getWatchedFilms(),
        storage.getStoredWatchedFilms(),
        storage.getStoredWatchlistFilms(),
      ]);
      setUserFilmData(userData);
      setWatchlistIds(watchlist);
      setWatchedIds(watched);
      setStoredWatchedFilms(storedWatchedData);
      setStoredWatchlistFilms(storedWatchlistData);
    } catch (error) {
      console.error("Error loading film data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getFilmById = useCallback((id: string) => {
    return films.find((f) => f.id === id) || getCachedFilm(id);
  }, [films]);

  const addToWatchlist = useCallback(async (filmId: string, filmData?: Film) => {
    const film = filmData || getFilmById(filmId);
    if (film) {
      await storage.storeWatchlistFilm({
        id: film.id,
        title: film.title,
        runtime: film.runtime,
        posterUrl: film.posterUrl,
        year: film.year,
        rating: film.rating,
      });
    }
    await storage.addToWatchlist(filmId);
    await loadData();
  }, [loadData, getFilmById]);

  const removeFromWatchlist = useCallback(async (filmId: string) => {
    await storage.removeFromWatchlist(filmId);
    await storage.removeStoredWatchlistFilm(filmId);
    await loadData();
  }, [loadData]);

  const markAsWatched = useCallback(async (filmId: string, rating?: number, notes?: string, filmData?: Film) => {
    const film = filmData || getFilmById(filmId);
    if (film) {
      await storage.storeWatchedFilm({
        id: film.id,
        title: film.title,
        runtime: film.runtime,
        posterUrl: film.posterUrl,
        year: film.year,
        rating: film.rating,
      });
    }
    await storage.markAsWatched(filmId, rating, notes);
    await loadData();
  }, [loadData, getFilmById]);

  const updateRating = useCallback(async (filmId: string, rating: number) => {
    await storage.updateRating(filmId, rating);
    await loadData();
  }, [loadData]);

  const getFilmUserData = useCallback((filmId: string) => {
    return userFilmData[filmId];
  }, [userFilmData]);

  const isInWatchlist = useCallback((filmId: string) => {
    return watchlistIds.includes(filmId);
  }, [watchlistIds]);

  const isWatched = useCallback((filmId: string) => {
    return watchedIds.includes(filmId);
  }, [watchedIds]);

  const watchlistFilms: Film[] = watchlistIds.map((id) => {
    const filmFromSample = films.find((f) => f.id === id);
    if (filmFromSample) return filmFromSample;
    
    const cachedFilm = getCachedFilm(id);
    if (cachedFilm) return cachedFilm;
    
    const stored = storedWatchlistFilms[id];
    if (stored) {
      return {
        id: stored.id,
        title: stored.title,
        year: stored.year,
        runtime: stored.runtime,
        posterUrl: stored.posterUrl,
        rating: stored.rating,
        director: "Unknown",
        synopsis: "",
        category: "safari" as const,
        species: [],
        locations: [],
        source: "Unknown",
        whereToWatch: [],
      };
    }
    return null;
  }).filter((f): f is Film => f !== null);
  
  const watchedFilms: Film[] = watchedIds.map((id) => {
    const filmFromSample = films.find((f) => f.id === id);
    if (filmFromSample) return filmFromSample;
    
    const cachedFilm = getCachedFilm(id);
    if (cachedFilm) return cachedFilm;
    
    const stored = storedWatchedFilms[id];
    if (stored) {
      return {
        id: stored.id,
        title: stored.title,
        year: stored.year,
        runtime: stored.runtime,
        posterUrl: stored.posterUrl,
        rating: stored.rating,
        director: "Unknown",
        synopsis: "",
        category: "safari" as const,
        species: [],
        locations: [],
        source: "Unknown",
        whereToWatch: [],
      };
    }
    return null;
  }).filter((f): f is Film => f !== null);
  
  const featuredFilms = films.filter((f) => f.isFeatured);
  const newReleases = films.filter((f) => f.isNewRelease);

  return {
    films,
    userFilmData,
    watchlistFilms,
    watchedFilms,
    featuredFilms,
    newReleases,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    updateRating,
    getFilmById,
    getFilmUserData,
    isInWatchlist,
    isWatched,
    refetch: loadData,
  };
}
