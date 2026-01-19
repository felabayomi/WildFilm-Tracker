import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );

  const LinkButton = ({
    icon,
    label,
    url,
  }: {
    icon: string;
    label: string;
    url: string;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.linkButton,
        pressed && styles.linkButtonPressed,
      ]}
      onPress={async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await Linking.openURL(url);
      }}
    >
      <View style={styles.linkButtonContent}>
        <View style={styles.linkButtonIcon}>
          <Feather name={icon as any} size={20} color={Colors.dark.accent} />
        </View>
        <ThemedText style={styles.linkButtonLabel}>{label}</ThemedText>
      </View>
      <Feather
        name="external-link"
        size={18}
        color={Colors.dark.textSecondary}
      />
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoSection}>
        <View style={styles.appIcon}>
          <Feather name="film" size={48} color={Colors.dark.accent} />
        </View>
        <ThemedText style={styles.appName}>WildFilms</ThemedText>
        <ThemedText style={styles.tagline}>
          Discover Wildlife Cinema
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>About</ThemedText>
        <View style={styles.card}>
          <ThemedText style={styles.description}>
            WildFilms is your ultimate companion for discovering, cataloging, and tracking wildlife films and nature documentaries from around the world.
          </ThemedText>
          <ThemedText style={[styles.description, { marginTop: Spacing.md }]}>
            From independent filmmakers to major conservation organizations, explore the beauty of our natural world through carefully curated cinema.
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>App Info</ThemedText>
        <View style={styles.card}>
          <InfoRow label="Version" value={appVersion} />
          <View style={styles.divider} />
          <InfoRow label="Platform" value="iOS & Android" />
          <View style={styles.divider} />
          <InfoRow label="Developer" value="WildFilms Team" />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Features</ThemedText>
        <View style={styles.card}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="search" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Smart Search</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Find wildlife documentaries with powerful filters
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="bookmark" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Personal Watchlist</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Save films to watch later
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="play-circle" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Streaming Links</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Find where to watch with verified providers
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Feather name="share-2" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>AI-Powered Sharing</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Share films with engaging AI-generated summaries
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Data Source</ThemedText>
        <View style={styles.card}>
          <ThemedText style={styles.description}>
            Film data provided by The Movie Database (TMDB). WildFilms uses the TMDB API but is not endorsed or certified by TMDB.
          </ThemedText>
          <LinkButton
            icon="database"
            label="Visit TMDB"
            url="https://www.themoviedb.org"
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Connect</ThemedText>
        <View style={styles.card}>
          <LinkButton
            icon="mail"
            label="Contact Support"
            url="mailto:wildlifefilm@hotmail.com"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Made with love for wildlife
        </ThemedText>
        <ThemedText style={styles.copyright}>
          {"\u00A9"} {new Date().getFullYear()} WildFilms
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.dark.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  linkButtonLabel: {
    fontSize: 15,
    color: Colors.dark.accent,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  copyright: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    opacity: 0.7,
  },
});
