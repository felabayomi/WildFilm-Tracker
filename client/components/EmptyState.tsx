import React from "react";
import { StyleSheet, View, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing } from "@/constants/theme";

interface EmptyStateProps {
  image: "watchlist" | "search";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const IMAGES = {
  watchlist: require("../../assets/images/illustrations/empty_watchlist_illustration.png"),
  search: require("../../assets/images/illustrations/empty_search_illustration.png"),
};

export function EmptyState({
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Image
        source={IMAGES[image]}
        style={styles.image}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing["2xl"],
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlayfairDisplay_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 160,
    backgroundColor: Colors.dark.primary,
  },
});
