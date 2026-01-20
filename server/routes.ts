import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { Resend } from "resend";
import { db } from "./db";
import { filmSubmissions, insertFilmSubmissionSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

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
const WILDLIFE_TERMS = ['animal', 'wildlife', 'ocean', 'marine', 'jungle', 'rainforest', 'safari', 'polar', 'arctic', 'elephant', 'lion', 'tiger', 'whale', 'dolphin', 'shark', 'bear', 'gorilla', 'chimpanzee', 'octopus', 'coral', 'reef', 'nature', 'planet earth', 'conservation', 'endangered', 'predator', 'prey', 'ecosystem', 'serengeti', 'amazon', 'african', 'penguin', 'monkey', 'ape', 'wolves', 'birds', 'fish', 'species'];

// Check if text contains wildlife terms as standalone words (not part of names)
function hasWildlifeContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  // Check for obvious wildlife phrases first
  const wildlifePhrases = ['wildlife', 'wild life', 'nature documentary', 'animal', 'endangered species', 'conservation', 'ecosystem', 'habitat'];
  if (wildlifePhrases.some(phrase => lowerText.includes(phrase))) return true;
  
  // For animal names, use word boundaries to avoid matching person names like "Patrick Wolf"
  const animalPatterns = [
    /\bwolves?\b/, /\blions?\b/, /\btigers?\b/, /\bwhales?\b/, /\bdolphins?\b/, 
    /\belephants?\b/, /\bsharks?\b/, /\bbears?\b/, /\bgorillas?\b/, /\bpenguins?\b/,
    /\bchimpanzees?\b/, /\boctopus\b/, /\bseals?\b/, /\bjaguars?\b/, /\bpandas?\b/
  ];
  if (animalPatterns.some(pattern => pattern.test(lowerText))) return true;
  
  // Check for nature/wildlife terms
  const natureTerms = ['ocean', 'marine', 'jungle', 'rainforest', 'safari', 'polar', 'arctic', 'coral', 'reef', 'serengeti', 'amazon', 'african savanna'];
  return natureTerms.some(term => lowerText.includes(term));
}

// Valid regions for filtering
const VALID_REGIONS = [
  "North America",
  "South America", 
  "Canada",
  "Africa",
  "Antarctica",
  "Arctic",
  "Asia",
  "Australia",
  "Europe",
  "Pacific Ocean",
  "Atlantic Ocean",
  "Indian Ocean",
];

// AI-powered region detection from film details
async function detectRegionsWithAI(title: string, synopsis: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a wildlife documentary expert. Determine the geographic regions where this wildlife documentary was filmed or is primarily about.

Return regions from this EXACT list (use exact spelling):
- North America (USA, Mexico, Central America - wolves, grizzly bears, bison, cougars, bald eagles)
- Canada (Canadian wilderness - wolves, polar bears, moose, caribou)
- South America (Amazon, Andes, Galapagos - jaguars, sloths, macaws, piranhas)
- Africa (Serengeti, Congo, Sahara - lions, elephants, gorillas, rhinos, zebras)
- Antarctica (penguins, seals, whales near Antarctica)
- Arctic (polar bears, arctic foxes, walruses, narwhals)
- Asia (tigers, pandas, snow leopards, orangutans, elephants in India/China/Southeast Asia)
- Australia (kangaroos, koalas, Tasmanian devils, Great Barrier Reef)
- Europe (wolves returning to Europe, bears in Scandinavia, ibex in Alps)
- Pacific Ocean (coral reefs, whales, sharks, Hawaii, Polynesia)
- Atlantic Ocean (Caribbean marine life, Atlantic whales)
- Indian Ocean (Maldives, Seychelles marine life)

SPECIES-TO-REGION MAPPING (use this for detection):
- Wolves, grizzly bears, black bears, bison, moose, elk, cougars, bald eagles → North America AND/OR Canada
- Polar bears → Arctic AND/OR Canada
- Penguins, emperor penguins → Antarctica
- Lions, elephants, zebras, wildebeest, cheetahs, leopards, hippos, rhinos, gorillas → Africa
- Tigers, pandas, snow leopards, orangutans, komodo dragons → Asia
- Kangaroos, koalas, platypus, Tasmanian devils → Australia
- Jaguars, sloths, macaws, anacondas, piranhas → South America
- Whales, dolphins, sharks (in general) → Multiple ocean regions

Be generous with assignments - if a species is mentioned, include ALL regions where it lives.
Return JSON: {"regions": ["Region1", "Region2"]}
If truly uncertain, return {"regions": []}`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nSynopsis: ${synopsis || "No synopsis available"}`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const regions = parsed.regions || parsed.locations || [];
    
    // Filter to only valid regions
    const validRegions = regions.filter((r: string) => VALID_REGIONS.includes(r));
    console.log(`AI regions for "${title}": ${JSON.stringify(validRegions)}`);
    return validRegions;
  } catch (error) {
    console.error("AI region detection error:", error);
    return [];
  }
}

