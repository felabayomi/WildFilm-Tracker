import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { getApiUrl } from "@/lib/query-client";

const CATEGORIES = [
  { id: "marine", label: "Marine & Ocean Life" },
  { id: "safari", label: "Safari & Savanna" },
  { id: "rainforest", label: "Rainforest & Jungle" },
  { id: "arctic", label: "Arctic & Polar" },
  { id: "birds", label: "Birds & Avian" },
  { id: "primates", label: "Primates & Great Apes" },
  { id: "predators", label: "Predators & Hunters" },
  { id: "conservation", label: "Conservation & Endangered" },
  { id: "insects", label: "Insects & Invertebrates" },
  { id: "freshwater", label: "Freshwater & Rivers" },
];

const REGIONS = [
  "North America",
  "South America",
  "Canada",
  "Africa",
  "Antarctica",
  "Arctic",
  "Asia",
  "Australia",
  "Europe",
  "Pacific Ocean",
  "Atlantic Ocean",
  "Indian Ocean",
];

export default function SubmitFilmScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [runtime, setRuntime] = useState("");
  const [category, setCategory] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [species, setSpecies] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [watchUrl, setWatchUrl] = useState("");
  const [filmmakerName, setFilmmakerName] = useState("");
  const [filmmakerEmail, setFilmmakerEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [hasRights, setHasRights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availabilityTypes, setAvailabilityTypes] = useState<string[]>([]);
  const [streamingService, setStreamingService] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [stripePaymentLink, setStripePaymentLink] = useState("");

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const toggleAvailability = (type: string) => {
    setAvailabilityTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return "Film title is required";
    if (!year.trim() || isNaN(Number(year))) return "Valid release year is required";
    if (!synopsis.trim()) return "Synopsis is required";
    if (!category) return "Please select a category";
    if (selectedRegions.length === 0) return "Please select at least one region";
    if (!watchUrl.trim()) return "A watch URL is required (YouTube, Vimeo, etc.)";
    if (!filmmakerName.trim()) return "Your name is required";
    if (!filmmakerEmail.trim() || !filmmakerEmail.includes("@")) return "Valid email is required";
    if (!hasRights) return "You must confirm you have rights to submit this film";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Missing Information", validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(new URL("/api/submissions", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          year: year.trim(),
          synopsis: synopsis.trim(),
          runtime: runtime.trim() || null,
          category,
          regions: selectedRegions.join(", "),
          species: species.trim() || null,
          posterUrl: posterUrl.trim() || null,
          trailerUrl: trailerUrl.trim() || null,
          watchUrl: watchUrl.trim(),
          availabilityTypes: availabilityTypes.length > 0 ? availabilityTypes.join(", ") : null,
          streamingService: streamingService.trim() || null,
          rentPrice: rentPrice.trim() || null,
          buyPrice: buyPrice.trim() || null,
          stripePaymentLink: stripePaymentLink.trim() || null,
          filmmakerName: filmmakerName.trim(),
          filmmakerEmail: filmmakerEmail.trim(),
          organization: organization.trim() || null,
          licenseType: licenseType.trim() || null,
          hasRights,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setSubmitted(true);
      } else {
        throw new Error(data.error || "Failed to submit");
      }
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message || "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.successContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={64} color={Colors.dark.success} />
          </View>
          <ThemedText style={styles.successTitle}>Film Submitted!</ThemedText>
          <ThemedText style={styles.successText}>
            Thank you for submitting your wildlife film. Our team will review your submission and get back to you within 5-7 business days.
          </ThemedText>
          <Button
            onPress={() => navigation.goBack()}
            style={styles.doneButton}
          >
            Done
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Submit Your Wildlife Film</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Share your conservation stories with our community. Films are reviewed before being added to the catalogue.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Film Details</ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Title *</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter film title"
            placeholderTextColor={Colors.dark.textSecondary}
            testID="input-film-title"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.md }]}>
            <ThemedText style={styles.label}>Year *</ThemedText>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="2024"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
              testID="input-film-year"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <ThemedText style={styles.label}>Runtime (min)</ThemedText>
            <TextInput
              style={styles.input}
              value={runtime}
              onChangeText={setRuntime}
              placeholder="90"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="number-pad"
              testID="input-film-runtime"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Synopsis *</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={synopsis}
            onChangeText={setSynopsis}
            placeholder="Describe your film..."
            placeholderTextColor={Colors.dark.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="input-film-synopsis"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Featured Species</ThemedText>
          <TextInput
            style={styles.input}
            value={species}
            onChangeText={setSpecies}
            placeholder="e.g., Lions, Elephants, Zebras"
            placeholderTextColor={Colors.dark.textSecondary}
            testID="input-film-species"
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Category *</ThemedText>
        <View style={styles.chipContainer}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                category === cat.id && styles.chipSelected,
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  category === cat.id && styles.chipTextSelected,
                ]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Regions *</ThemedText>
        <View style={styles.chipContainer}>
          {REGIONS.map((region) => (
            <Pressable
              key={region}
              style={[
                styles.chip,
                selectedRegions.includes(region) && styles.chipSelected,
              ]}
              onPress={() => toggleRegion(region)}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  selectedRegions.includes(region) && styles.chipTextSelected,
                ]}
              >
                {region}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Media Links</ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Watch URL *</ThemedText>
          <TextInput
            style={styles.input}
            value={watchUrl}
            onChangeText={setWatchUrl}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor={Colors.dark.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
            testID="input-film-watchurl"
          />
          <ThemedText style={styles.hint}>YouTube, Vimeo, or your own hosting URL</ThemedText>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Trailer URL</ThemedText>
          <TextInput
            style={styles.input}
            value={trailerUrl}
            onChangeText={setTrailerUrl}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor={Colors.dark.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
            testID="input-film-trailerurl"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Poster Image URL</ThemedText>
          <TextInput
            style={styles.input}
            value={posterUrl}
            onChangeText={setPosterUrl}
            placeholder="https://example.com/poster.jpg"
            placeholderTextColor={Colors.dark.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
            testID="input-film-posterurl"
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Availability & Revenue</ThemedText>
        <ThemedText style={styles.sectionHint}>
          How can viewers access your film? This helps us categorize and potentially monetize your content.
        </ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>How is your film available? *</ThemedText>
          <View style={styles.chipContainer}>
            {[
              { id: "free", label: "Free to Watch" },
              { id: "rent", label: "Rent" },
              { id: "buy", label: "Purchase/Buy" },
              { id: "stream", label: "Streaming Service" },
            ].map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.chip,
                  availabilityTypes.includes(type.id) && styles.chipSelected,
                ]}
                onPress={() => toggleAvailability(type.id)}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    availabilityTypes.includes(type.id) && styles.chipTextSelected,
                  ]}
                >
                  {type.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <ThemedText style={styles.hint}>Select all that apply</ThemedText>
        </View>

        {availabilityTypes.includes("stream") ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Streaming Service Name</ThemedText>
            <TextInput
              style={styles.input}
              value={streamingService}
              onChangeText={setStreamingService}
              placeholder="e.g., Netflix, Amazon Prime, Vimeo On Demand"
              placeholderTextColor={Colors.dark.textSecondary}
              testID="input-streaming-service"
            />
            <ThemedText style={styles.hint}>Where can viewers stream your film?</ThemedText>
          </View>
        ) : null}

        {availabilityTypes.includes("rent") ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Rental Price (USD) *</ThemedText>
            <TextInput
              style={styles.input}
              value={rentPrice}
              onChangeText={setRentPrice}
              placeholder="e.g., 4.99"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="decimal-pad"
              testID="input-rent-price"
            />
            <ThemedText style={styles.hint}>How much to rent your film for 48 hours?</ThemedText>
          </View>
        ) : null}

        {availabilityTypes.includes("buy") ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Purchase Price (USD) *</ThemedText>
            <TextInput
              style={styles.input}
              value={buyPrice}
              onChangeText={setBuyPrice}
              placeholder="e.g., 14.99"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="decimal-pad"
              testID="input-buy-price"
            />
            <ThemedText style={styles.hint}>How much to purchase your film permanently?</ThemedText>
          </View>
        ) : null}

        {(availabilityTypes.includes("rent") || availabilityTypes.includes("buy")) ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Stripe Payment Link *</ThemedText>
            <TextInput
              style={styles.input}
              value={stripePaymentLink}
              onChangeText={setStripePaymentLink}
              placeholder="e.g., buy.stripe.com/yourlink"
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
              testID="input-stripe-link"
            />
            <View style={styles.stripeGuideBox}>
              <ThemedText style={styles.stripeGuideTitle}>How to set up Stripe Payment Links:</ThemedText>
              <ThemedText style={styles.stripeGuideText}>
                1. Create a free account at stripe.com{"\n"}
                2. Go to Products and create your film product{"\n"}
                3. Set your price (rental or purchase){"\n"}
                4. Click "Create payment link"{"\n"}
                5. Copy the link and paste it above
              </ThemedText>
              <ThemedText style={styles.stripeGuideNote}>
                Once your film is approved, viewers can purchase directly through your Stripe link. 
                All payments go directly to your Stripe account - WildFilms takes no commission.
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Filmmaker Info</ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Your Name *</ThemedText>
          <TextInput
            style={styles.input}
            value={filmmakerName}
            onChangeText={setFilmmakerName}
            placeholder="Full name"
            placeholderTextColor={Colors.dark.textSecondary}
            testID="input-filmmaker-name"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email *</ThemedText>
          <TextInput
            style={styles.input}
            value={filmmakerEmail}
            onChangeText={setFilmmakerEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.dark.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="input-filmmaker-email"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Organization</ThemedText>
          <TextInput
            style={styles.input}
            value={organization}
            onChangeText={setOrganization}
            placeholder="Production company or organization"
            placeholderTextColor={Colors.dark.textSecondary}
            testID="input-filmmaker-org"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>License Type</ThemedText>
          <TextInput
            style={styles.input}
            value={licenseType}
            onChangeText={setLicenseType}
            placeholder="e.g., Creative Commons, Full Rights"
            placeholderTextColor={Colors.dark.textSecondary}
            testID="input-film-license"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setHasRights(!hasRights)}
        >
          <View style={[styles.checkbox, hasRights && styles.checkboxChecked]}>
            {hasRights ? (
              <Feather name="check" size={14} color="#FFFFFF" />
            ) : null}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            I confirm that I have the rights to submit this film and grant WildFilms permission to feature it. *
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.submitSection}>
        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            "Submit Film for Review"
          )}
        </Button>
        <ThemedText style={styles.submitHint}>
          Submissions are reviewed within 5-7 business days
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.accent,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  hint: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  stripeGuideBox: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  stripeGuideTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.accent,
    marginBottom: Spacing.sm,
  },
  stripeGuideText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  stripeGuideNote: {
    fontSize: 12,
    color: "#7CB97F",
    fontStyle: "italic",
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.backgroundDefault,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSecondary,
  },
  chipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.dark.textSecondary,
    marginRight: Spacing.md,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  submitSection: {
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  submitButton: {
    width: "100%",
  },
  submitHint: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing["2xl"],
  },
  doneButton: {
    minWidth: 150,
  },
});
