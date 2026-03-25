# WildFilms - Wildlife Film Database & Tracker

## Overview
WildFilms is a React Native/Expo mobile app for discovering, cataloging, and tracking specialized wildlife films and nature documentaries from independent sources, film festivals, and conservation organizations.

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Backend**: Express.js (for future API expansion)
- **Storage**: AsyncStorage for local persistence
- **Navigation**: React Navigation 7+ with bottom tabs
- **Styling**: Custom design system with Playfair Display fonts
- **State Management**: React Query + custom hooks

## Project Structure
```
client/
├── App.tsx                    # Main app with fonts and providers
├── components/               # Reusable UI components
│   ├── Button.tsx           # Animated button component
│   ├── Card.tsx             # Card with elevation
│   ├── CategoryChip.tsx     # Category selection chip
│   ├── EmptyState.tsx       # Empty state with illustrations
│   ├── FilmCard.tsx         # Horizontal film card
│   ├── FilmPoster.tsx       # Film poster component
│   ├── FilterChip.tsx       # Filter chip for search
│   ├── HeaderTitle.tsx      # Custom header with app logo
│   ├── RatingStars.tsx      # Interactive star rating
│   ├── SearchInput.tsx      # Search input field
│   ├── SectionHeader.tsx    # Section header with see all
│   └── SkeletonLoader.tsx   # Loading skeleton components
├── constants/
│   └── theme.ts             # Colors, spacing, typography
├── data/
│   └── films.ts             # Sample film data
├── hooks/
│   ├── useFilmData.ts       # Film data management hook
│   ├── useScreenOptions.ts  # Navigation screen options
│   └── useTheme.ts          # Theme hook
├── lib/
│   ├── query-client.ts      # React Query client
│   └── storage.ts           # AsyncStorage utilities
├── navigation/
│   ├── DiscoverStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   ├── RootStackNavigator.tsx
│   ├── SearchStackNavigator.tsx
│   └── WatchlistStackNavigator.tsx
├── screens/
│   ├── CategoryFilmsScreen.tsx
│   ├── CollectionScreen.tsx
│   ├── DiscoverScreen.tsx
│   ├── FilmDetailsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SearchScreen.tsx
│   └── WatchlistScreen.tsx
└── types/
    └── film.ts              # TypeScript types
```

## Features
- **Discover**: Browse featured films, new releases, categories, and collections
- **Search**: Filter by category, region, source with full-text search
- **Watchlist**: Save films to watch later with persistent storage
- **Film Details**: View synopsis, species, locations, where to watch, and rate films
- **Profile**: View watch history, stats, and settings

## Design
- Cinematic dark theme with deep forest green (#1A4D2E) and gold (#D4AF37) accents
- Playfair Display font for titles, system fonts for body text
- Premium, editorial aesthetic inspired by film festival programs

## Running the App
- Frontend runs on port 8081 (Expo)
- Backend runs on port 5000 (Express)

## API Endpoints
The backend provides TMDB integration for wildlife films:

- `GET /api/films/discover` - Fetches popular wildlife & conservation documentaries
  - Sorted by: popularity descending
  - Filters by: wildlife, nature documentary, wildlife conservation, endangered species, safari, ocean, jungle, rainforest, polar
  - Returns: films with title, year, synopsis, poster, rating

- `GET /api/films/new-releases` - Fetches recently released wildlife documentaries (last 18 months)
  - Sorted by: primary_release_date descending
  - Same wildlife keyword filters as discover
  - Returns: up to 10 films with releaseDate field

- `GET /api/films/featured` - Top-rated wildlife documentaries (vote_average.desc, vote_count >= 100)
  
- `GET /api/films/search?q=query` - Search documentaries by title

- `GET /api/films/:tmdbId/watch-providers` - Get streaming platforms for a film (includes subscription, free, ad-supported, rent, and buy options)

- `GET /api/status` - Check API status and TMDB configuration

## Features Added
- **Share Button**: Film details screen has a share button to share films to any app (Messages, WhatsApp, Twitter, etc.)
- **TMDB Integration**: Backend connected to TMDB API for automatic wildlife film updates
- **Wildlife Filtering**: API filters for conservation/nature content using specific keywords
- **Profile Customization**: Edit name, bio, and upload custom profile photo
- **Preferences Modal**: Dark mode toggle with actual theme switching (light/dark), and data management options
- **Data Management**: Clear watch history, clear watchlist, or clear all app data
- **Film Tracking**: Films Watched count, Time Logged (hours), and Average Rating update dynamically
- **Push Notifications**: Dedicated Notifications screen with push notification settings for new films and watchlist reminders
- **Privacy Screen**: Privacy policy, terms of service, and data usage documentation
- **Help & Support Screen**: App usage guide, FAQ section, and contact email (wildlifefilm@hotmail.com)
- **Manual Watch Links**: Add your own verified streaming/purchase links for films when TMDB doesn't have them (e.g., Fandango, regional services). Links are stored locally with type (stream/rent/buy/free) and can be removed.
- **About WildFilms Screen**: App info, version, features highlight, TMDB attribution, and support contact
- **Film Trailers**: Watch trailers and videos directly from film details via YouTube integration
- **Personal Notes**: Add and edit private notes/reviews on any film, stored locally per film
- **Favorite Species**: Follow species by tapping chips - favorites persist across app sessions
- **Filmmaker Submission Portal**: Content creators can submit their wildlife films for review via Profile → Submit Your Film. Submissions include film details, media links, filmmaker info, and rights confirmation. Stored in PostgreSQL database with pending/approved/rejected status. Email notifications sent to wildlifefilm@hotmail.com via Resend when new films are submitted.
- **Monetization Support**: Filmmakers can set rental/purchase prices and provide Stripe Payment Links when selecting rent/buy availability. Includes step-by-step guidance for setting up Stripe accounts and payment links. All payments go directly to filmmakers - no commission.

## Database Schema
- **film_submissions**: Stores filmmaker-submitted content (title, year, synopsis, runtime, category, regions, species, poster/trailer/watch URLs, availability types, streaming service, rent/buy prices, Stripe payment link, filmmaker info, rights verification, status, timestamps)

## Submission API Endpoints
- `POST /api/submissions` - Submit a new film for review
- `GET /api/submissions/:id` - Check submission status
- `GET /api/submissions/categories` - Get available categories and regions

## Production Deployment

The app is configured for seamless development-to-production deployment:

### Environment Configuration
- **TMDB_API_KEY**: Stored as a secret (available in both development and production)
- **OpenAI Integration**: Uses Replit's managed AI credentials (auto-configured)
- **CORS**: Server uses `REPLIT_DOMAINS` environment variable (includes production domain automatically)
- **API URLs**: All client API calls use dynamic `EXPO_PUBLIC_DOMAIN` (no hardcoded URLs)

### Build Process
- **Static Build**: `scripts/build.js` generates static bundles for iOS and Android
- **Domain Detection**: Build script uses `REPLIT_INTERNAL_APP_DOMAIN` for production builds
- **Manifests**: Generated with correct production URLs for Expo Go deep linking

### Platforms Supported
- **Web App**: Runs at production `.replit.app` domain
- **Expo Go (iOS/Android)**: Scan QR code from landing page to load app
- **Native Builds**: Can be extended for App Store/Play Store with EAS Build
