import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

type PolicySection = "privacy" | "terms" | "data" | null;

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<PolicySection>(null);

  const MenuButton = ({
    icon,
    label,
    description,
    onPress,
  }: {
    icon: string;
    label: string;
    description: string;
    onPress: () => void;
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
        <View style={styles.menuButtonText}>
          <ThemedText style={styles.menuButtonLabel}>{label}</ThemedText>
          <ThemedText style={styles.menuButtonDescription}>{description}</ThemedText>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={Colors.dark.textSecondary}
      />
    </Pressable>
  );

  const privacyPolicyContent = `Last updated: January 2026

WildFilms Privacy Policy

1. Information We Collect
WildFilms stores all your data locally on your device. We do not collect, transmit, or store any personal information on external servers.

Local Data Stored:
- Your watch history and watchlist
- Film ratings and preferences
- Profile information (name, bio, photo)
- App preferences (dark mode, notifications)

2. Device Permissions
WildFilms may request the following permissions. Each is optional and only used for specific features:

Camera: Used only to take a photo for your profile picture. Your photo is stored locally on your device and displayed in the Profile section. The camera is never accessed without your explicit action.

Photo Library (Read): Used to let you choose an existing photo as your profile picture. We only access photos you explicitly select.

Photo Library (Save): Used to save screenshots of your favorite wildlife films to your device when you choose to download them.

Microphone: May be used if you record video reviews of wildlife documentaries. Audio is only captured when you explicitly start a recording.

Notifications: Used to send alerts about new wildlife films and watchlist reminders. You control this in Settings.

3. Third-Party Services
WildFilms uses The Movie Database (TMDB) API to fetch film information. When you browse or search for films, requests are made to TMDB servers. Please refer to TMDB's privacy policy for information about their data practices.

4. Data Security
Since all user data is stored locally on your device:
- Your data is protected by your device's security
- No internet connection is required for saved content
- Your data stays private to your device
- Profile photos remain on your device only

5. Data Deletion
You can delete all your data at any time through Settings > Preferences > Clear All Data. Uninstalling the app will also remove all stored data including profile photos.

6. Children's Privacy
WildFilms does not knowingly collect information from children under 13. The app is designed for general audiences interested in wildlife documentaries.

7. Changes to This Policy
We may update this privacy policy from time to time. Changes will be reflected in the "Last updated" date above.

8. Contact Us
For questions about this privacy policy, please reach out through the Help & Support section in the app or email wildlifefilm@hotmail.com.`;

  const termsOfServiceContent = `Last updated: January 2026

WildFilms Terms of Service

1. Acceptance of Terms
By using WildFilms, you agree to these terms of service. If you do not agree, please do not use the app.

2. Description of Service
WildFilms is a mobile application for discovering, tracking, and cataloging wildlife films and nature documentaries. The app provides:
- Film discovery and search
- Personal watchlist management
- Watch history tracking
- Film ratings and reviews

3. User Responsibilities
You agree to:
- Use the app for personal, non-commercial purposes
- Not attempt to reverse engineer or modify the app
- Not use the app for any unlawful purpose
- Respect intellectual property rights

4. Content
Film information, posters, and metadata are provided by The Movie Database (TMDB). WildFilms does not host or stream any video content. Links to streaming services are provided for informational purposes only.

5. Disclaimer
WildFilms is provided "as is" without warranties of any kind. We do not guarantee:
- Accuracy of film information
- Availability of streaming services
- Continuous, uninterrupted service

6. Limitation of Liability
WildFilms and its creators shall not be liable for any damages arising from your use of the app.

7. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of new terms.

8. Governing Law
These terms are governed by applicable local laws.`;

  const dataUsageContent = `Last updated: January 2026

WildFilms Data Usage

How Your Data Is Used

1. Watch History
Your watched films are stored locally to:
- Display your viewing statistics
- Show recently watched films on your profile
- Calculate your average rating

2. Watchlist
Films you add to your watchlist are stored to:
- Help you remember films to watch later
- Provide quick access to saved content

3. Ratings & Reviews
Your film ratings are stored to:
- Display your rating on film detail pages
- Calculate your average rating score
- Personalize your experience

4. Profile Information
Your name, bio, and profile photo are stored to:
- Personalize your profile page
- Make the app feel like yours

5. Preferences
Settings like dark mode and notification preferences are stored to:
- Remember your preferred app appearance
- Respect your notification choices

Device Permissions & How They're Used

Camera Access
WildFilms requests camera access to let you take a photo for your profile picture. Your photo is stored locally on your device and displayed only in the app's Profile section. The camera is never accessed without your explicit action.

Photo Library Access
WildFilms requests photo library access to let you choose an existing photo as your profile picture. Your selected photo is stored locally and displayed in the app's Profile section. We only access photos you explicitly select.

Photo Library Save Access
WildFilms may request permission to save images to your photo library when you choose to download screenshots of your favorite wildlife films.

Microphone Access
WildFilms may request microphone access if you record video reviews of wildlife documentaries. Audio is only captured when you explicitly start a recording. We never access your microphone in the background.

Notifications
WildFilms may send push notifications about new wildlife films matching your interests and watchlist reminders. You can enable or disable notifications at any time in Settings.

Tracking (iOS)
WildFilms uses app tracking data only to provide personalized wildlife film recommendations based on your viewing history within the app. We do not share this data with third parties for advertising.

Data Storage Location
All data is stored locally using AsyncStorage on your device. No personal data is sent to external servers or cloud services. Profile photos remain on your device only.

Data Portability
Currently, WildFilms does not support data export. Your data remains on your device.

Data Retention
Data is retained until you:
- Clear it through Settings
- Uninstall the application

Managing Your Data
You can manage your data through Settings > Preferences:
- Reset Watch History: Clears all watched films
- Clear Watchlist: Removes all saved films
- Clear All Data: Removes all app data and resets to defaults`;

  const getModalContent = () => {
    switch (activeSection) {
      case "privacy":
        return { title: "Privacy Policy", content: privacyPolicyContent };
      case "terms":
        return { title: "Terms of Service", content: termsOfServiceContent };
      case "data":
        return { title: "Data Usage", content: dataUsageContent };
      default:
        return { title: "", content: "" };
    }
  };

  const modalData = getModalContent();

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="shield" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.title}>Privacy & Legal</ThemedText>
          <ThemedText style={styles.subtitle}>
            Learn how WildFilms protects your privacy and handles your data
          </ThemedText>
        </View>

        <View style={styles.menuContainer}>
          <MenuButton
            icon="file-text"
            label="Privacy Policy"
            description="How we protect your information"
            onPress={() => setActiveSection("privacy")}
          />
          <MenuButton
            icon="book"
            label="Terms of Service"
            description="Rules for using WildFilms"
            onPress={() => setActiveSection("terms")}
          />
          <MenuButton
            icon="database"
            label="Data Usage"
            description="What data is stored and how"
            onPress={() => setActiveSection("data")}
          />
        </View>

        <View style={styles.infoCard}>
          <Feather name="lock" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Your data stays on your device. WildFilms does not collect or share personal information with third parties.
          </ThemedText>
        </View>
      </ScrollView>

      <Modal
        visible={activeSection !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveSection(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{modalData.title}</ThemedText>
              <Pressable
                onPress={() => setActiveSection(null)}
                hitSlop={20}
              >
                <Feather name="x" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText style={styles.policyText}>{modalData.content}</ThemedText>
            </ScrollView>
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
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  menuContainer: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.xl,
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
    flex: 1,
  },
  menuButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuButtonText: {
    flex: 1,
  },
  menuButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  menuButtonDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.md,
    lineHeight: 20,
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
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
  },
  modalScroll: {
    flex: 1,
  },
  policyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
});
