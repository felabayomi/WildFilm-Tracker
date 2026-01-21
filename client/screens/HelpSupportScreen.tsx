import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Modal,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";

type HelpSection = "howToUse" | "helpTopics" | null;

const SUPPORT_EMAIL = "wildlifefilm@hotmail.com";

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<HelpSection>(null);

  const handleEmailSupport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const subject = encodeURIComponent("WildFilms Support Request");
    const body = encodeURIComponent("Hi WildFilms Team,\n\nI need help with:\n\n");
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    
    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      console.log("Could not open email client");
    }
  };

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

  const howToUseContent = [
    {
      title: "Discover Films",
      icon: "compass",
      description: "Browse the Discover tab to find featured wildlife films, new releases, and curated collections. Tap any film to see details, watch trailers, and find streaming options.",
    },
    {
      title: "Search & Filter",
      icon: "search",
      description: "Use the Search tab to find specific films. Filter by category (Ocean, Jungle, Safari, etc.), region, or source to narrow down your results.",
    },
    {
      title: "Build Your Watchlist",
      icon: "bookmark",
      description: "Tap the bookmark icon on any film to add it to your Watchlist. Access your saved films anytime from the Watchlist tab.",
    },
    {
      title: "Track What You Watch",
      icon: "check-circle",
      description: "Mark films as watched using the 'Mark as Watched' button on the film details page. Your watch history appears on your Profile.",
    },
    {
      title: "Rate & Review",
      icon: "star",
      description: "After watching a film, rate it using the star rating system. Your ratings help track your favorites and calculate your average score.",
    },
    {
      title: "Share Films",
      icon: "share-2",
      description: "Tap the share button on any film to share it with friends. The app generates a smart summary with streaming info included.",
    },
    {
      title: "Find Where to Watch",
      icon: "tv",
      description: "Each film shows available streaming platforms like Disney+, Netflix, and Prime Video. Tap a service to open it directly.",
    },
    {
      title: "Customize Your Profile",
      icon: "user",
      description: "Personalize your profile with a custom name, bio, and photo. Track your stats including films watched, hours logged, and average rating.",
    },
  ];

  const helpTopicsContent = [
    {
      question: "Why can't I find a specific film?",
      answer: "WildFilms focuses exclusively on wildlife and nature documentaries. General documentaries or fiction films won't appear in search results. If a wildlife film is missing, it may not be in our database yet.",
    },
    {
      question: "How do I remove a film from my watchlist?",
      answer: "Open the film's details page and tap the bookmark icon again to remove it from your watchlist. The icon will change from filled to outlined.",
    },
    {
      question: "Can I sync my data across devices?",
      answer: "Currently, WildFilms stores all data locally on your device. Data doesn't sync between devices. We're considering cloud sync for future updates.",
    },
    {
      question: "Why are some streaming links unavailable?",
      answer: "Streaming availability varies by region and changes frequently. If a service shows as unavailable, the film may have been removed from that platform in your area.",
    },
    {
      question: "How do I reset my watch history?",
      answer: "Go to Profile > Preferences and tap 'Reset Watch History'. This will clear all watched films but keep your watchlist and ratings.",
    },
    {
      question: "How do I change my profile photo?",
      answer: "Tap on your profile picture in the Profile tab. You'll be prompted to select a new image from your photo library. Your photo is stored locally on your device only.",
    },
    {
      question: "Does the app work offline?",
      answer: "Your watchlist and watch history are available offline. However, browsing new films and checking streaming availability requires an internet connection.",
    },
    {
      question: "How do I enable/disable dark mode?",
      answer: "Go to Profile > Preferences and toggle the Dark Mode switch. Your preference is saved automatically.",
    },
    {
      question: "How do I delete all my data?",
      answer: "Go to Profile > Preferences and tap 'Clear All Data'. This removes all your watch history, watchlist, ratings, profile photo, and other customizations.",
    },
    {
      question: "Why am I not receiving notifications?",
      answer: "Check that notifications are enabled in Profile > Notifications. Also ensure WildFilms has notification permissions in your device settings.",
    },
    {
      question: "Why does the app ask for camera access?",
      answer: "WildFilms only requests camera access to let you take a photo for your profile picture. Your photo is stored locally on your device and displayed in the Profile section. The camera is never accessed without your action.",
    },
    {
      question: "Why does the app ask for photo library access?",
      answer: "WildFilms requests photo library access so you can choose an existing photo as your profile picture. We only access photos you explicitly select, and your chosen photo stays on your device.",
    },
    {
      question: "What data does WildFilms collect?",
      answer: "WildFilms stores all data locally on your device only. We do not collect, transmit, or store any personal information on external servers. Your watch history, ratings, and profile photo remain private to your device.",
    },
    {
      question: "Is my profile photo uploaded to a server?",
      answer: "No. Your profile photo is stored locally on your device only. It is never uploaded to any server or shared with anyone.",
    },
  ];

  const getModalContent = () => {
    switch (activeSection) {
      case "howToUse":
        return { title: "How to Use WildFilms", type: "howToUse" as const };
      case "helpTopics":
        return { title: "Help Topics", type: "helpTopics" as const };
      default:
        return { title: "", type: null };
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
            <Feather name="help-circle" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.title}>Help & Support</ThemedText>
          <ThemedText style={styles.subtitle}>
            Learn how to get the most out of WildFilms
          </ThemedText>
        </View>

        <View style={styles.menuContainer}>
          <MenuButton
            icon="book-open"
            label="How to Use the App"
            description="Step-by-step guide to all features"
            onPress={() => setActiveSection("howToUse")}
          />
          <MenuButton
            icon="message-circle"
            label="Help Topics"
            description="Answers to common questions"
            onPress={() => setActiveSection("helpTopics")}
          />
        </View>

        <View style={styles.supportSection}>
          <ThemedText style={styles.sectionTitle}>Contact Support</ThemedText>
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Feather name="mail" size={24} color={Colors.dark.accent} />
            </View>
            <View style={styles.supportInfo}>
              <ThemedText style={styles.supportLabel}>Email Us</ThemedText>
              <ThemedText style={styles.supportEmail}>{SUPPORT_EMAIL}</ThemedText>
              <ThemedText style={styles.supportNote}>
                We typically respond within 24-48 hours
              </ThemedText>
            </View>
          </View>
          <Button onPress={handleEmailSupport} style={styles.emailButton}>
            Send Email
          </Button>
        </View>

        <View style={styles.infoCard}>
          <Feather name="heart" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Thank you for using WildFilms! Your feedback helps us improve the app for wildlife enthusiasts everywhere.
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
              {modalData.type === "howToUse" ? (
                howToUseContent.map((item, index) => (
                  <View key={index} style={styles.guideItem}>
                    <View style={styles.guideIconContainer}>
                      <Feather name={item.icon as any} size={20} color={Colors.dark.accent} />
                    </View>
                    <View style={styles.guideContent}>
                      <ThemedText style={styles.guideTitle}>{item.title}</ThemedText>
                      <ThemedText style={styles.guideDescription}>{item.description}</ThemedText>
                    </View>
                  </View>
                ))
              ) : modalData.type === "helpTopics" ? (
                helpTopicsContent.map((item, index) => (
                  <View key={index} style={styles.faqItem}>
                    <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
                    <ThemedText style={styles.faqAnswer}>{item.answer}</ThemedText>
                  </View>
                ))
              ) : null}
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
  supportSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  supportCard: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  supportInfo: {
    flex: 1,
  },
  supportLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  supportEmail: {
    fontSize: 14,
    color: Colors.dark.accent,
    marginBottom: 4,
  },
  supportNote: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  emailButton: {
    marginTop: Spacing.xs,
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
  guideItem: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  guideIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  faqItem: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
});
