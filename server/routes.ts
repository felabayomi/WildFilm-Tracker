import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DOCUMENTARY_GENRE_ID = 99;

const WILDLIFE_KEYWORDS = [
  9902,    // wildlife
  211505,  // wildlife conservation
  221355,  // nature documentary
  211504,  // wildlife reserve
  167617,  // endangered species
  6917,    // nature
  4862,    // animal
  1402,    // ocean
  12554,   // safari
  10683,   // survival
  33965,   // environment
  14602,   // rainforest
  15162,   // polar
  9882,    // jungle
].join("|"); // OR logic - matches films with any of these keywords

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface TMDBWatchProviders {
  results?: {
    US?: {
      flatrate?: Array<{ provider_name: string; logo_path: string }>;
      rent?: Array<{ provider_name: string; logo_path: string }>;
      buy?: Array<{ provider_name: string; logo_path: string }>;
      link?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/films/discover", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ 
        error: "TMDB API key not configured",
        message: "Add your TMDB API key to enable automatic film discovery"
      });
    }

    try {
      const page = req.query.page || 1;
      
      // Filter for wildlife, nature, and conservation documentaries only
      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${DOCUMENTARY_GENRE_ID}&with_keywords=${WILDLIFE_KEYWORDS}&sort_by=popularity.desc&page=${page}&vote_count.gte=10`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data: TMDBResponse = await response.json();
      
      const films = data.results.map((movie) => ({
        id: `tmdb-${movie.id}`,
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split("-")[0]) : 0,
        synopsis: movie.overview,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        backdropUrl: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : null,
        rating: Math.round(movie.vote_average * 10) / 10,
        voteCount: movie.vote_count,
      }));

      res.json({
        films,
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      });
    } catch (error) {
      console.error("TMDB API error:", error);
      res.status(500).json({ error: "Failed to fetch films from TMDB" });
    }
  });

  app.get("/api/films/search", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ 
        error: "TMDB API key not configured"
      });
    }

    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }

      const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data: TMDBResponse = await response.json();
      
      const documentaries = data.results.filter(movie => 
        movie.genre_ids.includes(DOCUMENTARY_GENRE_ID)
      );

      const films = documentaries.map((movie) => ({
        id: `tmdb-${movie.id}`,
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split("-")[0]) : 0,
        synopsis: movie.overview,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        rating: Math.round(movie.vote_average * 10) / 10,
      }));

      res.json({ films });
    } catch (error) {
      console.error("TMDB search error:", error);
      res.status(500).json({ error: "Failed to search films" });
    }
  });

  app.get("/api/films/:tmdbId/watch-providers", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ error: "TMDB API key not configured" });
    }

    try {
      const { tmdbId } = req.params;
      const url = `${TMDB_BASE_URL}/movie/${tmdbId}/watch/providers?api_key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data: TMDBWatchProviders = await response.json();
      const usProviders = data.results?.US;

      if (!usProviders) {
        return res.json({ providers: [], link: null });
      }

      const providers = [
        ...(usProviders.flatrate || []).map(p => ({ 
          name: p.provider_name, 
          type: "stream",
          logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        })),
        ...(usProviders.rent || []).map(p => ({ 
          name: p.provider_name, 
          type: "rent",
          logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        })),
        ...(usProviders.buy || []).map(p => ({ 
          name: p.provider_name, 
          type: "buy",
          logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        })),
      ];

      res.json({ 
        providers,
        link: usProviders.link || null
      });
    } catch (error) {
      console.error("TMDB watch providers error:", error);
      res.status(500).json({ error: "Failed to fetch watch providers" });
    }
  });

  app.get("/api/status", (_req: Request, res: Response) => {
    res.json({ 
      status: "ok",
      tmdbConfigured: !!process.env.TMDB_API_KEY,
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
