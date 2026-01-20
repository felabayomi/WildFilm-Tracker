import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Share,
  Platform,
  ActivityIndicator,
  TextInput,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { useWatchProviders } from "@/hooks/useWatchProviders";
import { getApiUrl } from "@/lib/query-client";
import { 
  getFavoriteSpecies, 
  toggleFavoriteSpecies, 
  updateUserNotes,
  getManualWatchLinks,
  addManualWatchLink,
  removeManualWatchLink,
  ManualWatchLink,
} from "@/lib/storage";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RatingStars } from "@/components/RatingStars";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Film } from "@/types/film";

interface VideoInfo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type FilmDetailsRouteProp = RouteProp<RootStackParamList, "FilmDetails">;

export default function FilmDetailsScreen() {
  const route = useRoute<FilmDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { filmId } = route.params;

  const {
    getFilmById,
    getFilmUserData,
    isInWatchlist,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    markAsWatched,
    updateRating,
  } = useFilms();

  const localFilm = getFilmById(filmId);
  const userData = getFilmUserData(filmId);
  const inWatchlist = isInWatchlist(filmId);
  const watched = isWatched(filmId);
  
  const [tmdbFilm, setTmdbFilm] = useState<Film | null>(null);
  const [isLoadingTMDB, setIsLoadingTMDB] = useState(false);
  const [tmdbError, setTmdbError] = useState(false);
  const [userRating, setUserRating] = useState(userData?.userRating || 0);
  const [userNotes, setUserNotes] = useState(userData?.userNotes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [favoriteSpeciesList, setFavoriteSpeciesList] = useState<string[]>([]);
  const [manualLinks, setManualLinks] = useState<ManualWatchLink[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTypes, setNewLinkTypes] = useState<Set<'stream' | 'rent' | 'buy' | 'free'>>(new Set(['rent']));
  
  // Get watch providers from TMDB API
  const { providers: realProviders, isLoading: providersLoading } = useWatchProviders(filmId);

  // Fetch TMDB film details if local film not found and ID starts with "tmdb-"
  useEffect(() => {
    if (!localFilm && filmId.startsWith("tmdb-")) {
      const tmdbId = filmId.replace("tmdb-", "");
      setIsLoadingTMDB(true);
      setTmdbError(false);
      
      const fetchTMDBFilm = async () => {
        try {
          const baseUrl = getApiUrl();
          const url = new URL(`/api/films/tmdb/${tmdbId}`, baseUrl);
          const response = await fetch(url.toString());
          
          if (response.ok) {
            const data = await response.json();
            setTmdbFilm(data.film);
          } else {
            setTmdbError(true);
          }
        } catch (error) {
          console.error("Error fetching TMDB film:", error);
          setTmdbError(true);
        } finally {
          setIsLoadingTMDB(false);
        }
      };
      
      fetchTMDBFilm();
    }
  }, [filmId, localFilm]);

  // Fetch videos/trailers for TMDB films
  useEffect(() => {
    if (filmId.startsWith("tmdb-")) {
      const tmdbId = filmId.replace("tmdb-", "");
      const fetchVideos = async () => {
        try {
          const baseUrl = getApiUrl();
          const url = new URL(`/api/films/${tmdbId}/videos`, baseUrl);
          const response = await fetch(url.toString());
          if (response.ok) {
            const data = await response.json();
            setVideos(data.videos || []);
          }
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      };
      fetchVideos();
    }
  }, [filmId]);

  // Load favorite species
  useEffect(() => {
    const loadFavoriteSpecies = async () => {
      const species = await getFavoriteSpecies();
      setFavoriteSpeciesList(species);
    };
    loadFavoriteSpecies();
  }, []);

  // Load manual watch links
  useEffect(() => {
    const loadManualLinks = async () => {
      const links = await getManualWatchLinks(filmId);
      setManualLinks(links);
    };
    loadManualLinks();
  }, [filmId]);

  const film = localFilm || tmdbFilm;
  const watchProviders = realProviders;

  // All hooks must be called before any conditional returns
  const handleWatchlistToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inWatchlist) {
      await removeFromWatchlist(filmId);
    } else {
      await addToWatchlist(filmId, film || undefined);
    }
  }, [inWatchlist, filmId, film, addToWatchlist, removeFromWatchlist]);

  const handleMarkWatched = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markAsWatched(filmId, userRating, undefined, film || undefined);
  }, [filmId, userRating, film, markAsWatched]);

  const handleRatingChange = useCallback(async (rating: number) => {
    setUserRating(rating);
    await updateRating(filmId, rating);
  }, [filmId, updateRating]);

  const handleSaveNotes = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateUserNotes(filmId, userNotes);
    setIsEditingNotes(false);
  }, [filmId, userNotes]);

  const handleToggleSpecies = useCallback(async (species: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isNowFavorite = await toggleFavoriteSpecies(species);
    if (isNowFavorite) {
      setFavoriteSpeciesList(prev => [...prev, species]);
    } else {
      setFavoriteSpeciesList(prev => prev.filter(s => s.toLowerCase() !== species.toLowerCase()));
    }
  }, []);

  const handleWatchTrailer = useCallback(async (videoKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;
    if (Platform.OS === 'web') {
      window.open(youtubeUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(youtubeUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    }
  }, []);

  const isSpeciesFollowed = useCallback((species: string) => {
    return favoriteSpeciesList.some(s => s.toLowerCase() === species.toLowerCase());
  }, [favoriteSpeciesList]);

  const handleAddManualLink = useCallback(async () => {
    if (!newLinkName.trim() || !newLinkUrl.trim() || newLinkTypes.size === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const typesArray = Array.from(newLinkTypes);
      const typeLabel = typesArray.length > 1 
        ? typesArray.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join('/')
        : typesArray[0];
      const link = await addManualWatchLink({
        filmId,
        name: newLinkName.trim(),
        url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
        type: typesArray[0],
      });
      setManualLinks(prev => [...prev, link]);
      setNewLinkName("");
      setNewLinkUrl("");
      setNewLinkTypes(new Set(['rent']));
      setIsAddingLink(false);
    } catch (error) {
      console.error("Error adding manual link:", error);
    }
  }, [filmId, newLinkName, newLinkUrl, newLinkTypes]);

  const toggleLinkType = useCallback((type: 'stream' | 'rent' | 'buy' | 'free') => {
    setNewLinkTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const handleRemoveManualLink = useCallback(async (linkId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await removeManualWatchLink(linkId);
    setManualLinks(prev => prev.filter(l => l.id !== linkId));
  }, []);

  const handleWatchSourcePress = useCallback(async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: Colors.dark.accent,
      });
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!film) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    let summary = "";
    
    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/films/generate-share-summary", baseUrl);
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: film.title,
          synopsis: film.synopsis,
          streamingServices: watchProviders.filter(s => s.type === "stream").map(s => s.name),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        summary = data.summary;
      }
    } catch (error) {
      console.log("AI summary generation failed, using fallback:", error);
    }
    
    if (!summary) {
      summary = film.synopsis.length > 100 
        ? `${film.synopsis.substring(0, 97)}...` 
        : film.synopsis;
    }
    
    let shareMessage = `Check out "${film.title}" - ${summary}`;
    
    const streamingSources = watchProviders.filter(s => s.type === "stream");
    if (streamingSources.length > 0) {
      const serviceNames = streamingSources.map(s => `@${s.name.replace(/\s+/g, '')}`).join(', ');
      shareMessage += `\n\nStreaming on: ${serviceNames}`;
    } else if (watchProviders.length > 0) {
      const serviceName = watchProviders[0].name;
      if (serviceName !== "View Options" && serviceName !== "Find Streaming") {
        shareMessage += `\n\nAvailable on: @${serviceName.replace(/\s+/g, '')}`;
      }
    }
    
    shareMessage += `\n\nFind where to watch any wildlife movie or show with WildFilms: https://wildfilms.app`;

    try {
      await Share.share({
        message: shareMessage,
        title: film.title,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  }, [film, watchProviders]);

  // Conditional returns AFTER all hooks
  if (isLoadingTMDB) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={{ marginTop: Spacing.md, color: Colors.dark.textSecondary }}>
          Loading film details...
        </ThemedText>
      </View>
    );
  }

  if (!film || tmdbError) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ThemedText>Film not found</ThemedText>
      </View>
    );
  }

  const SpeciesChip = ({ species }: { species: string }) => {
    const isFollowed = isSpeciesFollowed(species);
    return (
      <Pressable
        style={[styles.speciesChip, isFollowed && styles.speciesChipFollowed]}
        onPress={() => handleToggleSpecies(species)}
      >
        <Feather 
          name={isFollowed ? "heart" : "plus"} 
          size={14} 
          color={isFollowed ? Colors.dark.primary : Colors.dark.accent} 
        />
        <ThemedText style={[styles.speciesText, isFollowed && styles.speciesTextFollowed]}>
          {species}
        </ThemedText>
      </Pressable>
    );
  };

  const LocationChip = ({ location }: { location: string }) => (
    <View style={styles.locationChip}>
      <Feather name="map-pin" size={14} color={Colors.dark.primary} />
      <ThemedText style={styles.locationText}>{location}</ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: film.posterUrl }}
            style={styles.poster}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", theme.backgroundRoot]}
            style={styles.posterGradient}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{film.title}</ThemedText>
            <View style={styles.metaRow}>
              <ThemedText style={styles.meta}>{film.year}</ThemedText>
              <View style={styles.metaDot} />
              <ThemedText style={styles.meta}>{film.runtime} min</ThemedText>
              {film.rating ? (
                <>
                  <View style={styles.metaDot} />
                  <Feather name="star" size={14} color={Colors.dark.accent} />
                  <ThemedText style={styles.ratingText}>
                    {film.rating.toFixed(1)}
                  </ThemedText>
                </>
              ) : null}
            </View>
            <ThemedText style={styles.director}>
              Directed by {film.director}
            </ThemedText>
          </View>

          {film.conservationTheme ? (
            <View style={styles.conservationBadge}>
              <Feather name="heart" size={16} color={Colors.dark.primary} />
              <ThemedText style={styles.conservationText}>
                {film.conservationTheme}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Synopsis</ThemedText>
            <ThemedText style={styles.synopsis}>{film.synopsis}</ThemedText>
          </View>

          {videos.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Trailers & Videos</ThemedText>
              <View style={styles.videosContainer}>
                {videos.map((video) => (
                  <Pressable
                    key={video.id}
                    style={({ pressed }) => [
                      styles.videoButton,
                      pressed && styles.videoButtonPressed,
                    ]}
                    onPress={() => handleWatchTrailer(video.key)}
                  >
                    <View style={styles.videoIcon}>
                      <Feather name="play" size={20} color={Colors.dark.accent} />
                    </View>
                    <View style={styles.videoInfo}>
                      <ThemedText style={styles.videoName} numberOfLines={1}>
                        {video.name}
                      </ThemedText>
                      <ThemedText style={styles.videoType}>{video.type}</ThemedText>
                    </View>
                    <Feather name="external-link" size={16} color={Colors.dark.textSecondary} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {film.species.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Featured Species</ThemedText>
              <View style={styles.chipContainer}>
                {film.species.map((species) => (
                  <SpeciesChip key={species} species={species} />
                ))}
              </View>
            </View>
          ) : null}

          {film.locations.length > 0 ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Filming Locations</ThemedText>
              <View style={styles.chipContainer}>
                {film.locations.map((location) => (
                  <LocationChip key={location} location={location} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Source</ThemedText>
            <View style={styles.sourceContainer}>
              <Feather name="award" size={18} color={Colors.dark.accent} />
              <ThemedText style={styles.sourceText}>{film.source}</ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Where to Watch</ThemedText>
            {providersLoading ? (
              <ThemedText style={styles.loadingText}>Loading streaming options...</ThemedText>
            ) : watchProviders.length > 0 || manualLinks.length > 0 ? (
              <View style={styles.watchSourcesContainer}>
                {watchProviders.map((source, index) => (
                  <Pressable
                    key={`provider-${index}`}
                    style={({ pressed }) => [
                      styles.watchSourceButton,
                      pressed && styles.watchSourceButtonPressed,
                    ]}
                    onPress={() => handleWatchSourcePress(source.url)}
                  >
                    <Feather
                      name={
                        source.type === "stream"
                          ? "play-circle"
                          : source.type === "free"
                          ? "gift"
                          : source.type === "rent"
                          ? "shopping-cart"
                          : source.type === "buy"
                          ? "shopping-bag"
                          : "external-link"
                      }
                      size={18}
                      color={Colors.dark.accent}
                    />
                    <ThemedText style={styles.watchSourceLabel}>
                      {source.name}
                    </ThemedText>
                    <Feather
                      name="external-link"
                      size={14}
                      color={Colors.dark.textSecondary}
                    />
                  </Pressable>
                ))}
                {manualLinks.map((link) => (
                  <View key={link.id} style={styles.manualLinkRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.watchSourceButton,
                        styles.manualLinkButton,
                        pressed && styles.watchSourceButtonPressed,
                      ]}
                      onPress={() => handleWatchSourcePress(link.url)}
                    >
                      <Feather
                        name={
                          link.type === "stream"
                            ? "play-circle"
                            : link.type === "rent"
                            ? "shopping-cart"
                            : link.type === "buy"
                            ? "shopping-bag"
                            : "gift"
                        }
                        size={18}
                        color={Colors.dark.accent}
                      />
                      <ThemedText style={styles.watchSourceLabel}>
                        {link.name}
                      </ThemedText>
                      <Feather
                        name="external-link"
                        size={14}
                        color={Colors.dark.textSecondary}
                      />
                    </Pressable>
                    {__DEV__ ? (
                      <Pressable
                        style={styles.removeLinkButton}
                        onPress={() => handleRemoveManualLink(link.id)}
                      >
                        <Feather name="x" size={16} color={Colors.dark.error} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.noProvidersText}>
                No streaming options found for your region
              </ThemedText>
            )}

            {isAddingLink ? (
              <View style={styles.addLinkForm}>
                <TextInput
                  style={styles.linkInput}
                  value={newLinkName}
                  onChangeText={setNewLinkName}
                  placeholder="Service name (e.g., Fandango)"
                  placeholderTextColor={Colors.dark.textSecondary}
                />
                <TextInput
                  style={styles.linkInput}
                  value={newLinkUrl}
                  onChangeText={setNewLinkUrl}
                  placeholder="URL (e.g., athome.fandango.com/...)"
                  placeholderTextColor={Colors.dark.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <ThemedText style={styles.linkTypeLabel}>Select type(s):</ThemedText>
                <View style={styles.linkTypeRow}>
                  {(['stream', 'rent', 'buy', 'free'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.linkTypeChip,
                        newLinkTypes.has(type) && styles.linkTypeChipActive,
                      ]}
                      onPress={() => toggleLinkType(type)}
                    >
                      <ThemedText
                        style={[
                          styles.linkTypeText,
                          newLinkTypes.has(type) && styles.linkTypeTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.addLinkButtonRow}>
                  <Pressable
                    style={styles.cancelLinkButton}
                    onPress={() => {
                      setIsAddingLink(false);
                      setNewLinkName("");
                      setNewLinkUrl("");
                      setNewLinkTypes(new Set(['rent']));
                    }}
                  >
                    <ThemedText style={styles.cancelLinkText}>Cancel</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.saveLinkButton,
                      (!newLinkName.trim() || !newLinkUrl.trim() || newLinkTypes.size === 0) && styles.saveLinkButtonDisabled,
                    ]}
                    onPress={handleAddManualLink}
                    disabled={!newLinkName.trim() || !newLinkUrl.trim() || newLinkTypes.size === 0}
                  >
                    <ThemedText style={styles.saveLinkText}>Add Link</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : __DEV__ ? (
              <Pressable
                style={styles.addLinkButton}
                onPress={() => setIsAddingLink(true)}
              >
                <Feather name="plus" size={18} color={Colors.dark.accent} />
                <ThemedText style={styles.addLinkText}>Add streaming link</ThemedText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Rating</ThemedText>
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={userRating}
                editable
                onRatingChange={handleRatingChange}
                size={32}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.notesTitleRow}>
              <ThemedText style={styles.sectionTitle}>Personal Notes</ThemedText>
              {!isEditingNotes && userNotes ? (
                <Pressable onPress={() => setIsEditingNotes(true)}>
                  <Feather name="edit-2" size={18} color={Colors.dark.accent} />
                </Pressable>
              ) : null}
            </View>
            {isEditingNotes ? (
              <View style={styles.notesInputContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={userNotes}
                  onChangeText={setUserNotes}
                  placeholder="Add your thoughts about this film..."
                  placeholderTextColor={Colors.dark.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={styles.notesButtonRow}>
                  <Pressable 
                    style={styles.notesCancelButton}
                    onPress={() => setIsEditingNotes(false)}
                  >
                    <ThemedText style={styles.notesCancelText}>Cancel</ThemedText>
                  </Pressable>
                  <Pressable 
                    style={styles.notesSaveButton}
                    onPress={handleSaveNotes}
                  >
                    <ThemedText style={styles.notesSaveText}>Save</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : userNotes ? (
              <View style={styles.notesDisplay}>
                <ThemedText style={styles.notesText}>{userNotes}</ThemedText>
              </View>
            ) : (
              <Pressable 
                style={styles.addNotesButton}
                onPress={() => setIsEditingNotes(true)}
              >
                <Feather name="plus" size={18} color={Colors.dark.accent} />
                <ThemedText style={styles.addNotesText}>Add notes</ThemedText>
              </Pressable>
            )}
          </View>

          {watched ? (
            <View style={styles.watchedBadge}>
              <Feather name="check-circle" size={20} color={Colors.dark.success} />
              <ThemedText style={styles.watchedText}>
                You've watched this film
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <Pressable
          style={[
            styles.actionButton,
            inWatchlist && styles.actionButtonActive,
          ]}
          onPress={handleWatchlistToggle}
          testID="button-watchlist"
        >
          <Feather
            name={inWatchlist ? "check" : "bookmark"}
            size={20}
            color={inWatchlist ? Colors.dark.primary : "#FFFFFF"}
          />
          <ThemedText style={[styles.actionButtonLabel, inWatchlist && styles.actionButtonLabelActive]}>
            {inWatchlist ? "Saved" : "Save"}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.actionButton,
            watched && styles.actionButtonActive,
          ]}
          onPress={handleMarkWatched}
          testID="button-watched"
        >
          <Feather
            name={watched ? "check-circle" : "eye"}
            size={20}
            color={watched ? Colors.dark.primary : "#FFFFFF"}
          />
          <ThemedText style={[styles.actionButtonLabel, watched && styles.actionButtonLabelActive]}>
            {watched ? "Watched" : "Watched?"}
          </ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={handleShare}
          testID="button-share"
        >
          <Feather name="share-2" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonLabel}>Share</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  posterContainer: {
    height: SCREEN_HEIGHT * 0.5,
    width: "100%",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing["4xl"],
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  meta: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.accent,
    marginLeft: Spacing.xs,
  },
  director: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },
  conservationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 77, 46, 0.3)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.xl,
  },
  conservationText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.primary,
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 26,
    color: "#FFFFFF",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  speciesChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  speciesText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sourceText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginLeft: Spacing.md,
  },
  watchSourcesContainer: {},
  loadingText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },
  noProvidersText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },
  watchSourceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  watchSourceButtonPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  watchSourceLabel: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    marginLeft: Spacing.md,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
  },
  watchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  watchedText: {
    fontSize: 15,
    color: Colors.dark.success,
    marginLeft: Spacing.sm,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.backgroundDefault,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  actionButtonActive: {
    opacity: 1,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  actionButtonLabelActive: {
    color: Colors.dark.primary,
  },
  speciesChipFollowed: {
    backgroundColor: "rgba(26, 77, 46, 0.3)",
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  speciesTextFollowed: {
    color: Colors.dark.primary,
  },
  videosContainer: {},
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  videoButtonPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  videoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  videoInfo: {
    flex: 1,
  },
  videoName: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  videoType: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  notesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  notesInputContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  notesInput: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  notesCancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  notesCancelText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  notesSaveButton: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  notesSaveText: {
    color: Colors.dark.backgroundRoot,
    fontSize: 14,
    fontWeight: "600",
  },
  notesDisplay: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
  },
  addNotesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
    borderStyle: "dashed",
  },
  addNotesText: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginLeft: Spacing.sm,
  },
  manualLinksSection: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.backgroundSecondary,
    paddingTop: Spacing.lg,
  },
  manualLinksLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  manualLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  manualLinkButton: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.primary,
  },
  manualBadge: {
    backgroundColor: "rgba(26, 77, 46, 0.3)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  manualBadgeText: {
    fontSize: 10,
    color: Colors.dark.primary,
    textTransform: "uppercase",
  },
  removeLinkButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  addLinkForm: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  linkInput: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  linkTypeLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  linkTypeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  linkTypeChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  linkTypeChipActive: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  linkTypeText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  linkTypeTextActive: {
    color: Colors.dark.accent,
    fontWeight: "600",
  },
  addLinkButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  cancelLinkButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  cancelLinkText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  saveLinkButton: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  saveLinkButtonDisabled: {
    opacity: 0.5,
  },
  saveLinkText: {
    color: Colors.dark.backgroundRoot,
    fontSize: 14,
    fontWeight: "600",
  },
  addLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
    borderStyle: "dashed",
    marginTop: Spacing.md,
  },
  addLinkText: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginLeft: Spacing.sm,
  },
});
