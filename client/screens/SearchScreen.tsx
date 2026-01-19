import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Colors, Spacing } from "@/constants/theme";
import { SearchInput } from "@/components/SearchInput";
import { FilterChip } from "@/components/FilterChip";
import { FilmCard } from "@/components/FilmCard";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { CATEGORIES, REGIONS, SOURCES } from "@/data/films";
import { Film, FilmCategory } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { films, isInWatchlist, addToWatchlist, removeFromWatchlist } = useFilms();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<FilmCategory[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const toggleCategory = (category: FilmCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedSources([]);
  };

  const filteredFilms = useMemo(() => {
    let result = films;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (film) =>
          film.title.toLowerCase().includes(query) ||
          film.director.toLowerCase().includes(query) ||
          film.species.some((s) => s.toLowerCase().includes(query)) ||
          film.locations.some((l) => l.toLowerCase().includes(query))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((film) =>
        selectedCategories.includes(film.category)
      );
    }

    if (selectedRegions.length > 0) {
      result = result.filter((film) =>
        film.locations.some((loc) =>
          selectedRegions.some((region) =>
            loc.toLowerCase().includes(region.toLowerCase())
          )
        )
      );
    }

    if (selectedSources.length > 0) {
      result = result.filter((film) => selectedSources.includes(film.source));
    }

    return result;
  }, [films, searchQuery, selectedCategories, selectedRegions, selectedSources]);

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedRegions.length > 0 ||
    selectedSources.length > 0;

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

  const renderFiltersHeader = () => (
    <View style={styles.header}>
      <View style={styles.filtersSection}>
        <View style={styles.filterRow}>
          <ThemedText style={styles.filterLabel}>Category</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.key}
                label={cat.label}
                isSelected={selectedCategories.includes(cat.key)}
                onPress={() => toggleCategory(cat.key)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ThemedText style={styles.filterLabel}>Region</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            keyboardShouldPersistTaps="handled"
          >
            {REGIONS.slice(0, 6).map((region) => (
              <FilterChip
                key={region}
                label={region}
                isSelected={selectedRegions.includes(region)}
                onPress={() => toggleRegion(region)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ThemedText style={styles.filterLabel}>Source</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            keyboardShouldPersistTaps="handled"
          >
            {SOURCES.map((source) => (
              <FilterChip
                key={source}
                label={source}
                isSelected={selectedSources.includes(source)}
                onPress={() => toggleSource(source)}
              />
            ))}
          </ScrollView>
        </View>

        {hasFilters ? (
          <View style={styles.clearRow}>
            <FilterChip
              label="Clear All Filters"
              isSelected={false}
              onPress={clearFilters}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>
          {filteredFilms.length} {filteredFilms.length === 1 ? "film" : "films"} found
        </ThemedText>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image="search"
      title="No films found"
      description="Try adjusting your search or filters to discover more wildlife films."
      actionLabel={hasFilters ? "Clear Filters" : undefined}
      onAction={hasFilters ? clearFilters : undefined}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.searchContainer, { paddingTop: insets.top + Spacing.lg }]}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search films, species, filmmakers..."
        />
      </View>
      <FlatList
        data={filteredFilms}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderFiltersHeader}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        renderItem={({ item }) => (
          <View style={styles.filmCardContainer}>
            <FilmCard
              film={item}
              onPress={() => handleFilmPress(item)}
              onWatchlistToggle={() => handleWatchlistToggle(item.id)}
              isInWatchlist={isInWatchlist(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  filterRow: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: "row",
  },
  clearRow: {
    marginTop: Spacing.sm,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.backgroundSecondary,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  filmCardContainer: {},
});
