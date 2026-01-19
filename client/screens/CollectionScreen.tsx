import React, { useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Colors, Spacing } from "@/constants/theme";
import { FilmCard } from "@/components/FilmCard";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { COLLECTIONS } from "@/data/films";
import { Film } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type CollectionRouteProp = RouteProp<RootStackParamList, "Collection">;

export default function CollectionScreen() {
  const route = useRoute<CollectionRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { collectionId } = route.params;

  const {
    films,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useFilms();

  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  const collectionFilms = useMemo(
    () => films.filter((f) => collection?.filmIds.includes(f.id)),
    [films, collection]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: collection?.name || "Collection",
    });
  }, [navigation, collection]);

  const handleFilmPress = (film: Film) => {
    navigation.navigate("FilmDetails", { filmId: film.id });
  };

  const handleWatchlistToggle = useCallback(async (filmId: string) => {
    if (isInWatchlist(filmId)) {
      await removeFromWatchlist(filmId);
    } else {
      await addToWatchlist(filmId);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  const renderHeader = () => {
    if (!collection) return null;

    return (
      <View style={styles.header}>
        <ThemedText style={styles.description}>
          {collection.description}
        </ThemedText>
        <ThemedText style={styles.filmCount}>
          {collectionFilms.length} {collectionFilms.length === 1 ? "film" : "films"}
        </ThemedText>
      </View>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      image="search"
      title="No films in this collection"
      description="Check back later for more wildlife films in this collection."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={collectionFilms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          collectionFilms.length === 0 && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            onPress={() => handleFilmPress(item)}
            onWatchlistToggle={() => handleWatchlistToggle(item.id)}
            isInWatchlist={isInWatchlist(item.id)}
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
  header: {
    marginBottom: Spacing.xl,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  filmCount: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: "500",
  },
});
