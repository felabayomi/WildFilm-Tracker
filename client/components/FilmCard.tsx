import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Film } from "@/types/film";

interface FilmCardProps {
  film: Film;
  onPress?: () => void;
  onWatchlistToggle?: () => void;
  isInWatchlist?: boolean;
  isWatched?: boolean;
  showActions?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilmCard({
  film,
  onPress,
  onWatchlistToggle,
  isInWatchlist = false,
  isWatched = false,
  showActions = true,
}: FilmCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <Image
        source={{ uri: film.posterUrl }}
        style={styles.poster}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {film.title}
            </ThemedText>
            <ThemedText style={styles.meta}>
              {film.year} • {film.runtime} min
            </ThemedText>
          </View>
          {showActions ? (
            <View style={styles.actions}>
              {isWatched ? (
                <View style={styles.watchedBadge}>
                  <Feather name="check" size={14} color={Colors.dark.success} />
                </View>
              ) : null}
              <Pressable
                onPress={onWatchlistToggle}
                style={styles.watchlistButton}
                hitSlop={8}
              >
                <Feather
                  name={isInWatchlist ? "bookmark" : "plus"}
                  size={20}
                  color={isInWatchlist ? Colors.dark.accent : Colors.dark.textSecondary}
                />
              </Pressable>
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.synopsis} numberOfLines={2}>
          {film.synopsis}
        </ThemedText>
        <View style={styles.footer}>
          <View style={styles.tags}>
            {film.species.slice(0, 2).map((species) => (
              <View key={species} style={styles.tag}>
                <ThemedText style={styles.tagText}>{species}</ThemedText>
              </View>
            ))}
          </View>
          {film.rating ? (
            <View style={styles.rating}>
              <Feather name="star" size={14} color={Colors.dark.accent} />
              <ThemedText style={styles.ratingText}>
                {film.rating.toFixed(1)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  poster: {
    width: 100,
    height: 150,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  watchedBadge: {
    marginRight: Spacing.sm,
  },
  watchlistButton: {
    padding: Spacing.xs,
  },
  synopsis: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginVertical: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tags: {
    flexDirection: "row",
    flex: 1,
  },
  tag: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  tagText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.accent,
    marginLeft: Spacing.xs,
  },
});
