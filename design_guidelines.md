# WildFilms - Design Guidelines

## Brand Identity

**Purpose**: A premium catalog for wildlife film enthusiasts to discover, track, and support independent nature documentaries and conservation storytelling.

**Aesthetic Direction**: *Luxurious Editorial* - Think National Geographic meets film festival program. High-quality imagery takes center stage with sophisticated typographic hierarchy, generous whitespace, and refined material textures. The app should feel like curating a personal film collection, not browsing a generic streaming service.

**Memorable Element**: Full-bleed film poster imagery with subtle parallax scrolling creates an immersive, cinematic browsing experience. Each film poster is treated like fine art.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs + floating action)

**Screens**:
1. **Discover** (Tab 1) - Browse films, featured collections, categories
2. **Search** (Tab 2) - Advanced filtering by species, region, filmmaker, topic
3. **Watchlist** (Tab 3) - Saved films to watch later
4. **Profile** (Tab 4) - Viewing history, ratings, account settings
5. **Film Details** (Modal from any screen) - Full film information
6. **Add to Watchlist** (Floating Action Button) - Quick-save from anywhere
7. **Login/Signup** (Stack) - Apple/Google SSO for syncing across devices

## Screen-by-Screen Specifications

### 1. Discover Screen
- **Header**: Transparent with app logo (left), filter icon (right)
- **Layout**: Vertical scroll with sections
  - Hero section: Featured film with full-bleed poster, gradient overlay, title
  - "New Releases" horizontal scroll of film posters
  - "Categories" grid (Marine, Safari, Arctic, Rainforest, Birds, Predators)
  - "Award Winners" collection
  - "Conservation Focus" curated lists
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Empty State**: If database is empty (admin only scenario)

### 2. Search Screen
- **Header**: Custom with large search bar, cancel button
- **Layout**: Scrollable form with filter chips
  - Search input (species, title, filmmaker)
  - Filter sections: Animal/Species, Region, Topic, Year Range, Festival
  - Results list (film poster thumbnails with title, year, rating)
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Empty State**: "No films match your search" illustration when results are empty

### 3. Watchlist Screen
- **Header**: Default navigation header, "Watchlist" title, sort icon (right)
- **Layout**: Vertical list of saved films
  - Film poster thumbnail, title, year, progress indicator
  - Swipe actions: Mark watched, Remove
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl
- **Empty State**: "Your watchlist is empty" illustration (binoculars looking into distance)

### 4. Profile Screen
- **Header**: Transparent with settings icon (right)
- **Layout**: Vertical scroll
  - User avatar and name
  - Stats: Films watched, Hours logged, Favorite species
  - "Watch History" section (recent films)
  - "My Ratings" section
  - Settings: Account, Notifications, Sources to Follow, Privacy Policy, Log Out
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### 5. Film Details (Modal)
- **Header**: Transparent with close button (left), share icon (right)
- **Layout**: Vertical scroll
  - Full-screen poster with gradient overlay
  - Title, year, runtime, director
  - Synopsis
  - Featured species chips
  - Filming locations
  - Conservation theme badge
  - "Where to Watch" links (purchase, rent, official sites)
  - Trailer player (if available)
  - User rating widget
  - "Add to Watchlist" button (fixed at bottom)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Floating**: "Add to Watchlist" button with drop shadow

### 6. Login Screen (Stack)
- **Header**: None
- **Layout**: Centered vertical content
  - App logo
  - Tagline: "Discover wildlife films that matter"
  - Apple Sign-In button
  - Google Sign-In button
  - Privacy Policy & Terms links
- **Safe Area**: Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl

## Color Palette

**Primary**: #1A4D2E (Deep Forest Green) - Conservation, nature, premium
**Accent**: #D4AF37 (Gold) - Awards, highlights, premium touches
**Background**: #0D0D0D (Near Black) - Cinematic dark theme
**Surface**: #1A1A1A (Charcoal) - Cards, elevated elements
**Surface Variant**: #2A2A2A (Lighter Charcoal) - Secondary cards
**Text Primary**: #FFFFFF (White)
**Text Secondary**: #B8B8B8 (Light Gray)
**Success**: #4CAF50 (Watched status)
**Warning**: #FF9800 (Expiring access)

## Typography

**Display Font**: Playfair Display (film titles, headers) - Luxurious, editorial
**Body Font**: SF Pro Text (iOS) / Roboto (Android) - Legible, professional

**Type Scale**:
- Hero Title: Playfair Display, 34pt, Bold
- Screen Title: Playfair Display, 28pt, Bold
- Card Title: Playfair Display, 20pt, SemiBold
- Body Large: System, 17pt, Regular
- Body: System, 15pt, Regular
- Caption: System, 13pt, Regular

## Visual Design

- **Film Posters**: Full-bleed with 16:9 aspect ratio, subtle gradient overlays for text legibility
- **Cards**: Background color Surface (#1A1A1A), 12pt corner radius, no shadow
- **Floating Buttons**: Primary color, drop shadow (offset: 0,2, opacity: 0.10, radius: 2)
- **Icons**: Feather icons in white/gold
- **Touchable Feedback**: 60% opacity on press
- **Category Chips**: Surface Variant background, rounded pill shape, 8pt padding

## Assets to Generate

1. **icon.png** - App icon featuring binoculars silhouette with forest/mountain backdrop
2. **splash-icon.png** - Simplified version of app icon for launch screen
3. **empty-watchlist.png** - Illustration of binoculars looking at horizon, muted gold/green palette - **Used in**: Watchlist screen when no films saved
4. **empty-search.png** - Illustration of magnifying glass with nature elements, muted palette - **Used in**: Search screen when no results found
5. **avatar-default.png** - Circular avatar with nature silhouette (tree, mountain, or animal) - **Used in**: Profile screen default avatar
6. **hero-wildlife.png** - Abstract nature pattern for onboarding/welcome - **Used in**: Login screen background