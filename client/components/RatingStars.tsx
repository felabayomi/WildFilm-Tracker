import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Colors, Spacing } from "@/constants/theme";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 24,
  editable = false,
  onRatingChange,
}: RatingStarsProps) {
  const handlePress = (value: number) => {
    if (editable && onRatingChange) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= rating;
        const halfFilled = !filled && starValue - 0.5 <= rating;

        return (
          <Pressable
            key={index}
            onPress={() => handlePress(starValue)}
            disabled={!editable}
            style={styles.star}
          >
            <Feather
              name={filled ? "star" : "star"}
              size={size}
              color={filled || halfFilled ? Colors.dark.accent : Colors.dark.backgroundSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: Spacing.xs,
  },
});
