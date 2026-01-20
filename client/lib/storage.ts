import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserFilmData, Film } from "@/types/film";

export interface StoredFilmData {
  id: string;
  title: string;
  runtime: number;
  posterUrl: string;
  year: number;
  rating?: number;
}

const STORAGE_KEYS = {
  USER_FILM_DATA: "user_film_data",
  FAVORITE_SOURCES: "favorite_sources",
  WATCHED_FILMS_DATA: "watched_films_data",
  WATCHLIST_FILMS_DATA: "watchlist_films_data",
  USER_PROFILE: "user_profile",
  USER_PREFERENCES: "user_preferences",
  FAVORITE_SPECIES: "favorite_species",
};

export interface UserPreferences {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  newFilmAlerts: boolean;
  watchlistReminders: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  isDarkMode: true,
  notificationsEnabled: false,
  newFilmAlerts: true,
  watchlistReminders: true,
};

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
  try {
    const current = await getUserPreferences();
    const updated = { ...current, ...preferences };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
}

export interface UserProfile {
  name: string;
  bio: string;
  imageUri?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Wildlife Enthusiast",
  bio: "Exploring nature through film",
};

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return DEFAULT_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
}

export async function getUserFilmData(): Promise<Record<string, UserFilmData>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_FILM_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting user film data:", error);
    return {};
  }
}

export async function setUserFilmData(
  filmId: string,
  data: Partial<UserFilmData>
): Promise<void> {
  try {
    const allData = await getUserFilmData();
    allData[filmId] = {
      ...allData[filmId],
      filmId,
      ...data,
    } as UserFilmData;
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_FILM_DATA,
      JSON.stringify(allData)
    );
  } catch (error) {
    console.error("Error setting user film data:", error);
  }
}

export async function addToWatchlist(filmId: string): Promise<void> {
  await setUserFilmData(filmId, {
    isInWatchlist: true,
    addedToWatchlistDate: new Date().toISOString(),
  });
}

export async function removeFromWatchlist(filmId: string): Promise<void> {
  await setUserFilmData(filmId, {
    isInWatchlist: false,
    addedToWatchlistDate: undefined,
  });
}

export async function markAsWatched(
  filmId: string,
  rating?: number,
  notes?: string
): Promise<void> {
  await setUserFilmData(filmId, {
    isWatched: true,
    watchedDate: new Date().toISOString(),
    userRating: rating,
    userNotes: notes,
  });
}

export async function updateRating(
  filmId: string,
  rating: number
): Promise<void> {
  await setUserFilmData(filmId, {
    userRating: rating,
  });
}

export async function getWatchlist(): Promise<string[]> {
  const data = await getUserFilmData();
  return Object.entries(data)
    .filter(([_, film]) => film.isInWatchlist)
    .sort((a, b) => {
      const dateA = a[1].addedToWatchlistDate || "";
      const dateB = b[1].addedToWatchlistDate || "";
      return dateB.localeCompare(dateA);
    })
    .map(([filmId]) => filmId);
}

export async function getWatchedFilms(): Promise<string[]> {
  const data = await getUserFilmData();
  return Object.entries(data)
    .filter(([_, film]) => film.isWatched)
    .sort((a, b) => {
      const dateA = a[1].watchedDate || "";
      const dateB = b[1].watchedDate || "";
      return dateB.localeCompare(dateA);
    })
    .map(([filmId]) => filmId);
}

export async function getFavoriteSources(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_SOURCES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting favorite sources:", error);
    return [];
  }
}

export async function toggleFavoriteSource(source: string): Promise<void> {
  try {
    const sources = await getFavoriteSources();
    const index = sources.indexOf(source);
    if (index > -1) {
      sources.splice(index, 1);
    } else {
      sources.push(source);
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITE_SOURCES,
      JSON.stringify(sources)
    );
  } catch (error) {
    console.error("Error toggling favorite source:", error);
  }
}

export async function getStoredWatchedFilms(): Promise<Record<string, StoredFilmData>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHED_FILMS_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting stored watched films:", error);
    return {};
  }
}

export async function storeWatchedFilm(film: StoredFilmData): Promise<void> {
  try {
    const allFilms = await getStoredWatchedFilms();
    allFilms[film.id] = film;
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATCHED_FILMS_DATA,
      JSON.stringify(allFilms)
    );
  } catch (error) {
    console.error("Error storing watched film:", error);
  }
}

export async function getStoredWatchlistFilms(): Promise<Record<string, StoredFilmData>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST_FILMS_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting stored watchlist films:", error);
    return {};
  }
}

export async function storeWatchlistFilm(film: StoredFilmData): Promise<void> {
  try {
    const allFilms = await getStoredWatchlistFilms();
    allFilms[film.id] = film;
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATCHLIST_FILMS_DATA,
      JSON.stringify(allFilms)
    );
  } catch (error) {
    console.error("Error storing watchlist film:", error);
  }
}

