import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DOCUMENTARY_GENRE_ID = 99;

// Strict wildlife-only keywords (excludes general documentary keywords)
const WILDLIFE_KEYWORDS = [
  9902,    // wildlife
  211505,  // wildlife conservation
  4862,    // animal
  1402,    // ocean
  12554,   // safari
  14602,   // rainforest
  15162,   // polar
  9882,    // jungle
  167617,  // endangered species
].join("|"); // OR logic - matches films with any of these keywords

// Wildlife terms for text-based filtering
const WILDLIFE_TERMS = ['animal', 'wildlife', 'ocean', 'sea', 'marine', 'jungle', 'rainforest', 'safari', 'polar', 'arctic', 'elephant', 'lion', 'tiger', 'whale', 'dolphin', 'bird', 'fish', 'shark', 'bear', 'wolf', 'gorilla', 'chimpanzee', 'octopus', 'coral', 'reef', 'forest', 'nature', 'planet earth', 'conservation', 'endangered', 'species', 'predator', 'prey', 'ecosystem', 'serengeti', 'amazon', 'african', 'penguin', 'monkey', 'ape'];

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
      
      // Filter to ensure wildlife content
      const filteredResults = data.results.filter(movie => {
        const text = (movie.title + ' ' + movie.overview).toLowerCase();
        return WILDLIFE_TERMS.some(term => text.includes(term));
      });
      
      const films = filteredResults.map((movie) => ({
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
        totalResults: filteredResults.length,
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
      
      // Filter for documentaries AND wildlife content
      const wildlifeDocumentaries = data.results.filter(movie => {
        if (!movie.genre_ids.includes(DOCUMENTARY_GENRE_ID)) return false;
        const text = (movie.title + ' ' + movie.overview).toLowerCase();
        return WILDLIFE_TERMS.some(term => text.includes(term));
      });

      const films = wildlifeDocumentaries.map((movie) => ({
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

  // Get top-rated wildlife documentaries for Featured section
  app.get("/api/films/featured", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ 
        error: "TMDB API key not configured",
        message: "Add your TMDB API key to enable featured films"
      });
    }

    try {
      // Use STRICT wildlife-only keywords (no general nature/environment keywords)
      const STRICT_WILDLIFE_KEYWORDS = [
        9902,    // wildlife
        211505,  // wildlife conservation  
        4862,    // animal
        12554,   // safari
        1402,    // ocean
        14602,   // rainforest
        9882,    // jungle
        15162,   // polar
        167617,  // endangered species
      ].join("|");
      
      // Get top-rated wildlife documentaries with high vote counts
      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${DOCUMENTARY_GENRE_ID}&with_keywords=${STRICT_WILDLIFE_KEYWORDS}&sort_by=vote_average.desc&vote_count.gte=100&page=1`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data: TMDBResponse = await response.json();
      
      // Filter to ensure wildlife content - check title/synopsis for wildlife terms
      const filteredFilms = data.results.filter(movie => {
        const text = (movie.title + ' ' + movie.overview).toLowerCase();
        return WILDLIFE_TERMS.some(term => text.includes(term));
      });
      
      // Take top 6 highest-rated films
      const topFilms = filteredFilms.slice(0, 6);
      
      const films = topFilms.map((movie) => ({
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
        isFeatured: true,
      }));

      res.json({ films });
    } catch (error) {
      console.error("TMDB featured films error:", error);
      res.status(500).json({ error: "Failed to fetch featured films from TMDB" });
    }
  });

  app.post("/api/films/generate-share-summary", async (req: Request, res: Response) => {
    try {
      const { title, synopsis, streamingServices } = req.body;

      if (!title || !synopsis) {
        return res.status(400).json({ error: "Title and synopsis required" });
      }

      const streamingText = streamingServices?.length > 0 
        ? `Available on: ${streamingServices.join(", ")}`
        : "";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a social media copywriter for a wildlife film app. Create compelling, complete share text for films. Rules:
- Maximum 120 characters for the summary (excluding title)
- Must be a COMPLETE sentence, never end with "..."
- Make it emotionally engaging and create urgency to watch
- Focus on what makes this film special
- Use vivid, action-oriented language`
          },
          {
            role: "user",
            content: `Create a share summary for this wildlife film:
Title: ${title}
Synopsis: ${synopsis}

Return ONLY the summary text, nothing else.`
          }
        ],
        max_tokens: 60,
        temperature: 0.7,
      });

      const summary = response.choices[0]?.message?.content?.trim() || synopsis.substring(0, 100);

      res.json({ summary });
    } catch (error) {
      console.error("Error generating share summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Get film details by TMDB ID
  app.get("/api/films/tmdb/:tmdbId", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(503).json({ error: "TMDB API key not configured" });
    }

    try {
      const { tmdbId } = req.params;
      const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: "Film not found" });
        }
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const movie = await response.json();
      
      const film = {
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
        runtime: movie.runtime || 90,
        director: "Unknown",
        category: "marine",
        species: [],
        locations: [],
        whereToWatch: [],
        source: "TMDB",
        isFeatured: false,
        isNewRelease: false,
      };

      // Try to get director from credits
      try {
        const creditsUrl = `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${apiKey}`;
        const creditsResponse = await fetch(creditsUrl);
        if (creditsResponse.ok) {
          const credits = await creditsResponse.json();
          const director = credits.crew?.find((c: any) => c.job === "Director");
          if (director) {
            film.director = director.name;
          }
        }
      } catch (e) {
        // Ignore credits error
      }

      res.json({ film });
    } catch (error) {
      console.error("TMDB film details error:", error);
      res.status(500).json({ error: "Failed to fetch film details" });
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
