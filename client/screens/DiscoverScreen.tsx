import React, { useCallback, useEffect } from "react";
import { StyleSheet, View, FlatList, ScrollView, Pressable, Text, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFilms, cacheFilm } from "@/hooks/useFilmData";
import { useTMDBFilms } from "@/hooks/useTMDBFilms";
import { Colors, Spacing, FontSizes } from "@/constants/theme";
import { FilmPoster } from "@/components/FilmPoster";
import { CategoryChip } from "@/components/CategoryChip";
import { SectionHeader } from "@/components/SectionHeader";
import { FilmPosterSkeleton } from "@/components/SkeletonLoader";
import { CATEGORIES, SAMPLE_FILMS } from "@/data/films";
import { Film, FilmCategory } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { featuredFilms, isLoading: localLoading, refetch: refetchLocal } = useFilms();
  const { 
    films: tmdbFilms, 
    isLoading: tmdbLoading, 
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: refreshTMDB,
    totalResults,
    error: tmdbError
  } = useTMDBFilms();
  
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    refreshTMDB();
  }, []);

  useEffect(() => {
    tmdbFilms.forEach(film => cacheFilm(film));
  }, [tmdbFilms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchLocal(), refreshTMDB()]);
    setRefreshing(false);
  }, [refetchLocal, refreshTMDB]);

  const handleFilmPress = (film: Film) => {
    navigation.navigate("FilmDetails", { filmId: film.id });
  };

  const handleCategoryPress = (category: FilmCategory) => {
    navigation.navigate("CategoryFilms", { category });
  };

  const heroFilm = featuredFilms[0];

  const renderHero = () => {
    if (localLoading) {
      return (
        <View style={styles.heroContainer}>
          <FilmPosterSkeleton size="large" />
        </View>
      );
    }

    if (!heroFilm) return null;

    return (
      <View style={styles.heroContainer}>
        <FilmPoster
          film={heroFilm}
          size="hero"
          onPress={() => handleFilmPress(heroFilm)}
        />
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <SectionHeader title="Categories" showSeeAll={false} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.categoryItem}>
            <CategoryChip
              category={cat.key}
              label={cat.label}
              icon={cat.icon}
              onPress={() => handleCategoryPress(cat.key)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeatured = () => (
    <View style={styles.section}>
      <SectionHeader 
        title="Featured Films" 
        subtitle="Award-winning documentaries with verified streaming"
        showSeeAll={false} 
      />
      {localLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {[1, 2, 3].map((i) => (
            <FilmPosterSkeleton key={i} size="medium" />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          data={featuredFilms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FilmPoster
              film={item}
              size="medium"
              showRating
              onPress={() => handleFilmPress(item)}
            />
          )}
        />
      )}
    </View>
  );

  const renderAllFilms = () => {
    const allFilms = [...SAMPLE_FILMS, ...tmdbFilms];
    const uniqueFilms = allFilms.filter((film, index, self) => 
      index === self.findIndex((f) => f.title.toLowerCase() === film.title.toLowerCase())
    );

    return (
      <View style={styles.section}>
        <SectionHeader 
          title="All Wildlife Films" 
          subtitle={totalResults > 0 ? `${totalResults}+ films from TMDB` : undefined}
          showSeeAll={false} 
        />
        {tmdbLoading && tmdbFilms.length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {[1, 2, 3, 4].map((i) => (
              <FilmPosterSkeleton key={i} size="medium" />
            ))}
          </ScrollView>
        ) : tmdbError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.textSecondary }]}>
              Using curated collection
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              data={SAMPLE_FILMS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FilmPoster
                  film={item}
                  size="medium"
                  showYear
                  showRating
                  onPress={() => handleFilmPress(item)}
                />
              )}
            />
          </View>
        ) : (
          <View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              data={uniqueFilms}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FilmPoster
                  film={item}
                  size="medium"
                  showYear
                  showRating
                  onPress={() => handleFilmPress(item)}
                />
              )}
              onEndReached={hasMore ? loadMore : undefined}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                hasMore ? (
                  <View style={styles.loadMoreContainer}>
                    {isLoadingMore ? (
                      <View style={styles.loadingMore}>
                        <ActivityIndicator size="small" color={Colors.dark.accent} />
                        <Text style={styles.loadingMoreText}>Loading more...</Text>
                      </View>
                    ) : (
                      <Pressable 
                        style={styles.loadMoreButton}
                        onPress={loadMore}
                      >
                        <Text style={styles.loadMoreText}>Load More</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.accent}
        />
      }
    >
      {renderHero()}
      {renderCategories()}
      {renderFeatured()}
      {renderAllFilms()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryItem: {
    marginRight: Spacing.md,
  },
  errorContainer: {
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  loadMoreContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    minWidth: 120,
  },
  loadMoreButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 20,
  },
  loadMoreText: {
    color: Colors.dark.background,
    fontSize: FontSizes.sm,
    fontWeight: "600",
  },
  loadingMore: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  loadingMoreText: {
    color: Colors.dark.accent,
    fontSize: FontSizes.xs,
  },
});
