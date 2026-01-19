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
