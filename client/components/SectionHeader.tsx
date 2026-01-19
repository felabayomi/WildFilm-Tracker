import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}

export function SectionHeader({
  title,
  onSeeAll,
  showSeeAll = true,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {showSeeAll && onSeeAll ? (
        <Pressable onPress={onSeeAll} style={styles.seeAllButton}>
          <ThemedText style={styles.seeAllText}>See All</ThemedText>
          <Feather
            name="chevron-right"
            size={16}
            color={Colors.dark.accent}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlayfairDisplay_600SemiBold",
    color: "#FFFFFF",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginRight: Spacing.xs,
  },
});
