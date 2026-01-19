import React, { useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Spacing } from "@/constants/theme";
import { FilmCard } from "@/components/FilmCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORIES } from "@/data/films";
import { Film } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type CategoryFilmsRouteProp = RouteProp<RootStackParamList, "CategoryFilms">;

export default function CategoryFilmsScreen() {
  const route = useRoute<CategoryFilmsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { category } = route.params;

  const {
    films,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useFilms();

  const categoryData = CATEGORIES.find((c) => c.key === category);
  const categoryFilms = useMemo(
    () => films.filter((f) => f.category === category),
    [films, category]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: categoryData?.label || "Films",
    });
  }, [navigation, categoryData]);

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

  const renderEmpty = () => (
    <EmptyState
      image="search"
      title="No films in this category"
      description="Check back later for more wildlife films in this category."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={categoryFilms}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          categoryFilms.length === 0 && styles.emptyContent,
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
});
