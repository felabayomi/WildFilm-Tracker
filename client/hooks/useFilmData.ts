import { useState, useEffect, useCallback } from "react";
import { UserFilmData, Film } from "@/types/film";
import { SAMPLE_FILMS } from "@/data/films";
import * as storage from "@/lib/storage";

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
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userData, watchlist, watched] = await Promise.all([
        storage.getUserFilmData(),
        storage.getWatchlist(),
        storage.getWatchedFilms(),
      ]);
      setUserFilmData(userData);
      setWatchlistIds(watchlist);
      setWatchedIds(watched);
    } catch (error) {
      console.error("Error loading film data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToWatchlist = useCallback(async (filmId: string) => {
    await storage.addToWatchlist(filmId);
    await loadData();
  }, [loadData]);

  const removeFromWatchlist = useCallback(async (filmId: string) => {
    await storage.removeFromWatchlist(filmId);
    await loadData();
  }, [loadData]);

  const markAsWatched = useCallback(async (filmId: string, rating?: number, notes?: string) => {
    await storage.markAsWatched(filmId, rating, notes);
    await loadData();
  }, [loadData]);

  const updateRating = useCallback(async (filmId: string, rating: number) => {
    await storage.updateRating(filmId, rating);
    await loadData();
  }, [loadData]);

  const getFilmById = useCallback((id: string) => {
    return films.find((f) => f.id === id) || getCachedFilm(id);
  }, [films]);

  const getFilmUserData = useCallback((filmId: string) => {
    return userFilmData[filmId];
  }, [userFilmData]);

  const isInWatchlist = useCallback((filmId: string) => {
    return watchlistIds.includes(filmId);
  }, [watchlistIds]);

  const isWatched = useCallback((filmId: string) => {
    return watchedIds.includes(filmId);
  }, [watchedIds]);

  const watchlistFilms = films.filter((f) => watchlistIds.includes(f.id));
  const watchedFilms = films.filter((f) => watchedIds.includes(f.id));
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
