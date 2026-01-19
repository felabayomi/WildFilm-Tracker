import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.xs,
  style,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function FilmCardSkeleton() {
  return (
    <View style={styles.filmCard}>
      <SkeletonLoader width={100} height={150} />
      <View style={styles.filmCardContent}>
        <SkeletonLoader width="80%" height={18} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: Spacing.sm }} />
        <SkeletonLoader width="100%" height={36} style={{ marginTop: Spacing.md }} />
        <View style={styles.filmCardTags}>
          <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} />
          <SkeletonLoader width={80} height={24} borderRadius={BorderRadius.full} style={{ marginLeft: Spacing.sm }} />
        </View>
      </View>
    </View>
  );
}

export function FilmPosterSkeleton({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const dimensions = {
    small: { width: 100, height: 150 },
    medium: { width: 140, height: 210 },
    large: { width: 180, height: 270 },
  };
  
  return (
    <View style={{ marginRight: Spacing.md }}>
      <SkeletonLoader
        width={dimensions[size].width}
        height={dimensions[size].height}
        borderRadius={BorderRadius.sm}
      />
      <SkeletonLoader
        width={dimensions[size].width - 20}
        height={14}
        style={{ marginTop: Spacing.sm }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  filmCard: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  filmCardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  filmCardTags: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
});
