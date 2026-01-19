import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Share,
  Platform,
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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RatingStars } from "@/components/RatingStars";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

  const film = getFilmById(filmId);
  const userData = getFilmUserData(filmId);
  const inWatchlist = isInWatchlist(filmId);
  const watched = isWatched(filmId);
  
  const { providers: realProviders, isLoading: providersLoading } = useWatchProviders(filmId);

  const [userRating, setUserRating] = useState(userData?.userRating || 0);
  
  const watchProviders = realProviders.length > 0 ? realProviders : film?.whereToWatch || [];

  if (!film) {
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

  const handleWatchlistToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (inWatchlist) {
      await removeFromWatchlist(filmId);
    } else {
      await addToWatchlist(filmId);
    }
  }, [inWatchlist, filmId, addToWatchlist, removeFromWatchlist]);

  const handleMarkWatched = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markAsWatched(filmId, userRating);
  }, [filmId, userRating, markAsWatched]);

  const handleRatingChange = useCallback(async (rating: number) => {
    setUserRating(rating);
    await updateRating(filmId, rating);
  }, [filmId, updateRating]);

  const handleWatchSourcePress = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: Colors.dark.accent,
      });
    }
  };

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const synopsisTruncated = film.synopsis.length > 100 
      ? `${film.synopsis.substring(0, 100)}...` 
      : film.synopsis;
    
    let shareMessage = `Check out "${film.title}" - ${synopsisTruncated}`;
    
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
    
    const appDomain = process.env.EXPO_PUBLIC_DOMAIN || "wildfilms.replit.app";
    shareMessage += `\n\nFind where to watch any wildlife movie or show with WildFilms: https://${appDomain}`;

    try {
      await Share.share({
        message: shareMessage,
        title: film.title,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  }, [film, watchProviders]);

  const SpeciesChip = ({ species }: { species: string }) => (
    <View style={styles.speciesChip}>
      <Feather name="github" size={14} color={Colors.dark.accent} />
      <ThemedText style={styles.speciesText}>{species}</ThemedText>
    </View>
  );

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
            ) : watchProviders.length > 0 ? (
              <View style={styles.watchSourcesContainer}>
                {watchProviders.map((source, index) => (
                  <Pressable
                    key={index}
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
              </View>
            ) : (
              <ThemedText style={styles.noProvidersText}>
                No streaming options found for your region
              </ThemedText>
            )}
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
            styles.watchlistButton,
            inWatchlist && styles.watchlistButtonActive,
          ]}
          onPress={handleWatchlistToggle}
        >
          <Feather
            name={inWatchlist ? "bookmark" : "plus"}
            size={24}
            color={inWatchlist ? Colors.dark.accent : "#FFFFFF"}
          />
        </Pressable>
        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
          testID="button-share"
        >
          <Feather name="share" size={24} color="#FFFFFF" />
        </Pressable>
        <Button
          onPress={handleMarkWatched}
          style={[
            styles.watchedButton,
            watched && styles.watchedButtonActive,
          ]}
          disabled={watched}
        >
          {watched ? "Watched" : "Mark as Watched"}
        </Button>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.backgroundDefault,
  },
  watchlistButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  watchlistButtonActive: {
    backgroundColor: Colors.dark.backgroundDefault,
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  watchedButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
  },
  watchedButtonActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
});