// Cache for AI region detection to avoid repeated API calls
// Cache is cleared on server restart to pick up prompt improvements
const regionCache = new Map<string, string[]>();

async function getRegionsForFilm(id: string, title: string, synopsis: string): Promise<string[]> {
  const cacheKey = `${id}`;
  if (regionCache.has(cacheKey)) {
    console.log(`Cache hit for "${title}": ${JSON.stringify(regionCache.get(cacheKey))}`);
    return regionCache.get(cacheKey)!;
  }
  
  const regions = await detectRegionsWithAI(title, synopsis);
  regionCache.set(cacheKey, regions);
  return regions;
}

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
      free?: Array<{ provider_name: string; logo_path: string }>;
      ads?: Array<{ provider_name: string; logo_path: string }>;
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
      
      // Filter to ensure wildlife content using smart matching
      const filteredResults = data.results.filter(movie => {
        return hasWildlifeContent(movie.overview || "");
      });
      
      // Use AI to detect regions for each film (with caching)
      const filmsWithRegions = await Promise.all(
        filteredResults.map(async (movie) => {
          const locations = await getRegionsForFilm(
            `tmdb-${movie.id}`,
            movie.title,
            movie.overview || ""
          );
          
          return {
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
            locations: locations,
          };
        })
      );

      res.json({
        films: filmsWithRegions,
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
      
      // Filter for documentaries with ACTUAL wildlife content
      // Uses smart matching to avoid false positives like person names
      const wildlifeDocumentaries = data.results.filter(movie => {
        if (!movie.genre_ids.includes(DOCUMENTARY_GENRE_ID)) return false;
        return hasWildlifeContent(movie.overview || "");
      });

      // Use AI to detect regions for each film (with caching)
      const films = await Promise.all(
        wildlifeDocumentaries.map(async (movie) => {
          const locations = await getRegionsForFilm(
            `tmdb-${movie.id}`,
            movie.title,
            movie.overview || ""
          );
          
          return {
            id: `tmdb-${movie.id}`,
            tmdbId: movie.id,
            title: movie.title,
            year: movie.release_date ? parseInt(movie.release_date.split("-")[0]) : 0,
            synopsis: movie.overview,
            posterUrl: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            rating: Math.round(movie.vote_average * 10) / 10,
            locations: locations,
          };
        })
      );

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
        ...(usProviders.free || []).map(p => ({ 
          name: p.provider_name, 
          type: "free",
          logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        })),
        ...(usProviders.ads || []).map(p => ({ 
          name: p.provider_name, 
          type: "free",
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

  // Get film trailers from TMDB
  app.get("/api/films/:tmdbId/videos", async (req: Request, res: Response) => {
    const apiKey = process.env.TMDB_API_KEY;
    const { tmdbId } = req.params;
    
    if (!apiKey) {
      return res.status(503).json({ error: "TMDB API key not configured" });
    }

    try {
      const url = `${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for YouTube trailers and teasers
      const videos = (data.results || [])
        .filter((v: any) => 
          v.site === "YouTube" && 
          (v.type === "Trailer" || v.type === "Teaser" || v.type === "Clip")
        )
        .map((v: any) => ({
          id: v.id,
          key: v.key,
          name: v.name,
          type: v.type,
          site: v.site,
        }))
        .slice(0, 5); // Limit to 5 videos
      
      res.json({ videos });
    } catch (error) {
      console.error("TMDB videos error:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
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
      
      // Filter to ensure wildlife content using smart matching
      const filteredFilms = data.results.filter(movie => {
        return hasWildlifeContent(movie.overview || "");
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
      
      // Use AI to detect regions
      const locations = await getRegionsForFilm(
        `tmdb-${movie.id}`,
        movie.title,
        movie.overview || ""
      );
      
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
        locations: locations,
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

  // Web-accessible Privacy Policy page for App Store submission
  app.get("/privacy", (_req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - WildFilms</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0D1F14; color: #E8E8E8; line-height: 1.7; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #D4AF37; font-size: 2.5rem; margin-bottom: 10px; }
    h2 { color: #1A4D2E; font-size: 1.5rem; margin: 30px 0 15px; border-bottom: 1px solid #2A5D3E; padding-bottom: 10px; }
    p { margin-bottom: 15px; color: #B8B8B8; }
    .date { color: #888; font-size: 0.9rem; margin-bottom: 30px; }
    ul { margin: 15px 0 15px 25px; color: #B8B8B8; }
    li { margin-bottom: 8px; }
    .contact { background: #1A2F1E; padding: 20px; border-radius: 10px; margin-top: 30px; }
    .contact a { color: #D4AF37; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="date">Last updated: January 2026</p>
    
    <h2>Introduction</h2>
    <p>WildFilms is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>
    
    <h2>Information We Collect</h2>
    <p>WildFilms collects minimal data to provide you with the best experience:</p>
    <ul>
      <li><strong>Local Data:</strong> Your watchlist, watched films, ratings, notes, and preferences are stored locally on your device only.</li>
      <li><strong>Profile Information:</strong> Any profile customization (name, bio, photo) is stored locally on your device.</li>
      <li><strong>Usage Data:</strong> We do not collect analytics or track your usage patterns.</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <p>All your data remains on your device. We use it solely to:</p>
    <ul>
      <li>Display your personalized watchlist and viewing history</li>
      <li>Remember your preferences and settings</li>
      <li>Show your ratings and notes on films</li>
    </ul>
    
    <h2>Third-Party Services</h2>
    <p>WildFilms uses The Movie Database (TMDB) API to fetch film information. TMDB's privacy policy applies to data they collect through their service. We do not share your personal data with TMDB or any other third parties.</p>
    
    <h2>Data Storage & Security</h2>
    <p>Your data is stored locally on your device using secure storage mechanisms. We do not transmit your personal data to external servers. No account or login is required to use WildFilms.</p>
    
    <h2>Your Rights</h2>
    <p>You have full control over your data:</p>
    <ul>
      <li>Clear your watch history at any time</li>
      <li>Clear your watchlist at any time</li>
      <li>Delete all app data through the app settings</li>
    </ul>
    
    <h2>Children's Privacy</h2>
    <p>WildFilms does not knowingly collect personal information from children under 13. The app is designed for general audiences interested in wildlife documentaries.</p>
    
    <h2>Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date.</p>
    
    <div class="contact">
      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at:</p>
      <p>Email: <a href="mailto:wildlifefilm@hotmail.com">wildlifefilm@hotmail.com</a></p>
    </div>
  </div>
</body>
</html>
    `);
  });

  // Web-accessible Support page for App Store submission
  app.get("/support", (_req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support - WildFilms</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0D1F14; color: #E8E8E8; line-height: 1.7; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #D4AF37; font-size: 2.5rem; margin-bottom: 30px; }
    h2 { color: #1A4D2E; font-size: 1.5rem; margin: 30px 0 15px; border-bottom: 1px solid #2A5D3E; padding-bottom: 10px; }
    p { margin-bottom: 15px; color: #B8B8B8; }
    .contact-box { background: #1A2F1E; padding: 25px; border-radius: 10px; margin: 20px 0; }
    .contact-box a { color: #D4AF37; font-size: 1.2rem; }
    .faq { background: #152518; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .faq h3 { color: #E8E8E8; font-size: 1.1rem; margin-bottom: 10px; }
    .faq p { margin-bottom: 0; }
    ul { margin: 15px 0 15px 25px; color: #B8B8B8; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>WildFilms Support</h1>
    
    <div class="contact-box">
      <h2 style="margin-top: 0; border: none;">Contact Us</h2>
      <p>Have questions or need help? We're here for you!</p>
      <p>Email: <a href="mailto:wildlifefilm@hotmail.com">wildlifefilm@hotmail.com</a></p>
      <p>We typically respond within 24-48 hours.</p>
    </div>
    
    <h2>Frequently Asked Questions</h2>
    
    <div class="faq">
      <h3>How do I add a film to my watchlist?</h3>
      <p>Open any film's details page and tap the "Save" button at the bottom. The film will be added to your Watchlist tab.</p>
    </div>
    
    <div class="faq">
      <h3>How do I mark a film as watched?</h3>
      <p>On the film details page, tap "Watched?" to mark it as seen. You can also rate the film using the star rating.</p>
    </div>
    
    <div class="faq">
      <h3>Where is my data stored?</h3>
      <p>All your data (watchlist, ratings, notes, preferences) is stored locally on your device. No account is required.</p>
    </div>
    
    <div class="faq">
      <h3>How do I clear my data?</h3>
      <p>Go to Profile → Preferences → Data Management. You can clear your watch history, watchlist, or all app data.</p>
    </div>
    
    <div class="faq">
      <h3>Why can't I find a specific wildlife film?</h3>
      <p>WildFilms focuses exclusively on wildlife and nature documentaries. Films are sourced from TMDB and filtered for conservation content. If a film isn't appearing, it may not be categorized as a wildlife documentary in our database.</p>
    </div>
    
    <h2>App Features</h2>
    <ul>
      <li><strong>Discover:</strong> Browse featured wildlife films and new releases</li>
      <li><strong>Search:</strong> Find films by title, category, or region</li>
      <li><strong>Watchlist:</strong> Save films to watch later</li>
      <li><strong>Film Details:</strong> View trailers, streaming options, and add personal notes</li>
      <li><strong>Profile:</strong> Track your watching stats and customize preferences</li>
    </ul>
    
    <h2>About WildFilms</h2>
    <p>WildFilms is dedicated to helping nature enthusiasts discover incredible wildlife documentaries from around the world. Our mission is to connect people with stories that inspire conservation and appreciation for our planet's biodiversity.</p>
    <p>Film data provided by <a href="https://www.themoviedb.org" style="color: #D4AF37;">The Movie Database (TMDB)</a>.</p>
  </div>
</body>
</html>
    `);
  });

  // Film submission API for filmmakers
  app.post("/api/submissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFilmSubmissionSchema.parse(req.body);
      
      const [submission] = await db.insert(filmSubmissions)
        .values(validatedData)
        .returning();
      
      // Send email notification to support
      try {
        // Send notification to support team
        await resend.emails.send({
          from: "WildFilms <onboarding@resend.dev>",
          to: "wildlifefilm@hotmail.com",
          subject: `New Film Submission: ${submission.title}`,
          html: `
            <h1>New Wildlife Film Submission</h1>
            <p>A new film has been submitted for review on WildFilms.</p>
            
            <h2>Film Details</h2>
            <ul>
              <li><strong>Title:</strong> ${submission.title}</li>
              <li><strong>Year:</strong> ${submission.year}</li>
              <li><strong>Category:</strong> ${submission.category}</li>
              <li><strong>Runtime:</strong> ${submission.runtime ? submission.runtime + ' minutes' : 'Not specified'}</li>
              <li><strong>Regions:</strong> ${submission.regions || 'Not specified'}</li>
              <li><strong>Species:</strong> ${submission.species || 'Not specified'}</li>
            </ul>
            
            <h2>Synopsis</h2>
            <p>${submission.synopsis}</p>
            
            <h2>Media Links</h2>
            <ul>
              <li><strong>Watch URL:</strong> <a href="${submission.watchUrl}">${submission.watchUrl}</a></li>
              ${submission.trailerUrl ? `<li><strong>Trailer:</strong> <a href="${submission.trailerUrl}">${submission.trailerUrl}</a></li>` : ''}
              ${submission.posterUrl ? `<li><strong>Poster:</strong> <a href="${submission.posterUrl}">${submission.posterUrl}</a></li>` : ''}
            </ul>
            
            <h2>Filmmaker Information</h2>
            <ul>
              <li><strong>Name:</strong> ${submission.filmmakerName}</li>
              <li><strong>Email:</strong> ${submission.filmmakerEmail}</li>
              ${submission.organization ? `<li><strong>Organization:</strong> ${submission.organization}</li>` : ''}
              ${submission.licenseType ? `<li><strong>License Type:</strong> ${submission.licenseType}</li>` : ''}
            </ul>
            
            <p><strong>Rights Confirmed:</strong> ${submission.hasRights ? 'Yes' : 'No'}</p>
            <p><strong>Submission ID:</strong> ${submission.id}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            
            <hr>
            <p style="color: #888; font-size: 12px;">This is an automated notification from WildFilms.</p>
          `,
        });
        console.log(`Admin notification sent for submission: ${submission.title}`);
        
        // Send confirmation email to filmmaker
        await resend.emails.send({
          from: "WildFilms <onboarding@resend.dev>",
          to: submission.filmmakerEmail,
          subject: `Your Film Submission Received - WildFilms`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0D1F14; color: #E8E8E8; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { color: #D4AF37; font-size: 28px; font-weight: bold; }
                .card { background-color: #1A2F1E; border-radius: 12px; padding: 30px; margin-bottom: 20px; }
                h1 { color: #D4AF37; font-size: 24px; margin-top: 0; }
                h2 { color: #1A4D2E; font-size: 18px; margin-top: 25px; border-bottom: 1px solid #2A5D3E; padding-bottom: 8px; }
                p { color: #B8B8B8; line-height: 1.6; }
                .highlight { color: #E8E8E8; font-weight: bold; }
                .details { background-color: #0D1F14; border-radius: 8px; padding: 15px; margin: 15px 0; }
                .details li { color: #B8B8B8; margin-bottom: 8px; }
                .details strong { color: #D4AF37; }
                ul { padding-left: 20px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #2A5D3E; }
                .footer a { color: #D4AF37; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">WildFilms</div>
                </div>
                
                <div class="card">
                  <h1>Thank You for Your Submission!</h1>
                  
                  <p>Hi <span class="highlight">${submission.filmmakerName}</span>,</p>
                  
                  <p>We've received your submission for <span class="highlight">"${submission.title}"</span> and it's now in our review queue. We're excited to learn more about your wildlife story!</p>
                  
                  <h2>What Happens Next</h2>
                  <ul>
                    <li>Our team will review your film within <strong>5-7 business days</strong></li>
                    <li>We'll notify you via email once a decision is made</li>
                    <li>If approved, your film will be featured in the WildFilms catalogue</li>
                  </ul>
                  
                  <h2>Your Submission Details</h2>
                  <div class="details">
                    <ul>
                      <li><strong>Title:</strong> ${submission.title}</li>
                      <li><strong>Year:</strong> ${submission.year}</li>
                      <li><strong>Category:</strong> ${submission.category}</li>
                      <li><strong>Submission ID:</strong> ${submission.id}</li>
                    </ul>
                  </div>
                  
                  <p>Keep this email for your records. You can reference your Submission ID if you need to contact us about your submission.</p>
                  
                  <p>Questions? Reply to this email or contact us at <a href="mailto:wildlifefilm@hotmail.com" style="color: #D4AF37;">wildlifefilm@hotmail.com</a></p>
                  
                  <p>Thank you for sharing your wildlife story with us!</p>
                  
                  <p style="margin-top: 25px;">— The WildFilms Team</p>
                </div>
                
                <div class="footer">
                  <p>This is an automated confirmation from WildFilms.</p>
                  <p>© ${new Date().getFullYear()} WildFilms. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Confirmation email sent to filmmaker: ${submission.filmmakerEmail}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the submission if email fails
      }
      
      res.status(201).json({
        success: true,
        message: "Your film has been submitted successfully! We'll review it and get back to you.",
        submission: {
          id: submission.id,
          title: submission.title,
          status: submission.status,
        }
      });
    } catch (error: any) {
      console.error("Film submission error:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Invalid submission data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: "Failed to submit film. Please try again."
      });
    }
  });

  // Get submission status by ID (for filmmakers to check their submission)
  app.get("/api/submissions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [submission] = await db.select()
        .from(filmSubmissions)
        .where(eq(filmSubmissions.id, id));
      
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      res.json({
        id: submission.id,
        title: submission.title,
        status: submission.status,
        submittedAt: submission.submittedAt,
        reviewNotes: submission.reviewNotes,
      });
    } catch (error) {
      console.error("Get submission error:", error);
      res.status(500).json({ error: "Failed to fetch submission" });
    }
  });

  // Categories available for film submissions
  app.get("/api/submissions/categories", (_req: Request, res: Response) => {
    res.json({
      categories: [
        { id: "marine", label: "Marine & Ocean Life" },
        { id: "safari", label: "Safari & Savanna" },
        { id: "rainforest", label: "Rainforest & Jungle" },
        { id: "arctic", label: "Arctic & Polar" },
        { id: "birds", label: "Birds & Avian" },
        { id: "primates", label: "Primates & Great Apes" },
        { id: "predators", label: "Predators & Hunters" },
        { id: "conservation", label: "Conservation & Endangered" },
        { id: "insects", label: "Insects & Invertebrates" },
        { id: "freshwater", label: "Freshwater & Rivers" },
      ],
      regions: [
        "North America",
        "South America",
        "Canada",
        "Africa",
        "Antarctica",
        "Arctic",
        "Asia",
        "Australia",
        "Europe",
        "Pacific Ocean",
        "Atlantic Ocean",
        "Indian Ocean",
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
