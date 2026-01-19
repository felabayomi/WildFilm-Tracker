import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
} from "@/lib/storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkMode: true,
    notificationsEnabled: false,
    newFilmAlerts: true,
    watchlistReminders: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    checkPermissions();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getUserPreferences();
    setPreferences(prefs);
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === "denied") {
      if (Platform.OS !== "web") {
        try {
          await Linking.openSettings();
        } catch (error) {
          console.log("Could not open settings");
        }
      }
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status === "granted") {
      const newPrefs = { ...preferences, notificationsEnabled: true };
      setPreferences(newPrefs);
      await saveUserPreferences(newPrefs);
      
      await scheduleWelcomeNotification();
    }
  };

  const toggleNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!preferences.notificationsEnabled) {
      await requestPermissions();
    } else {
      const newPrefs = { ...preferences, notificationsEnabled: false };
      setPreferences(newPrefs);
      await saveUserPreferences(newPrefs);
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const toggleNewFilmAlerts = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPrefs = { ...preferences, newFilmAlerts: !preferences.newFilmAlerts };
    setPreferences(newPrefs);
    await saveUserPreferences(newPrefs);
  };

  const toggleWatchlistReminders = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPrefs = { ...preferences, watchlistReminders: !preferences.watchlistReminders };
    setPreferences(newPrefs);
    await saveUserPreferences(newPrefs);

    if (!preferences.watchlistReminders && preferences.notificationsEnabled) {
      await scheduleWatchlistReminder();
    }
  };

  const scheduleWelcomeNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Welcome to WildFilms!",
        body: "You'll now receive updates about new wildlife documentaries.",
      },
      trigger: null,
    });
  };

  const scheduleWatchlistReminder = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Watch!",
        body: "You have films in your watchlist waiting to be discovered.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 86400,
        repeats: true,
      },
    });
  };

  const sendTestNotification = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Wildlife Documentary",
        body: "A new conservation film has been added to our collection!",
      },
      trigger: null,
    });
  };

  const Toggle = ({ value, onPress }: { value: boolean; onPress: () => void }) => (
    <Pressable
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={onPress}
    >
      <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Push Notifications</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Stay updated with the latest wildlife documentaries and reminders
          </ThemedText>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.iconContainer}>
                  <Feather name="bell" size={20} color={Colors.dark.accent} />
                </View>
                <View>
                  <ThemedText style={styles.settingLabel}>Enable Notifications</ThemedText>
                  <ThemedText style={styles.settingHint}>
                    {permissionStatus === "granted" 
                      ? "Notifications are enabled"
                      : permissionStatus === "denied"
                      ? "Open settings to enable"
                      : "Receive push notifications"}
                  </ThemedText>
                </View>
              </View>
              <Toggle 
                value={preferences.notificationsEnabled && permissionStatus === "granted"} 
                onPress={toggleNotifications}
              />
            </View>
          </View>
        </View>

        {preferences.notificationsEnabled && permissionStatus === "granted" ? (
          <>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Notification Types</ThemedText>

              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={styles.iconContainer}>
                      <Feather name="film" size={20} color={Colors.dark.primary} />
                    </View>
                    <View>
                      <ThemedText style={styles.settingLabel}>New Film Alerts</ThemedText>
                      <ThemedText style={styles.settingHint}>
                        Get notified when new documentaries are added
                      </ThemedText>
                    </View>
                  </View>
                  <Toggle value={preferences.newFilmAlerts} onPress={toggleNewFilmAlerts} />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={styles.iconContainer}>
                      <Feather name="bookmark" size={20} color={Colors.dark.primary} />
                    </View>
                    <View>
                      <ThemedText style={styles.settingLabel}>Watchlist Reminders</ThemedText>
                      <ThemedText style={styles.settingHint}>
                        Daily reminder to watch saved films
                      </ThemedText>
                    </View>
                  </View>
                  <Toggle value={preferences.watchlistReminders} onPress={toggleWatchlistReminders} />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Pressable 
                style={styles.testButton}
                onPress={sendTestNotification}
              >
                <Feather name="send" size={18} color={Colors.dark.accent} />
                <ThemedText style={styles.testButtonText}>Send Test Notification</ThemedText>
              </Pressable>
            </View>
          </>
        ) : null}

        <View style={styles.infoSection}>
          <Feather name="info" size={16} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.infoText}>
            Notifications help you discover new wildlife content and remind you about films in your watchlist.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  settingHint: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
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
    marginHorizontal: Spacing.lg,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
  },
  testButtonText: {
    fontSize: 16,
    color: Colors.dark.accent,
    marginLeft: Spacing.sm,
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  infoText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
