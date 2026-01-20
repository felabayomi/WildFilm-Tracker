export interface Film {
  id: string;
  title: string;
  year: number;
  runtime: number;
  director: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl?: string;
  category: FilmCategory;
  species: string[];
  locations: string[];
  conservationTheme?: string;
  source: string;
  whereToWatch: WatchSource[];
  rating?: number;
  isFeatured?: boolean;
  isNewRelease?: boolean;
}

export interface WatchSource {
  name: string;
  url: string;
  type: "rent" | "buy" | "stream" | "free" | "official";
}

export type FilmCategory =
  | "marine"
  | "safari"
  | "arctic"
  | "rainforest"
  | "birds"
  | "predators"
  | "mountains"
  | "desert";

export interface UserFilmData {
  filmId: string;
  isInWatchlist: boolean;
  isWatched: boolean;
  userRating?: number;
  userNotes?: string;
  watchedDate?: string;
  addedToWatchlistDate?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  filmIds: string[];
  imageUrl?: string;
}
