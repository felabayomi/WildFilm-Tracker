import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { FilmCategory } from "@/types/film";

interface CategoryChipProps {
  category: FilmCategory;
  label: string;
  icon: string;
  onPress?: () => void;
  isSelected?: boolean;
  size?: "small" | "large";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryChip({
  label,
  icon,
  onPress,
  isSelected = false,
  size = "large",
}: CategoryChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const isLarge = size === "large";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerSmall,
        isSelected && styles.containerSelected,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          isLarge ? styles.iconContainerLarge : styles.iconContainerSmall,
          isSelected && styles.iconContainerSelected,
        ]}
      >
        <Feather
          name={icon as any}
          size={isLarge ? 24 : 16}
          color={isSelected ? Colors.dark.backgroundRoot : Colors.dark.accent}
        />
      </View>
      <ThemedText
        style={[
          styles.label,
          isLarge ? styles.labelLarge : styles.labelSmall,
          isSelected && styles.labelSelected,
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
  },
  containerLarge: {
    width: 100,
    height: 100,
    padding: Spacing.md,
  },
  containerSmall: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  containerSelected: {
    backgroundColor: Colors.dark.accent,
  },
  iconContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerLarge: {
    width: 48,
    height: 48,
    marginBottom: Spacing.sm,
  },
  iconContainerSmall: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
  },
  iconContainerSelected: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  labelLarge: {
    fontSize: 13,
  },
  labelSmall: {
    fontSize: 14,
  },
  labelSelected: {
    color: Colors.dark.backgroundRoot,
  },
});
