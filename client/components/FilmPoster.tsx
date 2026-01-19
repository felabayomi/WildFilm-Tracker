import React from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Film } from "@/types/film";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FilmPosterProps {
  film: Film;
  onPress?: () => void;
  size?: "small" | "medium" | "large" | "hero";
  showTitle?: boolean;
  showYear?: boolean;
  showRating?: boolean;
}

const SIZE_CONFIG = {
  small: { width: 100, height: 150 },
  medium: { width: 140, height: 210 },
  large: { width: 180, height: 270 },
  hero: { width: SCREEN_WIDTH - Spacing.lg * 2, height: 400 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilmPoster({
  film,
  onPress,
  size = "medium",
  showTitle = true,
  showYear = false,
  showRating = false,
}: FilmPosterProps) {
  const scale = useSharedValue(1);
  const dimensions = SIZE_CONFIG[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, { width: dimensions.width }, animatedStyle]}
    >
      <View style={[styles.imageContainer, { height: dimensions.height }]}>
        <Image
          source={{ uri: film.posterUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {size === "hero" ? (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroTitle}>{film.title}</ThemedText>
              <View style={styles.heroMeta}>
                <ThemedText style={styles.heroYear}>{film.year}</ThemedText>
                {film.rating ? (
                  <>
                    <View style={styles.dot} />
                    <ThemedText style={styles.heroRating}>
                      {film.rating.toFixed(1)}
                    </ThemedText>
                  </>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        ) : null}
        {showRating && film.rating && size !== "hero" ? (
          <View style={styles.ratingBadge}>
            <ThemedText style={styles.ratingText}>
              {film.rating.toFixed(1)}
            </ThemedText>
          </View>
        ) : null}
      </View>
      {showTitle && size !== "hero" ? (
        <View style={styles.titleContainer}>
          <ThemedText
            style={[
              styles.title,
              size === "small" && styles.titleSmall,
            ]}
            numberOfLines={2}
          >
            {film.title}
          </ThemedText>
          {showYear ? (
            <ThemedText style={styles.year}>{film.year}</ThemedText>
          ) : null}
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    backgroundColor: Colors.dark.backgroundDefault,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: Spacing.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroYear: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  heroRating: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: "600",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  ratingBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.accent,
  },
  titleContainer: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  titleSmall: {
    fontSize: 12,
  },
  year: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
