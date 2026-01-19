import React from "react";
import { StyleSheet, View, ScrollView, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { SectionHeader } from "@/components/SectionHeader";
import { FilmPoster } from "@/components/FilmPoster";
import { Film } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { watchedFilms, watchlistFilms, userFilmData } = useFilms();

  const totalWatched = watchedFilms.length;
  const totalWatchlist = watchlistFilms.length;
  const totalMinutes = watchedFilms.reduce((acc, film) => acc + film.runtime, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const ratedFilms = watchedFilms.filter(
    (f) => userFilmData[f.id]?.userRating
  );
  const averageRating =
    ratedFilms.length > 0
      ? ratedFilms.reduce(
          (acc, f) => acc + (userFilmData[f.id]?.userRating || 0),
          0
        ) / ratedFilms.length
      : 0;

  const handleFilmPress = (film: Film) => {
    navigation.navigate("FilmDetails", { filmId: film.id });
  };

  const StatCard = ({
    icon,
    value,
    label,
  }: {
    icon: string;
    value: string | number;
    label: string;
  }) => (
    <View style={styles.statCard}>
      <Feather name={icon as any} size={24} color={Colors.dark.accent} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );

  const MenuButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuButton,
        pressed && styles.menuButtonPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.menuButtonContent}>
        <View style={styles.menuButtonIcon}>
          <Feather name={icon as any} size={20} color={Colors.dark.accent} />
        </View>
        <ThemedText style={styles.menuButtonLabel}>{label}</ThemedText>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={Colors.dark.textSecondary}
      />
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <Image
          source={require("../../assets/images/illustrations/default_avatar_illustration.png")}
          style={styles.avatar}
        />
        <ThemedText style={styles.userName}>Wildlife Enthusiast</ThemedText>
        <ThemedText style={styles.userBio}>
          Exploring nature through film
        </ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <StatCard icon="film" value={totalWatched} label="Films Watched" />
        <StatCard icon="clock" value={`${totalHours}h`} label="Time Logged" />
        <StatCard
          icon="star"
          value={averageRating > 0 ? averageRating.toFixed(1) : "-"}
          label="Avg Rating"
        />
      </View>

      {watchedFilms.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Recently Watched" showSeeAll={false} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {watchedFilms.slice(0, 5).map((film) => (
              <FilmPoster
                key={film.id}
                film={film}
                size="small"
                showYear
                onPress={() => handleFilmPress(film)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.menuSection}>
        <ThemedText style={styles.menuTitle}>Settings</ThemedText>
        <View style={styles.menuContainer}>
          <MenuButton icon="heart" label="Favorite Sources" />
          <MenuButton icon="bell" label="Notifications" />
          <MenuButton icon="shield" label="Privacy" />
          <MenuButton icon="help-circle" label="Help & Support" />
          <MenuButton icon="info" label="About WildFilms" />
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          WildFilms v1.0.0
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  userBio: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  menuButtonPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuButtonLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
});
