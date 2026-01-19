import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Colors, Spacing } from "@/constants/theme";
import { FilmCard } from "@/components/FilmCard";
import { EmptyState } from "@/components/EmptyState";
import { FilmCardSkeleton } from "@/components/SkeletonLoader";
import { Film } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const {
    watchlistFilms,
    isLoading,
    isInWatchlist,
    isWatched,
    removeFromWatchlist,
    refetch,
  } = useFilms();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFilmPress = (film: Film) => {
    navigation.navigate("FilmDetails", { filmId: film.id });
  };

  const handleRemoveFromWatchlist = useCallback(async (filmId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeFromWatchlist(filmId);
  }, [removeFromWatchlist]);

  const handleDiscoverPress = () => {
    navigation.getParent()?.navigate("DiscoverTab");
  };

  const renderEmpty = () => (
    <EmptyState
      image="watchlist"
      title="Your watchlist is empty"
      description="Start adding wildlife films you want to watch and they'll appear here."
      actionLabel="Discover Films"
      onAction={handleDiscoverPress}
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((i) => (
        <FilmCardSkeleton key={i} />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          },
        ]}
      >
        {renderLoading()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={watchlistFilms}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          watchlistFilms.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.accent}
          />
        }
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            onPress={() => handleFilmPress(item)}
            onWatchlistToggle={() => handleRemoveFromWatchlist(item.id)}
            isInWatchlist={isInWatchlist(item.id)}
            isWatched={isWatched(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
});
