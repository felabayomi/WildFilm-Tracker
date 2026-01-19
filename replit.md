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

- `GET /api/films/discover` - Fetches wildlife & conservation documentaries
  - Filters by: wildlife, nature documentary, wildlife conservation, endangered species, safari, ocean, jungle, rainforest, polar
  - Returns: films with title, year, synopsis, poster, rating
  
- `GET /api/films/search?q=query` - Search documentaries by title

- `GET /api/films/:tmdbId/watch-providers` - Get streaming platforms for a film

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
