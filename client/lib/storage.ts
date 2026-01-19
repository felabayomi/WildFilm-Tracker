import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserFilmData } from "@/types/film";

const STORAGE_KEYS = {
  USER_FILM_DATA: "user_film_data",
  FAVORITE_SOURCES: "favorite_sources",
};

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
