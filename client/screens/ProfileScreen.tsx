import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useFilms } from "@/hooks/useFilmData";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { SectionHeader } from "@/components/SectionHeader";
import { FilmPoster } from "@/components/FilmPoster";
import { Button } from "@/components/Button";
import { Film } from "@/types/film";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getUserProfile,
  saveUserProfile,
  UserProfile,
  clearWatchHistory,
  clearWatchlist,
  clearAllData,
} from "@/lib/storage";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { isDarkMode, setDarkMode } = useThemeContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profileNavigation = 
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { watchedFilms, watchlistFilms, userFilmData, refetch } = useFilms();

  const [profile, setProfile] = useState<UserProfile>({
    name: "Wildlife Enthusiast",
    bio: "Exploring nature through film",
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreferencesModalVisible, setIsPreferencesModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getUserProfile();
    setProfile(savedProfile);
  };

  const handleEditProfile = () => {
    setEditName(profile.name);
    setEditBio(profile.bio);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updatedProfile: UserProfile = {
      ...profile,
      name: editName.trim() || "Wildlife Enthusiast",
      bio: editBio.trim() || "Exploring nature through film",
    };
    await saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditModalVisible(false);
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const updatedProfile: UserProfile = {
        ...profile,
        imageUri: result.assets[0].uri,
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const totalWatched = watchedFilms.length;
  const totalMinutes = watchedFilms.reduce(
    (acc, film) => acc + film.runtime,
    0
  );
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

  const handleClearWatchHistory = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearWatchHistory();
    await refetch();
    setIsPreferencesModalVisible(false);
  };

  const handleClearWatchlist = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearWatchlist();
    await refetch();
    setIsPreferencesModalVisible(false);
  };

  const handleClearAllData = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await clearAllData();
    await refetch();
    await loadProfile();
    setIsPreferencesModalVisible(false);
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
    <>
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
          <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
            {profile.imageUri ? (
              <Image
                source={{ uri: profile.imageUri }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("../../assets/images/illustrations/default_avatar_illustration.png")}
                style={styles.avatar}
              />
            )}
            <View style={styles.cameraIconContainer}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <ThemedText style={styles.userName}>{profile.name}</ThemedText>
          <ThemedText style={styles.userBio}>{profile.bio}</ThemedText>
          <Pressable
            style={styles.editButton}
            onPress={handleEditProfile}
            testID="button-edit-profile"
          >
            <Feather name="edit-2" size={14} color={Colors.dark.accent} />
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="film" value={totalWatched} label="Films Watched" />
          <StatCard
            icon="clock"
            value={`${totalHours}h`}
            label="Time Logged"
          />
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
            <MenuButton icon="sliders" label="Preferences" onPress={() => setIsPreferencesModalVisible(true)} />
            <MenuButton icon="bell" label="Notifications" onPress={() => profileNavigation.navigate("Notifications")} />
            <MenuButton icon="shield" label="Privacy" onPress={() => profileNavigation.navigate("Privacy")} />
            <MenuButton icon="help-circle" label="Help & Support" onPress={() => profileNavigation.navigate("HelpSupport")} />
            <MenuButton icon="info" label="About WildFilms" />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>WildFilms v1.0.0</ThemedText>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                hitSlop={20}
              >
                <Feather name="x" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Name</ThemedText>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.dark.textSecondary}
                maxLength={30}
                testID="input-profile-name"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Bio</ThemedText>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="A short bio about yourself"
                placeholderTextColor={Colors.dark.textSecondary}
                multiline
                maxLength={100}
                testID="input-profile-bio"
              />
            </View>

            <Button onPress={handleSaveProfile} style={styles.saveButton}>
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPreferencesModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPreferencesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Preferences</ThemedText>
              <Pressable
                onPress={() => setIsPreferencesModalVisible(false)}
                hitSlop={20}
              >
                <Feather name="x" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Feather name="moon" size={20} color={Colors.dark.accent} />
                <ThemedText style={styles.preferenceLabel}>Dark Mode</ThemedText>
              </View>
              <Pressable
                style={[styles.toggle, isDarkMode && styles.toggleActive]}
                onPress={() => setDarkMode(!isDarkMode)}
              >
                <View style={[styles.toggleKnob, isDarkMode && styles.toggleKnobActive]} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <ThemedText style={styles.sectionLabel}>Data Management</ThemedText>

            <Pressable
              style={styles.dangerButton}
              onPress={handleClearWatchHistory}
            >
              <Feather name="clock" size={18} color={Colors.dark.error} />
              <ThemedText style={styles.dangerButtonText}>Reset Watch History</ThemedText>
            </Pressable>

            <Pressable
              style={styles.dangerButton}
              onPress={handleClearWatchlist}
            >
              <Feather name="bookmark" size={18} color={Colors.dark.error} />
              <ThemedText style={styles.dangerButtonText}>Clear Watchlist</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.dangerButton, styles.dangerButtonLast]}
              onPress={handleClearAllData}
            >
              <Feather name="trash-2" size={18} color={Colors.dark.error} />
              <ThemedText style={styles.dangerButtonText}>Clear All Data</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.backgroundRoot,
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
    marginBottom: Spacing.md,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginLeft: Spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: "#FFFFFF",
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  preferenceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: Spacing.md,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: Colors.dark.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.backgroundSecondary,
    marginVertical: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  dangerButtonLast: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    fontSize: 16,
    color: Colors.dark.error,
    marginLeft: Spacing.md,
  },
});
