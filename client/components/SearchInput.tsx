import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search films, species, filmmakers...",
  onClear,
  autoFocus = false,
}: SearchInputProps) {
  const handleClear = () => {
    onChangeText("");
    if (onClear) onClear();
  };

  return (
    <View style={styles.container}>
      <Feather
        name="search"
        size={20}
        color={Colors.dark.textSecondary}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textSecondary}
        style={styles.input}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Feather
            name="x"
            size={18}
            color={Colors.dark.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 48,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
});