export async function removeStoredWatchlistFilm(filmId: string): Promise<void> {
  try {
    const allFilms = await getStoredWatchlistFilms();
    delete allFilms[filmId];
    await AsyncStorage.setItem(
      STORAGE_KEYS.WATCHLIST_FILMS_DATA,
      JSON.stringify(allFilms)
    );
  } catch (error) {
    console.error("Error removing stored watchlist film:", error);
  }
}

export async function clearWatchHistory(): Promise<void> {
  try {
    const userData = await getUserFilmData();
    const updatedData: Record<string, UserFilmData> = {};
    for (const [filmId, data] of Object.entries(userData)) {
      updatedData[filmId] = {
        ...data,
        isWatched: false,
        watchedDate: undefined,
        userRating: undefined,
      };
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_FILM_DATA,
      JSON.stringify(updatedData)
    );
    await AsyncStorage.removeItem(STORAGE_KEYS.WATCHED_FILMS_DATA);
  } catch (error) {
    console.error("Error clearing watch history:", error);
  }
}

export async function clearWatchlist(): Promise<void> {
  try {
    const userData = await getUserFilmData();
    const updatedData: Record<string, UserFilmData> = {};
    for (const [filmId, data] of Object.entries(userData)) {
      updatedData[filmId] = {
        ...data,
        isInWatchlist: false,
        addedToWatchlistDate: undefined,
      };
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_FILM_DATA,
      JSON.stringify(updatedData)
    );
    await AsyncStorage.removeItem(STORAGE_KEYS.WATCHLIST_FILMS_DATA);
  } catch (error) {
    console.error("Error clearing watchlist:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_FILM_DATA,
      STORAGE_KEYS.WATCHED_FILMS_DATA,
      STORAGE_KEYS.WATCHLIST_FILMS_DATA,
      STORAGE_KEYS.FAVORITE_SOURCES,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.FAVORITE_SPECIES,
    ]);
  } catch (error) {
    console.error("Error clearing all data:", error);
  }
}

export async function getFavoriteSpecies(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_SPECIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting favorite species:", error);
    return [];
  }
}

export async function toggleFavoriteSpecies(species: string): Promise<boolean> {
  try {
    const speciesList = await getFavoriteSpecies();
    const normalizedSpecies = species.toLowerCase().trim();
    const index = speciesList.findIndex(s => s.toLowerCase() === normalizedSpecies);
    
    if (index > -1) {
      speciesList.splice(index, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_SPECIES, JSON.stringify(speciesList));
      return false;
    } else {
      speciesList.push(species);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_SPECIES, JSON.stringify(speciesList));
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite species:", error);
    return false;
  }
}

export async function isSpeciesFavorite(species: string): Promise<boolean> {
  const speciesList = await getFavoriteSpecies();
  return speciesList.some(s => s.toLowerCase() === species.toLowerCase().trim());
}

export async function updateUserNotes(filmId: string, notes: string): Promise<void> {
  await setUserFilmData(filmId, { userNotes: notes });
}

export interface ManualWatchLink {
  id: string;
  filmId: string;
  name: string;
  url: string;
  type: 'stream' | 'rent' | 'buy' | 'free';
}

const MANUAL_WATCH_LINKS_KEY = "manual_watch_links";

export async function getManualWatchLinks(filmId: string): Promise<ManualWatchLink[]> {
  try {
    const data = await AsyncStorage.getItem(MANUAL_WATCH_LINKS_KEY);
    const allLinks: ManualWatchLink[] = data ? JSON.parse(data) : [];
    return allLinks.filter(link => link.filmId === filmId);
  } catch (error) {
    console.error("Error getting manual watch links:", error);
    return [];
  }
}

export async function addManualWatchLink(link: Omit<ManualWatchLink, 'id'>): Promise<ManualWatchLink> {
  try {
    const data = await AsyncStorage.getItem(MANUAL_WATCH_LINKS_KEY);
    const allLinks: ManualWatchLink[] = data ? JSON.parse(data) : [];
    const newLink: ManualWatchLink = {
      ...link,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    allLinks.push(newLink);
    await AsyncStorage.setItem(MANUAL_WATCH_LINKS_KEY, JSON.stringify(allLinks));
    return newLink;
  } catch (error) {
    console.error("Error adding manual watch link:", error);
    throw error;
  }
}

export async function removeManualWatchLink(linkId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(MANUAL_WATCH_LINKS_KEY);
    const allLinks: ManualWatchLink[] = data ? JSON.parse(data) : [];
    const filtered = allLinks.filter(link => link.id !== linkId);
    await AsyncStorage.setItem(MANUAL_WATCH_LINKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing manual watch link:", error);
  }
}
