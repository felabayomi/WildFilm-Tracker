import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  showRemove?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterChip({
  label,
  isSelected,
  onPress,
  showRemove = false,
}: FilterChipProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[styles.label, isSelected && styles.labelSelected]}
      >
        {label}
      </ThemedText>
      {showRemove && isSelected ? (
        <Feather
          name="x"
          size={14}
          color={Colors.dark.backgroundRoot}
          style={styles.icon}
        />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  containerSelected: {
    backgroundColor: Colors.dark.accent,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  labelSelected: {
    color: Colors.dark.backgroundRoot,
    fontWeight: "500",
  },
  icon: {
    marginLeft: Spacing.xs,
  },
});
