import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, ScrollView, Dimensions, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { useFilms } from "@/hooks/useFilmData";
import { Colors, Spacing } from "@/constants/theme";
import { FilmPoster } from "@/components/FilmPoster";
import { CategoryChip } from "@/components/CategoryChip";
import { SectionHeader } from "@/components/SectionHeader";
import { FilmPosterSkeleton } from "@/components/SkeletonLoader";
import { CATEGORIES, COLLECTIONS } from "@/data/films";
import { Film, FilmCategory } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { films, featuredFilms, newReleases, isLoading, refetch } = useFilms();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFilmPress = (film: Film) => {
    navigation.navigate("FilmDetails", { filmId: film.id });
  };

  const handleCategoryPress = (category: FilmCategory) => {
    navigation.navigate("CategoryFilms", { category });
  };

  const heroFilm = featuredFilms[0];

  const renderHero = () => {
    if (isLoading) {
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

  const renderNewReleases = () => (
    <View style={styles.section}>
      <SectionHeader title="New Releases" showSeeAll={false} />
      {isLoading ? (
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
          data={newReleases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FilmPoster
              film={item}
              size="medium"
              showYear
              onPress={() => handleFilmPress(item)}
            />
          )}
        />
      )}
    </View>
  );

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
      <SectionHeader title="Featured Films" showSeeAll={false} />
      {isLoading ? (
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

  const renderCollections = () => (
    <View style={styles.section}>
      <SectionHeader title="Collections" showSeeAll={false} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {COLLECTIONS.map((collection) => {
          const collectionFilms = films.filter((f) =>
            collection.filmIds.includes(f.id)
          );
          const firstFilm = collectionFilms[0];
          if (!firstFilm) return null;

          return (
            <View key={collection.id} style={styles.collectionCard}>
              <FilmPoster
                film={firstFilm}
                size="medium"
                showTitle={false}
                onPress={() =>
                  navigation.navigate("Collection", { collectionId: collection.id })
                }
              />
              <View style={styles.collectionOverlay}>
                <View style={styles.collectionLabel}>
                  <View style={styles.collectionTextContainer}>
                    <View style={styles.collectionTitleRow}>
                      <View style={styles.collectionBadge}>
                        <View style={styles.collectionCount}>
                          <View style={styles.collectionCountText} />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderAllFilms = () => (
    <View style={styles.section}>
      <SectionHeader title="All Films" showSeeAll={false} />
      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {[1, 2, 3, 4].map((i) => (
            <FilmPosterSkeleton key={i} size="medium" />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          data={films}
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
      )}
    </View>
  );

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
      {renderNewReleases()}
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
  collectionCard: {
    marginRight: Spacing.md,
    position: "relative",
  },
  collectionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  collectionLabel: {
    padding: Spacing.sm,
  },
  collectionTextContainer: {},
  collectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionBadge: {},
  collectionCount: {},
  collectionCountText: {},
});
